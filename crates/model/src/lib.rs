use {
  anyhow::anyhow,
  serde::{Deserialize, Serialize},
  bson::{Bson, doc}
};

type Result<T = (), E = anyhow::Error> = std::result::Result<T, E>;

mod course;
mod course_listing;
mod course_page;
mod instructor;
mod requirements;
mod schedule;

pub use crate::{
  course::Course,
  course_listing::CourseListing,
  course_page::CoursePage,
  instructor::Instructor,
  requirements::{Requirement, Requirements},
  schedule::Schedule,
};
