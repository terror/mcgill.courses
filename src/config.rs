use super::*;

#[derive(Debug)]
pub(crate) struct Config {
  pub(crate) env: Env,
  pub(crate) seed: bool,
  pub(crate) source: PathBuf,
}
