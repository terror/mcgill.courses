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

pub(crate) async fn microsoft_auth(
  AppState(client): AppState<BasicClient>,
) -> impl IntoResponse {
  Redirect::to(
    client
      .authorize_url(CsrfToken::new_random)
      .add_scope(Scope::new(String::from("openid")))
      .add_scope(Scope::new(String::from("User.Read")))
      .url()
      .0
      .as_ref(),
  )
}

pub(crate) async fn login_authorized(
  Query(query): Query<AuthRequest>,
  AppState(store): AppState<MemoryStore>,
  AppState(oauth_client): AppState<BasicClient>,
) -> Result<impl IntoResponse> {
  log::debug!("Fetching token from oauth client...");

  let token = oauth_client
    .exchange_code(AuthorizationCode::new(query.code.clone()))
    .request_async(async_http_client)
    .await?;

  let client = reqwest::Client::new();

  let mut session = Session::new();

  log::debug!("Inserting user data into session...");

  session.insert(
    "user",
    &client
      .get("https://graph.microsoft.com/v1.0/me")
      .bearer_auth(token.access_token().secret())
      .send()
      .await?
      .json::<User>()
      .await?,
  )?;

  let mut headers = HeaderMap::new();

  headers.insert(
    SET_COOKIE,
    format!(
      "{}={}; SameSite=Lax; Path=/",
      COOKIE_NAME,
      store
        .store_session(session)
        .await?
        .ok_or(anyhow!("Failed to store session"))?
    )
    .parse()?,
  );

  Ok((headers, Redirect::to(CLIENT_URL)))
}

pub(crate) async fn logout(
  TypedHeader(cookies): TypedHeader<Cookie>,
  AppState(session_store): AppState<MemoryStore>,
) -> Result<impl IntoResponse> {
  let cookie = match cookies.get(COOKIE_NAME) {
    Some(c) => c,
    None => return Ok(Redirect::to(CLIENT_URL)),
  };

  let session = match session_store.load_session(cookie.to_string()).await? {
    Some(s) => s,
    None => return Ok(Redirect::to(CLIENT_URL)),
  };

  log::debug!("Destroying session...");

  session_store.destroy_session(session).await?;

  Ok(Redirect::to(CLIENT_URL))
}
