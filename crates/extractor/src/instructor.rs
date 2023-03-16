use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Instructor {
  pub name: String,
  pub term: String,
}

impl Instructor {
  pub fn new() -> Self {
    Self {
      name: String::new(),
      term: String::new(),
    }
  }

  pub fn set_name_from_parts(self, parts: Vec<&str>) -> Self {
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
