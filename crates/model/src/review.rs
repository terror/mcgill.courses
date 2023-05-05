use super::*;

#[derive(Clone, Debug, Serialize, Deserialize, Hash, Eq, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Review {
  pub content: String,
  pub course_id: String,
  pub instructor: String,
  pub rating: u32,
  pub timestamp: DateTime,
  pub user_id: String,
}

impl Default for Review {
  fn default() -> Self {
    Self {
      content: String::new(),
      course_id: String::new(),
      instructor: String::new(),
      rating: 0,
      timestamp: DateTime::from_chrono::<Utc>(
        Utc.from_utc_datetime(&NaiveDateTime::default()),
      ),
      user_id: String::new(),
    }
  }
}
