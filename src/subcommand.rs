use super::*;

#[derive(Parser)]
pub(crate) enum Subcommand {
  Load(Loader),
  Serve(Server),
}
