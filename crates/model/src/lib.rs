use {
  crate::{
    instructor::Instructor, requirements::Requirements, schedule::Schedule,
  },
  anyhow::anyhow,
  serde::{Deserialize, Serialize},
};

type Result<T = (), E = anyhow::Error> = std::result::Result<T, E>;

pub mod course;
pub mod course_listing;
pub mod course_page;
pub mod instructor;
pub mod requirements;
pub mod schedule;
