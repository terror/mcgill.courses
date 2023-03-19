use {
  crate::{
    arguments::Arguments, db::Db, loader::Loader, options::Options, page::Page,
    server::Server, state::State, subcommand::Subcommand, vec_ext::VecExt,
    vsb_client::VsbClient,
  },
  axum::Router,
  clap::Parser,
  http::Method,
  itertools::Itertools,
  model::{Course, CourseListing, Schedule},
  mongodb::options::UpdateModifications,
  mongodb::{
    bson::{doc, Document},
    options::ClientOptions,
    results::{InsertOneResult, UpdateResult},
    Client, Database,
  },
  rayon::prelude::*,
  std::{
    fs, hash::Hash, marker::Sized, net::SocketAddr, path::PathBuf, process,
    sync::Arc, thread, time::Duration,
  },
  tower_http::cors::{Any, CorsLayer},
};

#[cfg(test)]
use {
  futures::stream::TryStreamExt,
  include_dir::{include_dir, Dir},
  std::sync::atomic::{AtomicUsize, Ordering},
  tempdir::TempDir,
};

mod arguments;
mod db;
mod loader;
mod options;
mod page;
mod server;
mod state;
mod subcommand;
mod vec_ext;
mod vsb_client;

type Result<T = (), E = anyhow::Error> = std::result::Result<T, E>;

#[tokio::main]
async fn main() {
  env_logger::init();

  if let Err(error) = Arguments::parse().run().await {
    eprintln!("error: {error}");
    process::exit(1);
  }
}
