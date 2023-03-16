use super::*;

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq)]
pub struct CoursePage {
  pub title: String,
  pub subject: String,
  pub code: String,
  pub faculty_url: String,
  pub description: String,
  pub instructors: Vec<Instructor>,
  pub requirements: Requirements,
}
