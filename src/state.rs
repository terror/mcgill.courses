use super::*;

#[derive(Debug, Clone)]
pub(crate) struct State {
  db: Db,
}

impl State {
  pub(crate) async fn new(config: Config) -> Result<Self> {
    Ok(Self {
      db: Db::connect(&config).await?,
    })
  }
}
