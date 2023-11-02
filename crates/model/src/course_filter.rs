use super::*;

#[derive(Debug, Clone, Deserialize, Serialize)]
pub enum CourseSortType {
  Difficulty,
  Rating,
  ReviewCount,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct CourseSort {
  pub sort_type: CourseSortType,
  pub reverse: bool,
}

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
pub struct CourseFilter {
  pub levels: Option<Vec<String>>,
  pub query: Option<String>,
  pub subjects: Option<Vec<String>>,
  pub terms: Option<Vec<String>>,
  pub sort_by: Option<CourseSort>,
}
