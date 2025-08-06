use {
  crate::{loader::Loader, select::Select, vsb_client::VsbClient},
  anyhow::{Error, anyhow, bail},
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
    collections::HashSet,
    env, fs,
    hash::Hash,
    path::PathBuf,
    process,
    process::{Child, Command},
    thread,
    time::Duration,
  },
  thirtyfour::prelude::*,
  tokio::time::sleep,
  totp_rs::{Secret, TOTP},
};

mod auth;
mod course_extractor;
mod loader;
mod retry;
mod select;
mod utils;
mod vsb_client;
mod vsb_extractor;

type Result<T = (), E = Error> = std::result::Result<T, E>;

fn run() -> Result {
  env_logger::Builder::from_env(Env::default().default_filter_or("info"))
    .init();

  Loader::parse().run(&auth::authenticate()?)
}

fn main() {
  if let Err(error) = run() {
    eprintln!("error: {error}");
    process::exit(1);
  }
}
