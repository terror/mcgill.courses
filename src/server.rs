use super::*;

#[derive(Parser)]
pub(crate) struct Server {
  #[clap(long, default_value = "admin", help = "Database name")]
  db_name: String,
  #[clap(long, default_value = "8000", help = "Port to listen on")]
  port: u16,
  #[clap(long, default_value = "false", help = "Seed the database")]
  initialize: bool,
  #[clap(
    long,
    default_value = "false",
    help = "Enabled multithreaded seeding"
  )]
  multithreaded: bool,
  #[clap(long, default_value = "false", help = "Skip course seeding")]
  skip_courses: bool,
}

impl Server {
  pub(crate) async fn run(self, source: PathBuf) -> Result {
    let addr = SocketAddr::from(([127, 0, 0, 1], self.port));

    debug!("Listening on port: {}", addr.port());

    let db = Arc::new(Db::connect(&self.db_name).await?);

    if self.initialize {
      let clone = db.clone();

      tokio::spawn(async move {
        if let Err(error) = clone
          .initialize(InitializeOptions {
            multithreaded: self.multithreaded,
            skip_courses: self.skip_courses,
            source: source.clone(),
          })
          .await
        {
          error!("error: {error}");
        }
      });
    }

    axum_server::Server::bind(addr)
      .serve(Self::app(db, None).await?.into_make_service())
      .await?;

    Ok(())
  }

  async fn app(
    db: Arc<Db>,
    session_store: Option<MongodbSessionStore>,
  ) -> Result<Router> {
    Ok(
      Router::new()
        .route("/auth/authorized", get(auth::login_authorized))
        .route("/auth/login", get(auth::microsoft_auth))
        .route("/auth/logout", get(auth::logout))
        .route("/courses", post(courses::get_courses))
        .route("/courses/:id", get(courses::get_course_by_id))
        .route("/instructors/:name", get(instructors::get_instructor))
        .route(
          "/interactions",
          get(interactions::get_interactions)
            .post(interactions::add_interaction)
            .delete(interactions::remove_interaction),
        )
        .route(
          "/reviews",
          get(reviews::get_reviews)
            .delete(reviews::delete_review)
            .post(reviews::add_review)
            .put(reviews::update_review),
        )
        .route("/reviews/:id", get(reviews::get_review))
        .route("/search", get(search::search))
        .route("/user", get(user::get_user))
        .with_state(State::new(db, session_store).await?)
        .layer(CorsLayer::very_permissive()),
    )
  }
}

#[cfg(test)]
mod tests {
  use http::Method;

  use {
    super::*,
    axum::body::Body,
    http::Request,
    pretty_assertions::assert_eq,
    serde_json::json,
    std::sync::atomic::{AtomicUsize, Ordering},
    tower::{Service, ServiceExt},
  };

  struct TestContext {
    app: Router,
    db: Arc<Db>,
    session_store: MongodbSessionStore,
  }

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

      let session_store = MongodbSessionStore::new(
        "mongodb://localhost:27017",
        &db.name(),
        "store",
      )
      .await
      .unwrap();

      let app = Server::app(db.clone(), Some(session_store.clone()))
        .await
        .unwrap();

      TestContext {
        app,
        db,
        session_store,
      }
    }
  }

  fn seed() -> PathBuf {
    PathBuf::from("crates/db/seeds/mini.json")
  }

  async fn mock_login(
    session_store: MongodbSessionStore,
    id: &str,
    mail: &str,
  ) -> String {
    let mut session = Session::new();

    session.insert("user", User::new(id, mail)).unwrap();

    format!(
      "{}={}",
      COOKIE_NAME,
      session_store.store_session(session).await.unwrap().unwrap()
    )
  }

  #[tokio::test]
  async fn courses_route_works() {
    let TestContext { db, app, .. } = TestContext::new().await;

    db.initialize(InitializeOptions {
      source: seed(),
      ..Default::default()
    })
    .await
    .unwrap();

    let body = json!({
      "subjects": None::<Vec<String>>,
      "levels": None::<Vec<String>>,
      "terms": None::<Vec<String>>,
    });

    let response = app
      .oneshot(
        Request::builder()
          .method(Method::POST)
          .uri("/courses")
          .header("Content-Type", "application/json")
          .body(Body::from(body.to_string()))
          .unwrap(),
      )
      .await
      .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    assert_eq!(
      serde_json::from_slice::<Vec<Course>>(
        &hyper::body::to_bytes(response.into_body()).await.unwrap()
      )
      .unwrap(),
      db.courses(None, None, None, None, None).await.unwrap()
    );
  }

  #[tokio::test]
  async fn courses_route_offset_limit() {
    let TestContext { db, app, .. } = TestContext::new().await;

    db.initialize(InitializeOptions {
      source: seed(),
      ..Default::default()
    })
    .await
    .unwrap();

    let body = json!({
      "subjects": None::<Vec<String>>,
      "levels": None::<Vec<String>>,
      "terms": None::<Vec<String>>,
    });

    let response = app
      .oneshot(
        Request::builder()
          .method(Method::POST)
          .uri("/courses?limit=10&offset=40")
          .header("Content-Type", "application/json")
          .body(Body::from(body.to_string()))
          .unwrap(),
      )
      .await
      .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    assert_eq!(
      serde_json::from_slice::<Vec<Course>>(
        &hyper::body::to_bytes(response.into_body()).await.unwrap()
      )
      .unwrap(),
      db.courses(Some(10), Some(40), None, None, None)
        .await
        .unwrap()
    );
  }

  #[tokio::test]
  async fn courses_route_does_not_allow_negative() {
    let TestContext { app, .. } = TestContext::new().await;

    let body = json!({
      "subjects": None::<Vec<String>>,
      "levels": None::<Vec<String>>,
      "terms": None::<Vec<String>>,
    });

    let response = app
      .oneshot(
        Request::builder()
          .method(Method::POST)
          .uri("/courses?limit=-10&offset=-10")
          .header("Content-Type", "application/json")
          .body(Body::from(body.to_string()))
          .unwrap(),
      )
      .await
      .unwrap();

    assert_eq!(response.status(), StatusCode::BAD_REQUEST);
  }

  #[tokio::test]
  async fn course_by_id_works() {
    let TestContext { db, app, .. } = TestContext::new().await;

    db.initialize(InitializeOptions {
      source: seed(),
      ..Default::default()
    })
    .await
    .unwrap();

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

    assert_eq!(
      serde_json::from_slice::<Course>(
        &hyper::body::to_bytes(response.into_body()).await.unwrap()
      )
      .unwrap(),
      db.find_course_by_id("COMP202").await.unwrap().unwrap()
    );
  }

  #[tokio::test]
  async fn course_by_id_invalid_course_code() {
    let TestContext { db, app, .. } = TestContext::new().await;

    db.initialize(InitializeOptions {
      source: seed(),
      ..Default::default()
    })
    .await
    .unwrap();

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

    assert_eq!(
      serde_json::from_slice::<Option<Course>>(
        &hyper::body::to_bytes(response.into_body()).await.unwrap()
      )
      .unwrap(),
      None
    );
  }

  #[tokio::test]
  async fn unauthenticated_cant_add_review() {
    let TestContext { db, app, .. } = TestContext::new().await;

    db.initialize(InitializeOptions {
      source: seed(),
      ..Default::default()
    })
    .await
    .unwrap();

    let response = app
      .oneshot(
        Request::builder()
          .method(http::Method::POST)
          .uri("/reviews")
          .body(Body::from(
            json!({"content": "test", "course_id": "MATH240"}).to_string(),
          ))
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
      ..
    } = TestContext::new().await;

    db.initialize(InitializeOptions {
      source: seed(),
      ..Default::default()
    })
    .await
    .unwrap();

    let review = json!({
      "content": "test",
      "course_id": "MATH240",
      "instructors": ["Adrian Roshan Vetta"],
      "rating": 5,
      "difficulty": 5
    })
    .to_string();

    let response = app
      .oneshot(
        Request::builder()
          .method(http::Method::POST)
          .header(
            "Cookie",
            mock_login(session_store, "test", "test@mail.mcgill.ca").await,
          )
          .header("Content-Type", "application/json")
          .uri("/reviews")
          .body(Body::from(review))
          .unwrap(),
      )
      .await
      .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
    assert_eq!(db.find_reviews_by_user_id("test").await.unwrap().len(), 1);
  }

  #[tokio::test]
  async fn throws_error_when_invalid_instructor() {
    let TestContext {
      db,
      app,
      session_store,
      ..
    } = TestContext::new().await;

    db.initialize(InitializeOptions {
      source: seed(),
      ..Default::default()
    })
    .await
    .unwrap();

    let review = json!({
      "content": "test",
      "course_id": "MATH240",
      "instructors": ["Adrian Roshan Vetta", "lmao"],
      "rating": 5,
      "difficulty": 5
    })
    .to_string();

    let response = app
      .oneshot(
        Request::builder()
          .method(http::Method::POST)
          .header(
            "Cookie",
            mock_login(session_store, "test", "test@mail.mcgill.ca").await,
          )
          .header("Content-Type", "application/json")
          .uri("/reviews")
          .body(Body::from(review))
          .unwrap(),
      )
      .await
      .unwrap();

    assert_eq!(response.status(), StatusCode::INTERNAL_SERVER_ERROR);
  }

  #[tokio::test]
  async fn can_delete_review() {
    let TestContext {
      db,
      mut app,
      session_store,
      ..
    } = TestContext::new().await;

    db.initialize(InitializeOptions {
      source: seed(),
      ..Default::default()
    })
    .await
    .unwrap();

    let cookie = mock_login(session_store, "test", "test@mail.mcgill.ca").await;

    let review = json!({
      "content": "test",
      "course_id": "MATH240",
      "instructors": ["Adrian Roshan Vetta"],
      "rating": 5,
      "difficulty": 5
    })
    .to_string();

    let response = app
      .call(
        Request::builder()
          .method(http::Method::POST)
          .header("Cookie", cookie.clone())
          .header("Content-Type", "application/json")
          .uri("/reviews")
          .body(Body::from(review))
          .unwrap(),
      )
      .await
      .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
    assert_eq!(db.find_reviews_by_user_id("test").await.unwrap().len(), 1);

    let response = app
      .call(
        Request::builder()
          .method(http::Method::DELETE)
          .header("Cookie", cookie.clone())
          .header("Content-Type", "application/json")
          .uri("/reviews")
          .body(Body::from(json!({"course_id": "MATH240"}).to_string()))
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
      ..
    } = TestContext::new().await;

    db.initialize(InitializeOptions {
      source: seed(),
      ..Default::default()
    })
    .await
    .unwrap();

    let cookie = mock_login(session_store, "test", "test@mail.mcgill.ca").await;

    let review = json!({
        "content": "test",
        "course_id": "MATH240",
        "instructors": ["Adrian Roshan Vetta"],
        "rating": 1,
        "difficulty": 5
    })
    .to_string();

    app
      .call(
        Request::builder()
          .method(http::Method::POST)
          .header("Cookie", cookie.clone())
          .header("Content-Type", "application/json")
          .uri("/reviews")
          .body(Body::from(review))
          .unwrap(),
      )
      .await
      .unwrap();

    let review = json!({
      "content": "updated",
      "course_id": "MATH240",
      "instructors": ["Jeremy Macdonald"],
      "rating": 5,
      "difficulty": 2
    })
    .to_string();

    let response = app
      .call(
        Request::builder()
          .method(http::Method::PUT)
          .header("Cookie", cookie.clone())
          .header("Content-Type", "application/json")
          .uri("/reviews")
          .body(Body::from(review))
          .unwrap(),
      )
      .await
      .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let review = db.find_review("MATH240", "test").await.unwrap().unwrap();

    assert_eq!(review.content, "updated");
    assert_eq!(review.instructors, vec![String::from("Jeremy Macdonald")]);
    assert_eq!(review.rating, 5);
  }

  #[tokio::test]
  async fn can_get_reviews_by_user_id() {
    let TestContext {
      db,
      mut app,
      session_store,
      ..
    } = TestContext::new().await;

    db.initialize(InitializeOptions {
      source: seed(),
      ..Default::default()
    })
    .await
    .unwrap();

    let reviews = vec![
      json!({
        "content": "test",
        "course_id": "COMP202",
        "instructors": ["Jonathan Campbell"],
        "rating": 5,
        "difficulty": 5
      }),
      json!({
        "content": "test2",
        "course_id": "MATH240",
        "instructors": ["Adrian Roshan Vetta"],
        "rating": 5,
        "difficulty": 5
      }),
      json!({
        "content": "test3",
        "course_id": "COMP252",
        "instructors": ["Luc P Devroye"],
        "rating": 5,
        "difficulty": 5
      }),
    ];

    for review in reviews {
      app
        .call(
          Request::builder()
            .method(http::Method::POST)
            .header(
              "Cookie",
              mock_login(session_store.clone(), "test", "test@mail.mcgill.ca")
                .await,
            )
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
          .header(
            "Cookie",
            mock_login(session_store, "test2", "test2@mail.mcgill.ca").await,
          )
          .header("Content-Type", "application/json")
          .uri("/reviews")
          .body(Body::from(
            json!({"content": "test4", "course_id": "COMP202"}).to_string(),
          ))
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

    assert_eq!(
      serde_json::from_slice::<Vec<Review>>(
        &hyper::body::to_bytes(response.into_body()).await.unwrap()
      )
      .unwrap()
      .len(),
      3
    );
  }

  #[tokio::test]
  async fn can_get_reviews_by_course_id() {
    let TestContext {
      db,
      mut app,
      session_store,
      ..
    } = TestContext::new().await;

    db.initialize(InitializeOptions {
      source: seed(),
      ..Default::default()
    })
    .await
    .unwrap();

    let cookies = vec![
      mock_login(session_store.clone(), "test", "test@mail.mcgill.ca").await,
      mock_login(session_store, "test2", "test2@mail.mcgill.ca").await,
    ];

    let reviews = vec![
      json!({
        "content": "test",
        "course_id": "MATH240",
        "instructors": ["Adrian Roshan Vetta"],
        "rating": 5,
        "difficulty": 5
      }),
      json!({
         "content": "test2",
         "course_id": "MATH240",
         "instructors": ["Adrian Roshan Vetta"],
         "rating": 5,
         "difficulty": 5
      }),
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

    assert_eq!(
      serde_json::from_slice::<Vec<Review>>(
        &hyper::body::to_bytes(response.into_body()).await.unwrap()
      )
      .unwrap()
      .len(),
      2
    )
  }
}
