use super::*;

#[derive(Debug, Parser)]
pub(crate) struct Seeder {
  #[clap(long, default_value = "false", help = "Enable multithreaded seeding")]
  multithreaded: bool,
  #[clap(long, default_value = "courses.json")]
  source: PathBuf,
}

impl Into<InitializeOptions> for Seeder {
  fn into(self) -> InitializeOptions {
    InitializeOptions {
      multithreaded: self.multithreaded,
      source: self.source,
    }
  }
}

impl Seeder {
  pub(crate) async fn run(self, options: Options) -> Result {
    let db = Arc::new(Db::connect(&options.db_name).await?);

    db.initialize(self.into()).await?;

    Ok(())
  }
}
