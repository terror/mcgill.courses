use super::*;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Subscription {
  pub course_id: String,
  pub user_id: String,
}

impl Into<Bson> for Subscription {
  fn into(self) -> Bson {
    Bson::Document(doc! {
      "course_id": self.course_id,
      "user_id": self.user_id,
    })
  }
}
