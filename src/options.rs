use super::*;

#[derive(Debug, Parser)]
pub(crate) struct Options {
  #[clap(long, default_value = "admin", help = "Database name")]
  pub(crate) db_name: String,
}
