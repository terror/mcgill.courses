use super::*;

#[derive(Debug, Clone, Deserialize, Serialize)]
pub(crate) struct Course {
  pub(crate) title: String,
  pub(crate) subject: String,
  pub(crate) code: String,
  pub(crate) level: String,
  pub(crate) url: String,
  pub(crate) department: String,
  pub(crate) faculty: String,
  pub(crate) faculty_url: String,
  pub(crate) terms: Vec<String>,
  pub(crate) description: String,
  pub(crate) instructors: Vec<Instructor>,
  pub(crate) requirements: Requirements,
  pub(crate) schedule: Vec<Schedule>,
}
