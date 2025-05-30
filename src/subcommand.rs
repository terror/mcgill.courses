use super::*;

#[derive(Debug, Parser)]
pub(crate) enum Subcommand {
  #[clap(about = "Seed the database")]
  Seed(Seeder),
  #[clap(about = "Run the server")]
  Serve(Server),
}

impl Subcommand {
  pub(crate) async fn run(self, options: Options) -> Result {
    match self {
      Self::Seed(seeder) => seeder.run(options).await,
      Self::Serve(server) => server.run(options).await,
    }
  }
}
