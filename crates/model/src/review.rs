use super::*;

#[derive(
  Clone, Debug, Default, Serialize, Deserialize, Hash, Eq, PartialEq,
)]
#[serde(rename_all = "camelCase")]
pub struct Review {
  pub content: String,
  pub course_id: String,
  pub instructor: String,
  pub rating: u32,
  pub user_id: String,
}
