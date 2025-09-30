use super::*;

#[derive(Debug, Deserialize, Serialize, ToSchema)]
pub struct SearchResults {
  /// Courses that match the search query ordered by relevance.
  pub courses: Vec<Course>,
  /// Instructors that match the search query ordered by relevance.
  pub instructors: Vec<Instructor>,
}
