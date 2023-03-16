use super::*;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub(crate) struct Schedule {
  pub(crate) campus: Option<String>,
  pub(crate) course_type: Option<String>,
  pub(crate) location: Option<String>,
  pub(crate) section: Option<String>,
}
