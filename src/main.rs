use {
  crate::{
    arguments::Arguments,
    assets::Assets,
    auth::{AuthRedirect, COOKIE_NAME},
    error::Error,
    options::Options,
    seeder::Seeder,
    server::Server,
    state::State,
    subcommand::Subcommand,
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
  env_logger::Env,
  http::{
    header, header::SET_COOKIE, request::Parts, HeaderMap, Request, StatusCode,
  },
  log::{debug, error, info, trace},
  model::{
    Course, CourseFilter, InitializeOptions, Instructor, Interaction,
    InteractionKind, Review, ReviewFilter, Subscription,
  },
  oauth2::{
    basic::BasicClient, AuthType, AuthUrl, ClientId, ClientSecret, CsrfToken,
    RedirectUrl, Scope, TokenUrl,
  },
  serde::{Deserialize, Serialize},
  serde_json::json,
  std::{
    backtrace::BacktraceStatus,
    env,
    fmt::{self, Display, Formatter},
    fs,
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
  typeshare::typeshare,
  url::Url,
};

mod arguments;
mod assets;
mod auth;
mod courses;
mod error;
mod instructors;
mod interactions;
mod notifications;
mod options;
mod reviews;
mod search;
mod seeder;
mod server;
mod state;
mod subcommand;
mod subscriptions;
mod user;

type Result<T = (), E = Error> = std::result::Result<T, E>;

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
