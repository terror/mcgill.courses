use super::*;

pub(crate) const COOKIE_NAME: &str = "session";

pub struct AuthRedirect;

impl IntoResponse for AuthRedirect {
  fn into_response(self) -> Response {
    Redirect::temporary("/auth/login").into_response()
  }
}

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
pub struct AuthRequest {
  code: String,
  state: String,
}

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

pub(crate) async fn login_authorized(
  Query(query): Query<AuthRequest>,
  AppState(store): AppState<MemoryStore>,
  AppState(oauth_client): AppState<BasicClient>,
) -> Result<impl IntoResponse> {
  let token = oauth_client
    .exchange_code(AuthorizationCode::new(query.code.clone()))
    .request_async(async_http_client)
    .await?;

  let client = reqwest::Client::new();
  let user = client
    .get("https://graph.microsoft.com/v1.0/me")
    .bearer_auth(token.access_token().secret())
    .send()
    .await?
    .json::<User>()
    .await?;

  let mut session = Session::new();
  session.insert("user", &user)?;

  let cookie = store.store_session(session).await?.unwrap();
  let cookie = format!("{}={}; SameSite=Lax; Path=/", COOKIE_NAME, cookie);

  let mut headers = HeaderMap::new();
  headers.insert(SET_COOKIE, cookie.parse()?);

  Ok((headers, Redirect::to("http://localhost:5173")))
}

pub(crate) async fn logout(
  TypedHeader(cookies): TypedHeader<Cookie>,
  AppState(store): AppState<MemoryStore>,
) -> Result<impl IntoResponse> {
  let cookie = match cookies.get(COOKIE_NAME) {
    Some(c) => c,
    None => return Ok(Redirect::to("http://localhost:5173")),
  };

  let session = match store.load_session(cookie.to_string()).await? {
    Some(s) => s,
    None => return Ok(Redirect::to("http://localhost:5173")),
  };

  store.destroy_session(session).await?;
  Ok(Redirect::to("http://localhost:5173"))
}
