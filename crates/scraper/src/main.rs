use {
  anyhow::{Result, anyhow},
  catalogue::Loader,
  clap::Parser,
  env_logger::Env,
  extractor::{ScheduleExtractor, VsbExtractor},
  log::{error, info, warn},
  model::{Course, Schedule},
  rayon::iter::{IntoParallelRefIterator, ParallelIterator},
  reqwest::blocking::{Client, RequestBuilder},
  retry::Retry,
  std::{
    collections::HashSet, fs, path::PathBuf, process, thread, time::Duration,
  },
};

use crate::vsb::VsbClient;

mod catalogue;
mod retry;
mod vsb;

fn main() {
  env_logger::Builder::from_env(Env::default().default_filter_or("info"))
    .init();

  if let Err(error) = Loader::parse().run() {
    eprintln!("error: {error}");

    process::exit(1);
  }
}
