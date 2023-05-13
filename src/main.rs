use {
  crate::{
    arguments::Arguments,
    auth::{AuthRedirect, COOKIE_NAME},
    error::Error,
    loader::Loader,
    options::Options,
    page::Page,
    retry::Retry,
    server::Server,
    state::State,
    subcommand::Subcommand,
    user::User,
    vec_ext::VecExt,
    vsb_client::VsbClient,
  },
  anyhow::anyhow,
  async_mongodb_session::MongodbSessionStore,
  async_session::{async_trait, Session, SessionStore},
  axum::{
    extract::{
      rejection::TypedHeaderRejectionReason, FromRef, FromRequestParts, Path,
      Query, State as AppState,
    },
    headers::Cookie,
    response::{IntoResponse, Redirect, Response, TypedHeader},
    routing::get,
    routing::post,
    routing::Router,
    Json, RequestPartsExt,
  },
  base64::{engine::general_purpose::STANDARD, Engine},
  chrono::prelude::*,
  clap::Parser,
  db::Db,
  dotenv::dotenv,
  http::{header, header::SET_COOKIE, request::Parts, HeaderMap, StatusCode},
  log::{debug, error},
  model::{Course, CourseListing, Review, Schedule},
  oauth2::{
    basic::BasicClient, reqwest::async_http_client, AuthType, AuthUrl,
    AuthorizationCode, ClientId, ClientSecret, CsrfToken, RedirectUrl, Scope,
    TokenResponse, TokenUrl,
  },
  rayon::prelude::*,
  reqwest::blocking::RequestBuilder,
  serde::{Deserialize, Serialize},
  std::{
    collections::HashSet,
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
mod retry;
mod reviews;
mod search;
mod server;
mod state;
mod subcommand;
mod user;
mod vec_ext;
mod vsb_client;

const CLIENT_URL: &str = "http://localhost:5173";

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
