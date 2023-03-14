use super::*;

#[derive(Parser)]
pub(crate) struct Options {
  #[clap(long)]
  pub(crate) source: PathBuf,
}
