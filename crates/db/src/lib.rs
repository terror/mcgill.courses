use {
  crate::vec_ext::VecExt,
  futures::stream::TryStreamExt,
  itertools::Itertools,
  log::info,
  model::Course,
  mongodb::{
    bson::{doc, oid::ObjectId, Document},
    options::UpdateModifications,
    options::{ClientOptions, FindOptions, IndexOptions},
    results::{CreateIndexResult, InsertOneResult, UpdateResult},
    Client, Database, IndexModel,
  },
  std::{fs, hash::Hash, path::PathBuf},
};

#[cfg(test)]
use {
  include_dir::{include_dir, Dir},
  std::sync::atomic::{AtomicUsize, Ordering},
  tempdir::TempDir,
};

type Result<T = (), E = anyhow::Error> = std::result::Result<T, E>;

mod db;
mod vec_ext;

pub use crate::db::Db;
