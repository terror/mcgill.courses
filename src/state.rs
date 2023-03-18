use super::*;

#[derive(Debug, Clone)]
pub(crate) struct State {
  _db: Db,
}

impl State {
  pub(crate) async fn new(config: Config, source: PathBuf) -> Result<Self> {
    Ok(Self {
      _db: Db::connect(&config, source).await?,
    })
  }
}
