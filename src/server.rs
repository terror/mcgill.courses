use super::*;

use axum::extract::Query;

#[derive(Parser)]
pub(crate) struct Server {
  #[clap(long, default_value = "admin")]
  db_name: String,
  #[clap(long, default_value = "8000")]
  port: u16,
  #[clap(long, default_value = "false")]
  seed: bool,
}

#[derive(Deserialize)]
pub(crate) struct SearchParams {
  pub(crate) query: String,
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

    axum_server::Server::bind(addr)
      .serve(
        Router::new()
          .route("/courses", get(Self::courses))
          .route("/search", get(Self::search))
          .with_state(State::new(db).await?)
          .layer(CorsLayer::permissive())
          .into_make_service(),
      )
      .await?;

    Ok(())
  }

  pub(crate) async fn courses(
    AppState(state): AppState<State>,
  ) -> Result<impl IntoResponse> {
    Ok(Json(state.db.courses().await?))
  }

  pub(crate) async fn search(
    Query(params): Query<SearchParams>,
    AppState(state): AppState<State>,
  ) -> impl IntoResponse {
    match state.db.search(&params.query).await {
      Ok(payload) => (StatusCode::OK, Json(Some(payload))),
      Err(error) => {
        eprintln!("Error serving request for query {}: {error}", params.query);
        (StatusCode::INTERNAL_SERVER_ERROR, Json(None))
      }
    }
  }
}
