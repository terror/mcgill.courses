use super::*;

#[derive(Parser)]
pub(crate) struct Server {
  #[clap(long, default_value = "admin")]
  db_name: String,
  #[clap(long, default_value = "8000")]
  port: u16,
  #[clap(long, default_value = "false")]
  seed: bool,
}

impl Server {
  pub(crate) async fn run(self, source: PathBuf) -> Result {
    let addr = SocketAddr::from(([127, 0, 0, 1], self.port));

    log::debug!("Listening on port: {}", addr.port());

    let db = Arc::new(Db::connect(&self.db_name).await?);

    if self.seed {
      let clone = db.clone();

      tokio::spawn(async move {
        if let Err(error) = clone.seed(source).await {
          log::error!("error: {error}");
        }
      });
    }

    let session_store = Arc::new(MemoryStore::new());

    axum_server::Server::bind(addr)
      .serve(app(db, session_store).into_make_service())
      .await?;

    Ok(())
  }
}

fn app(db: Arc<Db>, session_store: Arc<MemoryStore>) -> Router {
  Router::new()
    .route("/auth/authorized", get(auth::login_authorized))
    .route("/auth/login", get(auth::microsoft_auth))
    .route("/auth/logout", get(auth::logout))
    .route("/courses", get(courses::get_courses))
    .route("/courses/:id", get(courses::get_course_by_id))
    .route(
      "/reviews",
      get(reviews::get_reviews)
        .delete(reviews::delete_review)
        .post(reviews::add_review)
        .put(reviews::update_review),
    )
    .route("/search", get(search::search))
    .route("/user", get(user::get_user))
    .with_state(State::new(db, session_store))
    .layer(CorsLayer::very_permissive())
}

#[cfg(test)]
mod tests {
  use super::*;
  use axum::body::Body;
  use http::Request;
  use pretty_assertions::assert_eq;
  use serde_json::json;
  use std::sync::atomic::{AtomicUsize, Ordering};
  use tower::{Service, ServiceExt};

  struct TestContext {
    db: Arc<Db>,
    app: Router,
    session_store: Arc<MemoryStore>,
    seed_path: PathBuf,
  }

  const SEED_DIR: &str = "crates/db/seeds/mini.json";

  impl TestContext {
    async fn new() -> Self {
      dotenv().ok();
      static TEST_DATABASE_NUMBER: AtomicUsize = AtomicUsize::new(0);

      let test_database_number =
        TEST_DATABASE_NUMBER.fetch_add(1, Ordering::Relaxed);

      let db_name = format!(
        "mcgill-gg-test-{}-{}",
        std::time::SystemTime::now()
          .duration_since(std::time::SystemTime::UNIX_EPOCH)
          .unwrap()
          .as_millis(),
        test_database_number,
      );

      let db = Arc::new(Db::connect(&db_name).await.unwrap());
      let session_store = Arc::new(MemoryStore::new());
      let app = app(db.clone(), session_store.clone());
      let seed_path = PathBuf::from(SEED_DIR);

      TestContext {
        db,
        app,
        session_store,
        seed_path,
      }
    }
  }

  async fn mock_login(
    session_store: Arc<MemoryStore>,
    id: &str,
    mail: &str,
  ) -> String {
    let mut session = Session::new();
    session.insert("user", User::new(id, mail)).unwrap();

    let cookie = session_store.store_session(session).await.unwrap().unwrap();
    format!("{}={}", COOKIE_NAME, cookie)
  }

  #[tokio::test]
  async fn courses_route_works() {
    let TestContext {
      db, app, seed_path, ..
    } = TestContext::new().await;
    db.seed(seed_path).await.unwrap();
    let response = app
      .oneshot(
        Request::builder()
          .uri("/courses")
          .body(Body::empty())
          .unwrap(),
      )
      .await
      .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = hyper::body::to_bytes(response.into_body()).await.unwrap();
    let body: Vec<Course> = serde_json::from_slice(&body).unwrap();

    assert_eq!(body, db.courses(None, None).await.unwrap());
  }

  #[tokio::test]
  async fn courses_route_offset_limit() {
    let TestContext {
      db, app, seed_path, ..
    } = TestContext::new().await;
    db.seed(seed_path).await.unwrap();

    let response = app
      .oneshot(
        Request::builder()
          .uri("/courses?limit=10&offset=40")
          .body(Body::empty())
          .unwrap(),
      )
      .await
      .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = hyper::body::to_bytes(response.into_body()).await.unwrap();
    let body: Vec<Course> = serde_json::from_slice(&body).unwrap();

    assert_eq!(body, db.courses(Some(10), Some(40)).await.unwrap());
  }

  #[tokio::test]
  async fn courses_route_does_not_allow_negative() {
    let TestContext { app, .. } = TestContext::new().await;

    let response = app
      .oneshot(
        Request::builder()
          .uri("/courses?limit=-10&offset=-10")
          .body(Body::empty())
          .unwrap(),
      )
      .await
      .unwrap();

    assert_eq!(response.status(), StatusCode::BAD_REQUEST);
  }

  #[tokio::test]
  async fn course_by_id_works() {
    let TestContext {
      db, app, seed_path, ..
    } = TestContext::new().await;
    db.seed(seed_path).await.unwrap();

    let response = app
      .oneshot(
        Request::builder()
          .uri("/courses/COMP202")
          .body(Body::empty())
          .unwrap(),
      )
      .await
      .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = hyper::body::to_bytes(response.into_body()).await.unwrap();
    let body: Course = serde_json::from_slice(&body).unwrap();

    assert_eq!(
      body,
      db.find_course_by_id("COMP202").await.unwrap().unwrap()
    );
  }

  #[tokio::test]
  async fn course_by_id_invalid_course_code() {
    let TestContext {
      db, app, seed_path, ..
    } = TestContext::new().await;
    db.seed(seed_path).await.unwrap();

    let response = app
      .oneshot(
        Request::builder()
          .uri("/courses/COMP1337")
          .body(Body::empty())
          .unwrap(),
      )
      .await
      .unwrap();

    assert_eq!(response.status(), StatusCode::NOT_FOUND);

    let body = hyper::body::to_bytes(response.into_body()).await.unwrap();
    let body: Option<Course> = serde_json::from_slice(&body).unwrap();

    assert_eq!(body, None);
  }

  #[tokio::test]
  async fn unauthenticated_cant_add_review() {
    let TestContext {
      db, app, seed_path, ..
    } = TestContext::new().await;
    db.seed(seed_path).await.unwrap();

    let review = json!({"content": "test", "course_id": "MATH240"});

    let response = app
      .oneshot(
        Request::builder()
          .method(http::Method::POST)
          .uri("/reviews")
          .body(Body::from(review.to_string()))
          .unwrap(),
      )
      .await
      .unwrap();

    assert_eq!(response.status(), StatusCode::TEMPORARY_REDIRECT);
  }

  #[tokio::test]
  async fn can_add_review() {
    let TestContext {
      db,
      app,
      session_store,
      seed_path,
    } = TestContext::new().await;
    db.seed(seed_path).await.unwrap();

    let cookie = mock_login(session_store, "test", "test@mail.mcgill.ca").await;
    let review = json!({"content": "test", "course_id": "MATH240"});

    let response = app
      .oneshot(
        Request::builder()
          .method(http::Method::POST)
          .header("Cookie", cookie)
          .header("Content-Type", "application/json")
          .uri("/reviews")
          .body(Body::from(review.to_string()))
          .unwrap(),
      )
      .await
      .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
    assert_eq!(db.find_reviews_by_user_id("test").await.unwrap().len(), 1);
  }

  #[tokio::test]
  async fn can_delete_review() {
    let TestContext {
      db,
      mut app,
      session_store,
      seed_path,
    } = TestContext::new().await;
    db.seed(seed_path).await.unwrap();

    let cookie = mock_login(session_store, "test", "test@mail.mcgill.ca").await;
    let review = json!({"content": "test", "course_id": "MATH240"});

    let response = app
      .call(
        Request::builder()
          .method(http::Method::POST)
          .header("Cookie", cookie.clone())
          .header("Content-Type", "application/json")
          .uri("/reviews")
          .body(Body::from(review.to_string()))
          .unwrap(),
      )
      .await
      .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
    assert_eq!(db.find_reviews_by_user_id("test").await.unwrap().len(), 1);

    let delete_body = json!({"user_id": "test", "course_id": "MATH240"});

    let response = app
      .call(
        Request::builder()
          .method(http::Method::DELETE)
          .header("Cookie", cookie.clone())
          .uri("/reviews")
          .body(Body::from(delete_body.to_string()))
          .unwrap(),
      )
      .await
      .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
    assert_eq!(db.find_reviews_by_user_id("test").await.unwrap().len(), 0);
  }

  #[tokio::test]
  async fn can_update_review() {
    let TestContext {
      db,
      mut app,
      session_store,
      seed_path,
    } = TestContext::new().await;
    db.seed(seed_path).await.unwrap();

    let cookie = mock_login(session_store, "test", "test@mail.mcgill.ca").await;
    let review = json!({"content": "test", "course_id": "MATH240"});

    app
      .call(
        Request::builder()
          .method(http::Method::POST)
          .header("Cookie", cookie.clone())
          .header("Content-Type", "application/json")
          .uri("/reviews")
          .body(Body::from(review.to_string()))
          .unwrap(),
      )
      .await
      .unwrap();

    let update_body = json!({"content": "updated", "course_id": "MATH240"});
    let response = app
      .call(
        Request::builder()
          .method(http::Method::PUT)
          .header("Cookie", cookie.clone())
          .uri("/reviews")
          .body(Body::from(update_body.to_string()))
          .unwrap(),
      )
      .await
      .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
    assert_eq!(
      db.find_review("MATH240", "test")
        .await
        .unwrap()
        .unwrap()
        .content,
      "updated"
    );
  }

  #[tokio::test]
  async fn can_get_reviews_by_user_id() {
    let TestContext {
      db,
      mut app,
      session_store,
      seed_path,
    } = TestContext::new().await;
    db.seed(seed_path).await.unwrap();
    let cookie =
      mock_login(session_store.clone(), "test", "test@mail.mcgill.ca").await;
    let cookie2 =
      mock_login(session_store, "test2", "test2@mail.mcgill.ca").await;

    let reviews = vec![
      json!({"content": "test", "course_id": "COMP202"}),
      json!({"content": "test2", "course_id": "MATH240"}),
      json!({"content": "test3", "course_id": "COMP252"}),
    ];

    let review2 = json!({"content": "test4", "course_id": "COMP202"});

    for review in reviews {
      app
        .call(
          Request::builder()
            .method(http::Method::POST)
            .header("Cookie", cookie.clone())
            .header("Content-Type", "application/json")
            .uri("/reviews")
            .body(Body::from(review.to_string()))
            .unwrap(),
        )
        .await
        .unwrap();
    }

    app
      .call(
        Request::builder()
          .method(http::Method::POST)
          .header("Cookie", cookie2)
          .header("Content-Type", "application/json")
          .uri("/reviews")
          .body(Body::from(review2.to_string()))
          .unwrap(),
      )
      .await
      .unwrap();

    let response = app
      .call(
        Request::builder()
          .method(http::Method::GET)
          .uri("/reviews?user_id=test")
          .body(Body::empty())
          .unwrap(),
      )
      .await
      .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = hyper::body::to_bytes(response.into_body()).await.unwrap();
    let reviews: Vec<Review> = serde_json::from_slice(&body).unwrap();

    assert_eq!(reviews.len(), 3);
  }

  #[tokio::test]
  async fn can_get_reviews_by_course_id() {
    let TestContext {
      db,
      mut app,
      session_store,
      seed_path,
    } = TestContext::new().await;

    db.seed(seed_path).await.unwrap();

    let cookies = vec![
      mock_login(session_store.clone(), "test", "test@mail.mcgill.ca").await,
      mock_login(session_store, "test2", "test2@mail.mcgill.ca").await,
    ];

    let reviews = vec![
      json!({"content": "test", "course_id": "MATH240"}),
      json!({"content": "test2", "course_id": "MATH240"}),
    ];

    for (cookie, review) in cookies.iter().zip(reviews) {
      app
        .call(
          Request::builder()
            .method(http::Method::POST)
            .header("Cookie", cookie.clone())
            .header("Content-Type", "application/json")
            .uri("/reviews")
            .body(Body::from(review.to_string()))
            .unwrap(),
        )
        .await
        .unwrap();
    }

    let response = app
      .call(
        Request::builder()
          .method(http::Method::GET)
          .uri("/reviews?course_id=MATH240")
          .body(Body::empty())
          .unwrap(),
      )
      .await
      .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = hyper::body::to_bytes(response.into_body()).await.unwrap();
    let reviews: Vec<Review> = serde_json::from_slice(&body).unwrap();

    assert_eq!(reviews.len(), 2)
  }
}
