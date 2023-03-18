use super::*;

#[derive(Debug, Deserialize)]
pub(crate) struct Config {
  pub(crate) mongodb_uri: String,
}

impl Config {
  pub(crate) fn load() -> Result<Self> {
    Ok(envy::from_env::<Self>()?)
  }
}
