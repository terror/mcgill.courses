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
pub struct Instructor {
  #[serde(rename = "_id")]
  pub id: Option<String>,
  pub name: String,
  pub term: String,
}

impl Into<Bson> for Instructor {
  fn into(self) -> bson::Bson {
    Bson::Document(doc! {
      "id": self.id,
      "name": self.name,
      "term": self.term,
    })
  }
}

impl Instructor {
  pub fn set_name(self, parts: &[&str]) -> Self {
    Self {
      name: format!(
        "{} {}",
        parts.get(1).unwrap_or(&""),
        parts.first().unwrap_or(&"")
      ),
      ..self
    }
  }

  pub fn set_term(self, term: &str) -> Self {
    Self {
      term: term.to_owned(),
      ..self
    }
  }
}
