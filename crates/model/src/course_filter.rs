use super::*;

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
pub struct CourseFilter {
  pub levels: Option<Vec<String>>,
  pub query: Option<String>,
  pub subjects: Option<Vec<String>>,
  pub terms: Option<Vec<String>>,
}
