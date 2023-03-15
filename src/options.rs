use super::*;

#[derive(Parser)]
pub(crate) struct Options {
  #[clap(long, default_value = "courses.json")]
  pub(crate) source: PathBuf,
}
