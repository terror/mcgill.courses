use super::*;

#[derive(Debug, Clone)]
pub(crate) struct State {
  pub db: Arc<Db>,
  pub oauth_client: BasicClient,
  pub store: MemoryStore,
}

impl FromRef<State> for BasicClient {
  fn from_ref(state: &State) -> Self {
    state.oauth_client.clone()
  }
}

impl FromRef<State> for MemoryStore {
  fn from_ref(state: &State) -> Self {
    state.store.clone()
  }
}

impl State {
  pub(crate) async fn new(db: Arc<Db>) -> Self {
    Self {
      db,
      oauth_client: auth::oauth_client(),
      store: MemoryStore::new(),
    }
  }
}
