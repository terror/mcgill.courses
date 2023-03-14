use super::*;

#[derive(Parser)]
pub(crate) struct Server {
  #[clap(long, default_value = "8000")]
  port: u16,
}

impl Server {
  pub(crate) async fn run(self, source: PathBuf) -> Result {
    log::info!("Source: {}", source.display());

    let addr = SocketAddr::from(([127, 0, 0, 1], self.port));

    log::debug!("Listening on port: {}", addr.port());

    axum_server::Server::bind(addr)
      .serve(
        Router::new()
          .layer(
            CorsLayer::new()
              .allow_methods([Method::GET])
              .allow_origin(Any),
          )
          .with_state(State::new(Config::load()?).await?)
          .into_make_service(),
      )
      .await?;

    Ok(())
  }
}
