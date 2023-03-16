use super::*;

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq)]
pub(crate) struct CoursePage {
  pub(crate) title: String,
  pub(crate) subject: String,
  pub(crate) code: String,
  pub(crate) faculty_url: String,
  pub(crate) description: String,
  pub(crate) instructors: Vec<Instructor>,
  pub(crate) requirements: Requirements,
}
