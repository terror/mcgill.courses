use super::*;

#[derive(Clone, Debug, Serialize, Deserialize, Hash, Eq, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Like {
  pub course_id: String,
  pub user_id: String,
}
