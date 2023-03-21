use super::*;

#[derive(Debug, Clone)]
pub(crate) struct State {
  pub db: Arc<Db>,
  pub oauth_client: BasicClient,
  pub store: MemoryStore,
}

impl State {
  pub(crate) async fn new(db: Arc<Db>) -> Result<Self> {
    Ok(Self {
      db,
      oauth_client: auth::oauth_client(),
      store: MemoryStore::new(),
    })
  }
}
