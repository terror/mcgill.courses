use {
  crate::{
    assets::Assets,
    auth::{AuthRedirect, COOKIE_NAME},
    error::Error,
    hash::Hash,
    object::Object,
    server::Server,
    state::State,
    user::User,
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
  futures::TryStreamExt,
  http::{
    header, header::SET_COOKIE, request::Parts, HeaderMap, Request, StatusCode,
  },
  model::{
    Course, CourseFilter, InitializeOptions, Instructor, Interaction,
    InteractionKind, Review, ReviewFilter, Subscription,
  },
  oauth2::{
    basic::BasicClient, AuthType, AuthUrl, ClientId, ClientSecret, CsrfToken,
    RedirectUrl, Scope, TokenUrl,
  },
  rusoto_core::Region,
  rusoto_s3::S3Client,
  rusoto_s3::{GetObjectRequest, PutObjectOutput, PutObjectRequest, S3},
  serde::{Deserialize, Serialize},
  serde_json::json,
  sha2::{Digest, Sha256},
  std::{
    backtrace::BacktraceStatus,
    env,
    fmt::{self, Display, Formatter},
    fs,
    fs::File,
    io::Read,
    net::SocketAddr,
    path::PathBuf,
    process,
    sync::Arc,
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
  tracing::{debug, error, info, trace},
  tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt},
  typeshare::typeshare,
  url::Url,
  walkdir::WalkDir,
};

mod assets;
mod auth;
mod courses;
mod error;
mod hash;
mod instructors;
mod interactions;
mod notifications;
mod object;
mod options;
mod reviews;
mod search;
mod server;
mod state;
mod subscriptions;
mod user;

type Result<T = (), E = error::Error> = std::result::Result<T, E>;

#[tokio::main]
async fn main() {
  tracing_subscriber::registry()
    .with(
      tracing_subscriber::EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| "info".into()),
    )
    .with(tracing_subscriber::fmt::layer())
    .init();

  dotenv().ok();

  if let Err(error) = Server::parse().run().await {
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
