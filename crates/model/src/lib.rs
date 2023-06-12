use {
  bson::{doc, Bson, DateTime},
  chrono::prelude::*,
  serde::{
    de::{self, MapAccess, Visitor},
    Deserialize, Deserializer, Serialize,
  },
  std::{fmt, path::PathBuf},
};

mod course;
mod course_listing;
mod course_page;
mod initialize_options;
mod instructor;
mod requirements;
mod review;
mod schedule;
mod search_results;

pub use crate::{
  course::Course,
  course_listing::CourseListing,
  course_page::CoursePage,
  initialize_options::InitializeOptions,
  instructor::Instructor,
  requirements::{Requirement, Requirements},
  review::Review,
  schedule::*,
  search_results::SearchResults,
};
