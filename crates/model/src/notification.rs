use super::*;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Notification {
  pub review: Review,
  pub seen: bool,
  pub user_id: String,
}
