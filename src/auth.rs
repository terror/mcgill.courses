use crate::state;
use async_session::{Session, SessionStore};
use axum::{
  extract::{FromRef, Query, State as AppState},
  response::{IntoResponse, Redirect},
};
use http::{header::SET_COOKIE, HeaderMap};
use oauth2::{
  basic::BasicClient, reqwest::async_http_client, AuthType, AuthUrl,
  AuthorizationCode, ClientId, ClientSecret, CsrfToken, RedirectUrl, Scope,
  TokenResponse, TokenUrl,
};
use serde::{Deserialize, Serialize};
use std::env;

static COOKIE_NAME: &str = "SESSION";

pub(crate) fn oauth_client() -> BasicClient {
  let client_id = env::var("MS_CLIENT_ID")
    .expect("Missing the MS_CLIENT_ID environment variable");
  let client_secret = env::var("MS_CLIENT_SECRET")
    .expect("Missing the MS_CLIENT_SECRET environment variable.");
  let auth_url = AuthUrl::new(
    "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
      .to_string(),
  )
  .expect("Invalid authorization URL");
  let token_url = TokenUrl::new(
    "https://login.microsoftonline.com/common/oauth2/v2.0/token".to_string(),
  )
  .expect("Invalid token endpoint URL");
  let redirect_uri = env::var("MS_REDIRECT_URI")
    .expect("Missing the MS_REDIRECT_URI environment variable.");

  BasicClient::new(
    ClientId::new(client_id),
    Some(ClientSecret::new(client_secret)),
    auth_url,
    Some(token_url),
  )
  .set_auth_type(AuthType::RequestBody)
  .set_redirect_uri(
    RedirectUrl::new(redirect_uri).expect("Invalid redirect URL"),
  )
}

impl FromRef<state::State> for BasicClient {
  fn from_ref(state: &state::State) -> Self {
    state.oauth_client.clone()
  }
}

pub(crate) async fn microsoft_auth(
  AppState(client): AppState<BasicClient>,
) -> impl IntoResponse {
  let (authorize_url, _csrf_token) = client
    .authorize_url(CsrfToken::new_random)
    .add_scope(Scope::new(String::from("openid")))
    .add_scope(Scope::new(String::from("User.Read")))
    .url();

  Redirect::to(authorize_url.as_ref())
}

#[derive(Debug, Serialize, Deserialize)]
pub struct User {
  id: String,
}

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
pub struct AuthRequest {
  code: String,
  state: String,
}

pub(crate) async fn login_authorized(
  Query(query): Query<AuthRequest>,
  AppState(state): AppState<state::State>,
) -> impl IntoResponse {
  let token = state
    .oauth_client
    .exchange_code(AuthorizationCode::new(query.code.clone()))
    .request_async(async_http_client)
    .await
    .unwrap();

  let client = reqwest::Client::new();
  let user = client
    .get("https://graph.microsoft.com/v1.0/me")
    .bearer_auth(token.access_token().secret())
    .send()
    .await
    .unwrap()
    .json::<User>()
    .await
    .unwrap();

  let mut session = Session::new();
  session.insert("user", &user).unwrap();

  let cookie = state.store.store_session(session).await.unwrap().unwrap();
  let cookie = format!("{}={}; SameSite=Lax; Path=/", COOKIE_NAME, cookie);

  let mut headers = HeaderMap::new();
  headers.insert(SET_COOKIE, cookie.parse().unwrap());

  (headers, Redirect::to("/"))
}
