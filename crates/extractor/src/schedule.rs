use super::*;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Schedule {
  pub campus: Option<String>,
  pub course_type: Option<String>,
  pub location: Option<String>,
  pub section: Option<String>,
}
