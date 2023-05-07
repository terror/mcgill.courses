use {
  anyhow::anyhow,
  futures::stream::TryStreamExt,
  itertools::Itertools,
  lazy_static::lazy_static,
  log::info,
  model::{Course, Instructor, Review},
  mongodb::{
    bson::{doc, Document},
    options::UpdateModifications,
    options::{ClientOptions, FindOptions, IndexOptions},
    results::{CreateIndexResult, DeleteResult, InsertOneResult, UpdateResult},
    Client, Database, IndexModel,
  },
  std::{collections::HashSet, fs, hash::Hash, path::PathBuf},
  {crate::vec_ext::VecExt, str_ext::StrExt},
};

#[cfg(test)]
use {
  bson::DateTime,
  chrono::prelude::*,
  include_dir::{include_dir, Dir},
  std::sync::atomic::{AtomicUsize, Ordering},
  tempdir::TempDir,
};

type Result<T = (), E = anyhow::Error> = std::result::Result<T, E>;

mod db;
mod str_ext;
mod vec_ext;

pub use crate::db::Db;
