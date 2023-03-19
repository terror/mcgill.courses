use super::*;

#[derive(Debug, Clone)]
pub(crate) struct State {
  _db: Arc<Db>,
  pub oauth_client: BasicClient,
  pub store: MemoryStore,
}

impl State {
  pub(crate) async fn new(
    db: Arc<Db>,
    oauth_client: BasicClient,
  ) -> Result<Self> {
    Ok(Self {
      _db: db,
      oauth_client,
      store: MemoryStore::new(),
    })
  }
}
