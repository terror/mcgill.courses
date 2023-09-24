use super::*;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Notification {
  pub course_id: String,
  pub seen: bool,
  pub user_id: String,
  // TODO: add review on here
  // pub review: Review
}

impl Into<Bson> for Notification {
  fn into(self) -> Bson {
    Bson::Document(doc! {
      "course_id": self.course_id,
      "seen": self.seen,
      "user_id": self.user_id,
    })
  }
}
