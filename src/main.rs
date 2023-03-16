use {
  crate::{
    arguments::Arguments, config::Config, course::Course, db::Db,
    loader::Loader, options::Options, page::Page, schedule::Schedule,
    select::Select, server::Server, state::State, subcommand::Subcommand,
    vec_ext::VecExt, vsb_client::VsbClient,
  },
  anyhow::anyhow,
  axum::Router,
  clap::Parser,
  dotenv::dotenv,
  extractor::{
    course_listing::CourseListing, extract, instructor::Instructor,
    requirements::Requirements,
  },
  http::Method,
  rayon::prelude::*,
  scraper::{ElementRef, Html, Selector},
  serde::{Deserialize, Serialize},
  sqlx::{migrate::MigrateDatabase, PgPool, Postgres},
  std::{
    fs, marker::Sized, net::SocketAddr, path::PathBuf, process, str::FromStr,
  },
  tower_http::cors::{Any, CorsLayer},
};

mod arguments;
mod config;
mod course;
mod db;
mod loader;
mod options;
mod page;
mod schedule;
mod select;
mod server;
mod state;
mod subcommand;
mod vec_ext;
mod vsb_client;

type Result<T = (), E = anyhow::Error> = std::result::Result<T, E>;

#[tokio::main]
async fn main() {
  env_logger::init();

  dotenv().ok();

  if let Err(error) = Arguments::parse().run().await {
    eprintln!("error: {error}");
    process::exit(1);
  }
}
