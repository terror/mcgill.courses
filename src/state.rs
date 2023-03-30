use super::*;

#[derive(Debug, Clone)]
pub(crate) struct State {
  pub(crate) db: Arc<Db>,
  pub(crate) oauth_client: BasicClient,
  pub(crate) request_client: reqwest::Client,
  pub(crate) session_store: MemoryStore,
}

impl FromRef<State> for Arc<Db> {
  fn from_ref(state: &State) -> Self {
    state.db.clone()
  }
}

impl FromRef<State> for BasicClient {
  fn from_ref(state: &State) -> Self {
    state.oauth_client.clone()
  }
}

impl FromRef<State> for MemoryStore {
  fn from_ref(state: &State) -> Self {
    state.session_store.clone()
  }
}

impl State {
  pub(crate) fn new(db: Arc<Db>) -> Self {
    Self {
      db,
      oauth_client: BasicClient::new(
        ClientId::new(
          env::var("MS_CLIENT_ID")
            .expect("Missing the MS_CLIENT_ID environment variable"),
        ),
        Some(ClientSecret::new(
          env::var("MS_CLIENT_SECRET")
            .expect("Missing the MS_CLIENT_SECRET environment variable."),
        )),
        AuthUrl::new(
          "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
            .to_string(),
        )
        .expect("Invalid authorization URL"),
        Some(
          TokenUrl::new(
            "https://login.microsoftonline.com/common/oauth2/v2.0/token"
              .to_string(),
          )
          .expect("Invalid token endpoint URL"),
        ),
      )
      .set_auth_type(AuthType::RequestBody)
      .set_redirect_uri(
        RedirectUrl::new(
          env::var("MS_REDIRECT_URI")
            .expect("Missing the MS_REDIRECT_URI environment variable."),
        )
        .expect("Invalid redirect URL"),
      ),
      request_client: reqwest::Client::new(),
      session_store: MemoryStore::new(),
    }
  }
}
