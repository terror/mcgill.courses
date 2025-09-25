use {
  bson::Bson,
  chrono::{Datelike, TimeZone, Utc},
  combine::Combine,
  futures::Future,
  futures::FutureExt,
  futures::{TryStreamExt, future::join_all},
  itertools::Itertools,
  lazy_static::lazy_static,
  model::{
    Course, CourseFilter, CourseSortType, InitializeOptions, Instructor,
    Interaction, InteractionKind, Notification, Review, ReviewFilter,
    SearchResults, Subscription,
  },
  mongodb::{
    Client, Cursor, Database, IndexModel,
    bson::{Document, doc},
    options::UpdateModifications,
    options::{ClientOptions, FindOptions, IndexOptions, UpdateOptions},
    results::{CreateIndexResult, DeleteResult, InsertOneResult, UpdateResult},
  },
  mongodb::{ClientSession, Collection, options::FindOneAndUpdateOptions},
  serde::{Serialize, de::DeserializeOwned},
  std::{collections::HashSet, env, fs, num::TryFromIntError, path::PathBuf},
  tokio::task::JoinError,
  tracing::{info, warn},
  {initializer::Initializer, seed::Seed, str_ext::StrExt, utils::*},
};

#[cfg(test)]
use {
  bson::DateTime,
  include_dir::{Dir, include_dir},
  model::CourseSort,
  std::sync::atomic::{AtomicUsize, Ordering},
  tempdir::TempDir,
};

pub type Result<T = ()> = std::result::Result<T, Error>;

mod db;
mod error;
mod initializer;
mod seed;
mod str_ext;
mod utils;

pub use crate::{db::Db, error::Error};
