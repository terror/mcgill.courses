use {
  crate::{
    arguments::Arguments, course::Course, extractor::Extractor, options::Options, select::Select,
    server::Server, subcommand::Subcommand, vec_ext::VecExt,
  },
  anyhow::anyhow,
  clap::Parser,
  rayon::prelude::*,
  scraper::{ElementRef, Html, Selector},
  serde::{Deserialize, Serialize},
  std::{fs, path::PathBuf, process},
  uuid::Uuid,
};

const BASE_URL: &str = "https://www.mcgill.ca";

mod arguments;
mod course;
mod extractor;
mod options;
mod select;
mod server;
mod subcommand;
mod vec_ext;

type Result<T = (), E = anyhow::Error> = std::result::Result<T, E>;

fn main() {
  env_logger::init();

  if let Err(error) = Arguments::parse().run() {
    eprintln!("error: {error}");
    process::exit(1);
  }
}
