use super::*;

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReviewFilter {
  pub course_id: Option<String>,
  pub instructor_name: Option<String>,
  pub sorted: Option<bool>,
  pub user_id: Option<String>,
}
