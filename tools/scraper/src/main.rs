use {
  crate::{loader::Loader, select::Select, vsb_client::VsbClient},
  anyhow::{Result, anyhow, bail},
  chrono::Utc,
  clap::Parser,
  env_logger::Env,
  log::{error, info, warn},
  model::{
    Block, Course, CoursePage, Instructor, Requirement, Requirements, Schedule,
    TimeBlock,
  },
  rayon::iter::{IntoParallelRefIterator, ParallelIterator},
  regex::Regex,
  reqwest::StatusCode,
  reqwest::blocking::{Client, RequestBuilder},
  retry::Retry,
  scraper::{ElementRef, Html, Selector},
  std::{
    collections::HashSet, fs, hash::Hash, path::PathBuf, process, thread,
    time::Duration,
  },
};

mod course_extractor;
mod loader;
mod retry;
mod select;
mod utils;
mod vsb_client;
mod vsb_extractor;

fn main() {
  env_logger::Builder::from_env(Env::default().default_filter_or("info"))
    .init();

  if let Err(error) = Loader::parse().run() {
    eprintln!("error: {error}");
    process::exit(1);
  }
}
