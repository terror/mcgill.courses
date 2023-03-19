use super::*;

#[derive(Debug)]
pub(crate) struct Error(pub(crate) anyhow::Error);

impl Display for Error {
  fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
    write!(f, "{}", self.0)
  }
}

impl<E> From<E> for Error
where
  E: Into<anyhow::Error>,
{
  fn from(err: E) -> Self {
    Self(err.into())
  }
}

impl IntoResponse for Error {
  fn into_response(self) -> Response {
    (
      StatusCode::INTERNAL_SERVER_ERROR,
      format!("error: {}", self.0),
    )
      .into_response()
  }
}
