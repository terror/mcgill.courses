use {
  crate::{
    arguments::Arguments,
    assets::Assets,
    auth::{AuthRedirect, COOKIE_NAME},
    error::Error,
    hash::Hash,
    loader::Loader,
    merge::merge,
    object::Object,
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
    routing::{get, post, Router},
    Json, RequestPartsExt,
  },
  base64::{engine::general_purpose::STANDARD, Engine},
  chrono::prelude::*,
  clap::Parser,
  db::Db,
  dotenv::dotenv,
  env_logger::Env,
  futures::TryStreamExt,
  http::{header, header::SET_COOKIE, request::Parts, HeaderMap, StatusCode},
  log::{debug, error, info, trace},
  model::{
    Course, CourseFilter, CourseListing, InitializeOptions, Instructor,
    Interaction, InteractionKind, Review, Schedule, Subscription,
  },
  oauth2::{
    basic::BasicClient, AuthType, AuthUrl, ClientId, ClientSecret, CsrfToken,
    RedirectUrl, Scope, TokenUrl,
  },
  rayon::prelude::*,
  reqwest::blocking::RequestBuilder,
  rusoto_core::Region,
  rusoto_s3::S3Client,
  rusoto_s3::{GetObjectRequest, PutObjectOutput, PutObjectRequest, S3},
  serde::{Deserialize, Serialize},
  serde_json::{json, Value},
  sha2::{Digest, Sha256},
  std::{
    collections::HashSet,
    env,
    fmt::{self, Display, Formatter},
    fs,
    fs::File,
    io::Read,
    marker::Sized,
    net::SocketAddr,
    path::PathBuf,
    process,
    sync::Arc,
    thread,
    time::Duration,
  },
  tower_http::{
    cors::CorsLayer,
    services::{ServeDir, ServeFile},
  },
  url::Url,
  walkdir::WalkDir,
};

mod arguments;
mod assets;
mod auth;
mod courses;
mod error;
mod hash;
mod instructors;
mod interactions;
mod loader;
mod merge;
mod notifications;
mod object;
mod options;
mod page;
mod retry;
mod reviews;
mod search;
mod server;
mod state;
mod subcommand;
mod subscriptions;
mod user;
mod vec_ext;
mod vsb_client;

type Result<T = (), E = error::Error> = std::result::Result<T, E>;

#[tokio::main]
async fn main() {
  env_logger::Builder::from_env(Env::default().default_filter_or("info"))
    .init();

  dotenv().ok();

  if let Err(error) = Arguments::parse().run().await {
    eprintln!("error: {error}");
    process::exit(1);
  }
}
