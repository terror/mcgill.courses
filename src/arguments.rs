use super::*;

#[derive(Parser)]
pub(crate) struct Arguments {
  #[clap(flatten)]
  options: Options,
  #[clap(subcommand)]
  subcommand: Subcommand,
}

impl Arguments {
  pub(crate) async fn run(self) -> Result {
    match self.subcommand {
      Subcommand::Load(loader) => loader.run(self.options.source),
      Subcommand::Serve(server) => server.run(self.options.source).await,
    }
  }
}
