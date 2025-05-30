use {
  crate::{
    auth::{CHROMEDRIVER_PORT, get_vsb_cookie},
    loader::Loader,
    select::Select,
    vsb_client::VsbClient,
  },
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

mod auth;
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

  let email = std::env::var("VSB_EMAIL")
    .expect("VSB_EMAIL must be specified for scraping");
  let password = std::env::var("VSB_PASSWORD")
    .expect("VSB_PASSWORD must be specified for scraping");
  let otp_secret = std::env::var("VSB_OTP_SECRET")
    .expect("VSB_OTP_SECRET must be specified for scraping");

  log::info!("Starting chromedriver server");
  let chromedriver = std::process::Command::new("chromedriver")
    .args([format!("--port={}", CHROMEDRIVER_PORT)])
    .spawn()
    .unwrap();
  std::thread::sleep(Duration::from_secs(2));

  info!("Retrieving cookie for VSB authentication...");
  // Written this way so that chromedriver server is always
  // torn down properly
  match retrieve_cookie(email, password, otp_secret) {
    Ok(cookie) => {
      drop(chromedriver);
      if let Err(error) = Loader::parse().run(&cookie) {
        eprintln!("error: {error}");
        process::exit(1);
      }
    }
    Err(e) => {
      eprintln!("error: {}", e);
      drop(chromedriver);
      process::exit(1);
    }
  }
}

fn retrieve_cookie(
  email: String,
  password: String,
  otp_secret: String,
) -> Result<String> {
  let rt = tokio::runtime::Builder::new_current_thread()
    .enable_all()
    .build()
    .unwrap();

  rt.block_on(get_vsb_cookie(email, password, otp_secret))
}
