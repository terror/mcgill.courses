use super::*;

#[derive(Debug, Parser)]
pub(crate) struct Arguments {
  #[clap(flatten)]
  options: Options,
  #[clap(subcommand)]
  subcommand: Subcommand,
}

impl Arguments {
  pub(crate) async fn run(self) -> Result {
    self.subcommand.run(self.options).await
  }
}
