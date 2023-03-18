use super::*;

#[derive(Debug, Deserialize)]
pub(crate) struct Config {
  pub(crate) mongodb_username: String,
  pub(crate) mongodb_cluster: String,
  pub(crate) mongodb_password: String,
}

impl Config {
  pub(crate) fn load() -> Result<Self> {
    Ok(envy::from_env::<Self>()?)
  }
}
