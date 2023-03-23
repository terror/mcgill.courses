use {
  crate::{
    arguments::Arguments, error::Error, loader::Loader, options::Options,
    page::Page, server::Server, state::State, subcommand::Subcommand,
    vec_ext::VecExt, vsb_client::VsbClient,
  },
  async_session::{async_trait, MemoryStore, Session, SessionStore},
  axum::{
    extract::{
      rejection::TypedHeaderRejectionReason, FromRef, FromRequestParts, Path, Query,
      State as AppState,
    },
    headers::Cookie,
    response::{IntoResponse, Redirect, Response, TypedHeader},
    routing::get,
    routing::Router,
    Json, RequestPartsExt,
  },
  clap::Parser,
  db::Db,
  dotenv::dotenv,
  http::{header, header::SET_COOKIE, request::Parts, HeaderMap, StatusCode},
  model::{Course, CourseListing, Schedule},
  oauth2::{
    basic::BasicClient, reqwest::async_http_client, AuthType, AuthUrl,
    AuthorizationCode, ClientId, ClientSecret, CsrfToken, RedirectUrl, Scope,
    TokenResponse, TokenUrl,
  },
  rayon::prelude::*,
  serde::{Deserialize, Serialize},
  std::{
    env,
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
mod courses;
mod error;
mod loader;
mod options;
mod page;
mod search;
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
