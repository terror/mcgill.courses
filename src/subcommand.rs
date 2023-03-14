use super::*;

#[derive(Parser)]
pub(crate) enum Subcommand {
  Extract(Extractor),
  Serve(Server),
}
