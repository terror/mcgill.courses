use {
  crate::{
    arguments::Arguments,
    assets::Assets,
    auth::{AuthRedirect, COOKIE_NAME},
    error::Error,
    hash::Hash,
    loader::Loader,
    object::Object,
    options::Options,
    retry::Retry,
    server::Server,
    state::State,
    subcommand::Subcommand,
    user::User,
    vsb_client::VsbClient,
  },
  anyhow::anyhow,
  async_mongodb_session::MongodbSessionStore,
  async_session::{async_trait, Session, SessionStore},
  axum::{
    body::Body,
    error_handling::HandleErrorLayer,
    extract::{FromRef, FromRequestParts, Path, Query, State as AppState},
    response::{IntoResponse, Redirect, Response},
    routing::{get, post, Router},
    BoxError, Json, RequestPartsExt,
  },
  axum_extra::{
    headers::Cookie, typed_header::TypedHeaderRejectionReason, TypedHeader,
  },
  base64::{engine::general_purpose::STANDARD, Engine},
  chrono::prelude::*,
  clap::Parser,
  db::Db,
  dotenv::dotenv,
  env_logger::Env,
  extractor::{ScheduleExtractor, VsbExtractor},
  futures::TryStreamExt,
  http::{
    header, header::SET_COOKIE, request::Parts, HeaderMap, Request, StatusCode,
  },
  log::{debug, error, info, trace, warn},
  model::{
    Course, CourseFilter, InitializeOptions, Instructor, Interaction,
    InteractionKind, Review, ReviewFilter, Schedule, Subscription,
  },
  oauth2::{
    basic::BasicClient, AuthType, AuthUrl, ClientId, ClientSecret, CsrfToken,
    RedirectUrl, Scope, TokenUrl,
  },
  rayon::prelude::*,
  reqwest::blocking::{Client, RequestBuilder},
  rusoto_core::Region,
  rusoto_s3::S3Client,
  rusoto_s3::{GetObjectRequest, PutObjectOutput, PutObjectRequest, S3},
  serde::{Deserialize, Serialize},
  serde_json::json,
  sha2::{Digest, Sha256},
  std::{
    backtrace::BacktraceStatus,
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
  tower::ServiceBuilder,
  tower_governor::{
    errors::display_error, governor::GovernorConfigBuilder, GovernorLayer,
  },
  tower_http::{
    cors::CorsLayer,
    services::{ServeDir, ServeFile},
    trace::TraceLayer,
  },
  tracing::Span,
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

    for (i, error) in error.0.chain().skip(1).enumerate() {
      if i == 0 {
        eprintln!();
        eprintln!("because:");
      }

      eprintln!("- {error}");
    }

    let backtrace = error.0.backtrace();

    if backtrace.status() == BacktraceStatus::Captured {
      eprintln!("backtrace:");
      eprintln!("{backtrace}");
    }

    process::exit(1);
  }
}
