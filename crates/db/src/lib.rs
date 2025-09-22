use {
  anyhow::anyhow,
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
  std::{collections::HashSet, env, fs, path::PathBuf},
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

type Result<T = (), E = anyhow::Error> = std::result::Result<T, E>;

mod db;
mod initializer;
mod seed;
mod str_ext;
mod utils;

pub use crate::db::Db;
