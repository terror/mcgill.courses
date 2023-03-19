use {
  crate::{
    arguments::Arguments, error::Error, loader::Loader, options::Options,
    page::Page, server::Server, state::State, subcommand::Subcommand,
    vec_ext::VecExt, vsb_client::VsbClient,
  },
  axum::{
    extract::State as AppState, response::IntoResponse, response::Response,
    routing::get, routing::Router, Json,
  },
  clap::Parser,
  db::Db,
  http::Method,
  http::StatusCode,
  model::{Course, CourseListing, Schedule},
  rayon::prelude::*,
  std::{
    fmt::{self, Display, Formatter},
    fs,
    marker::Sized,
    net::SocketAddr,
    path::PathBuf,
    process,
    sync::Arc,
    thread,
    time::Duration,
  },
  tower_http::cors::{Any, CorsLayer},
};

mod arguments;
mod error;
mod loader;
mod options;
mod page;
mod server;
mod state;
mod subcommand;
mod vec_ext;
mod vsb_client;

type Result<T = (), E = error::Error> = std::result::Result<T, E>;

#[tokio::main]
async fn main() {
  env_logger::init();

  if let Err(error) = Arguments::parse().run().await {
    eprintln!("error: {error}");
    process::exit(1);
  }
}
