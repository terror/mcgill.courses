use super::*;

#[derive(Debug, Serialize, Deserialize)]
pub struct Review {
  content: String,
  course_id: String,
  user_id: String,
}
