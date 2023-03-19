use super::*;

#[derive(Debug, Clone)]
pub(crate) struct State {
  _db: Arc<Db>,
}

impl State {
  pub(crate) async fn new(db: Arc<Db>) -> Result<Self> {
    Ok(Self { _db: db })
  }
}
