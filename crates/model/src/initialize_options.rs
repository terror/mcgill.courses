use super::*;

#[derive(Debug, Default)]
pub struct InitializeOptions {
  pub multithreaded: bool,
  pub source: PathBuf,
}
