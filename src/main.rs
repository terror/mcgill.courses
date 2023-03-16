use {
  crate::{
    arguments::Arguments, config::Config, course::Course, course_listing::CourseListing,
    course_page::CoursePage, db::Db, extractor::Extractor, instructor::Instructor,
    options::Options, page::Page, requirement::Requirement, requirements::Requirements,
    schedule::Schedule, select::Select, server::Server, state::State, subcommand::Subcommand,
    vec_ext::VecExt, vsb_client::VsbClient,
  },
  anyhow::anyhow,
  axum::Router,
  clap::Parser,
  dotenv::dotenv,
  http::Method,
  rayon::prelude::*,
  scraper::{ElementRef, Html, Selector},
  serde::{Deserialize, Serialize},
  sqlx::{migrate::MigrateDatabase, PgPool, Postgres},
  std::{
    fs, marker::Sized, net::SocketAddr, path::PathBuf, process, str::FromStr, thread,
    time::Duration,
  },
  tower_http::cors::{Any, CorsLayer},
  uuid::Uuid,
};

mod arguments;
mod config;
mod course;
mod course_listing;
mod course_page;
mod db;
mod extractor;
mod instructor;
mod options;
mod page;
mod parser;
mod requirement;
mod requirements;
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
