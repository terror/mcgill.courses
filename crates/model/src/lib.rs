use {
  bson::{doc, Bson, DateTime},
  chrono::prelude::*,
  serde::{
    de::{self, Visitor},
    Deserialize, Deserializer, Serialize,
  },
  std::fmt,
};

mod course;
mod course_listing;
mod course_page;
mod instructor;
mod requirements;
mod review;
mod schedule;
mod search_results;

pub use crate::{
  course::Course,
  course_listing::CourseListing,
  course_page::CoursePage,
  instructor::Instructor,
  requirements::{Requirement, Requirements},
  review::Review,
  schedule::*,
  search_results::SearchResults,
};
