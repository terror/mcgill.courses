use super::*;

#[derive(Debug, Deserialize)]
pub(crate) struct Env {
  pub(crate) mongodb_uri: String,
}

impl Env {
  pub(crate) fn load() -> Result<Self> {
    Ok(envy::from_env::<Self>()?)
  }
}
