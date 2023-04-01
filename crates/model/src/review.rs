use super::*;

#[derive(Clone, Debug, Serialize, Deserialize, Hash, Eq, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Review {
  pub content: String,
  pub course_id: String,
  pub instructor: String,
  pub rating: usize,
  pub user_id: String,
}
