use super::*;

#[derive(Parser)]
pub(crate) struct Server {
  #[clap(long, default_value = "8000")]
  port: u16,
  #[clap(long, default_value = "false")]
  seed: bool,
}

impl Server {
  pub(crate) async fn run(self, source: PathBuf) -> Result {
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
          .with_state(
            State::new(Config {
              env: Env::load()?,
              source,
              seed: self.seed,
            })
            .await?,
          )
          .into_make_service(),
      )
      .await?;

    Ok(())
  }
}
