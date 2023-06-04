use super::*;

#[derive(Debug, Default)]
pub struct SeedOptions {
  pub multithreaded: bool,
  pub skip_courses: bool,
  pub source: PathBuf,
}
