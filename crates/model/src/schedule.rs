use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Schedule {
  pub campus: Option<String>,
  pub display: Option<String>,
  pub location: Option<String>,
}
