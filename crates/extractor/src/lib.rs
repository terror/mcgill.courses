use {
  crate::{
    course_listing::CourseListing, course_page::CoursePage,
    instructor::Instructor, requirement::Requirement,
    requirements::Requirements, select::Select, schedule::Schedule
  },
  anyhow::anyhow,
  scraper::{ElementRef, Html, Selector},
  serde::{Deserialize, Serialize},
};

type Result<T = (), E = anyhow::Error> = std::result::Result<T, E>;

mod course_page;
mod requirement;
mod select;

pub mod course_listing;
pub mod extract;
pub mod instructor;
pub mod requirements;
pub mod schedule;
