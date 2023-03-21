use {
  crate::{
    arguments::Arguments,
    auth::{login_authorized, microsoft_auth, oauth_client},
    loader::Loader,
    options::Options,
    page::Page,
    server::Server,
    state::State,
    subcommand::Subcommand,
    vec_ext::VecExt,
    vsb_client::VsbClient,
  },
  async_session::MemoryStore,
  axum::{routing::get, Router},
  clap::Parser,
  db::Db,
  dotenv::dotenv,
  http::Method,
  model::{Course, CourseListing, Schedule},
  oauth2::basic::BasicClient,
  rayon::prelude::*,
  serde::Deserialize,
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
  tower_http::cors::CorsLayer,
};

mod arguments;
mod auth;
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
  dotenv().ok();

  if let Err(error) = Arguments::parse().run().await {
    eprintln!("error: {error}");
    process::exit(1);
  }
}
