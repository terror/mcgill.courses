use super::*;

#[derive(Debug, Deserialize)]
pub(crate) struct Config {
  pub(crate) postgres_user: String,
  pub(crate) postgres_db: String,
  pub(crate) postgres_password: String,
}

impl Config {
  pub(crate) fn load() -> Result<Self> {
    Ok(envy::from_env::<Self>()?)
  }
}
