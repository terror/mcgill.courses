use super::*;

pub(crate) const COOKIE_NAME: &str = "session";

pub struct AuthRedirect;

impl IntoResponse for AuthRedirect {
  fn into_response(self) -> Response {
    Redirect::temporary("/auth/login").into_response()
  }
}

#[derive(Debug, Deserialize)]
pub struct AuthRequest {
  code: String,
  state: String,
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
  redirect: String,
}

#[derive(Debug, Deserialize)]
pub struct LogoutRequest {
  redirect: String,
}

pub(crate) async fn microsoft_auth(
  Query(query): Query<LoginRequest>,
  AppState(client): AppState<BasicClient>,
) -> impl IntoResponse {
  Redirect::to(
    client
      .authorize_url(|| {
        CsrfToken::new(format!(
          "{}{}",
          CsrfToken::new_random().secret(),
          &STANDARD.encode(query.redirect)
        ))
      })
      .add_scope(Scope::new(String::from("openid")))
      .add_scope(Scope::new(String::from("User.Read")))
      .url()
      .0
      .as_ref(),
  )
}

pub(crate) async fn login_authorized(
  Query(query): Query<AuthRequest>,
  AppState(oauth_client): AppState<BasicClient>,
  AppState(request_client): AppState<reqwest::Client>,
  AppState(session_store): AppState<MongodbSessionStore>,
) -> Result<impl IntoResponse> {
  log::debug!("Fetching token from oauth client...");

  let token = oauth_client
    .exchange_code(AuthorizationCode::new(query.code.clone()))
    .request_async(async_http_client)
    .await?;

  log::debug!("Fetching user data from Microsoft...");

  let user: User = request_client
    .get("https://graph.microsoft.com/v1.0/me")
    .bearer_auth(token.access_token().secret())
    .send()
    .await?
    .json()
    .await?;

  let url =
    Url::parse(&String::from_utf8(STANDARD.decode(&query.state[22..])?)?)?;

  if !user.mail().ends_with("mcgill.ca") {
    return Ok((
      HeaderMap::new(),
      Redirect::to(&format!(
        "{}?err=invalidMail",
        url.origin().ascii_serialization()
      )),
    ));
  }

  let mut session = Session::new();

  session.expire_in(Duration::from_secs(60 * 60 * 24 * 7));

  log::debug!("Inserting user data into session...");

  session.insert("user", user)?;

  let mut headers = HeaderMap::new();

  headers.insert(
    SET_COOKIE,
    format!(
      "{}={}; SameSite=Lax; Path=/",
      COOKIE_NAME,
      session_store
        .store_session(session)
        .await?
        .ok_or(anyhow!("Failed to store session"))?
    )
    .parse()?,
  );

  Ok((headers, Redirect::to(url.as_ref())))
}

pub(crate) async fn logout(
  Query(query): Query<LogoutRequest>,
  TypedHeader(cookies): TypedHeader<Cookie>,
  AppState(session_store): AppState<MongodbSessionStore>,
) -> Result<impl IntoResponse> {
  let cookie = match cookies.get(COOKIE_NAME) {
    Some(c) => c,
    None => return Ok(Redirect::to(&query.redirect)),
  };

  let session = match session_store.load_session(cookie.to_string()).await? {
    Some(s) => s,
    None => return Ok(Redirect::to(&query.redirect)),
  };

  log::debug!("Destroying session...");

  session_store.destroy_session(session).await?;

  Ok(Redirect::to(&query.redirect))
}
