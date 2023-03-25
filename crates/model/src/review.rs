use super::*;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Review {
  content: String,
  course_id: String,
  user_id: String,
}
