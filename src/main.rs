use {
  crate::{
    arguments::Arguments, config::Config, course::Course, db::Db, extractor::Extractor,
    instructor::Instructor, options::Options, select::Select, server::Server, state::State,
    subcommand::Subcommand, vec_ext::VecExt,
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
  std::{fs, net::SocketAddr, path::PathBuf, process, str::FromStr},
  tower_http::cors::{Any, CorsLayer},
  uuid::Uuid,
};

const BASE_URL: &str = "https://www.mcgill.ca";

mod arguments;
mod config;
mod course;
mod db;
mod extractor;
mod instructor;
mod options;
mod select;
mod server;
mod state;
mod subcommand;
mod vec_ext;

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
