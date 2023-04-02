use super::*;

#[derive(
  Clone,
  Debug,
  Default,
  Deserialize,
  Eq,
  Hash,
  Ord,
  PartialEq,
  PartialOrd,
  Serialize,
)]
pub struct Schedule {
  pub campus: Option<String>,
  pub display: Option<String>,
  pub location: Option<String>,
}

impl Into<Bson> for Schedule {
  fn into(self) -> bson::Bson {
    Bson::Document(doc! {
      "campus": self.campus.unwrap_or(String::new()),
      "display": self.display.unwrap_or(String::new()),
      "location": self.location.unwrap_or(String::new()),
    })
  }
}
