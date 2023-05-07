use super::*;

#[derive(Debug, Serialize)]
pub struct SearchResults {
  pub courses: Vec<Course>,
  pub instructors: Vec<Instructor>,
}
