use super::*;

#[derive(Debug, Default)]
pub struct InitializeOptions {
  pub multithreaded: bool,
  pub skip_courses: bool,
  pub source: PathBuf,
}
