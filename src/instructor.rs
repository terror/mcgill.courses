use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub(crate) struct Instructor {
  pub(crate) name: String,
  pub(crate) term: String,
}

impl Instructor {
  pub(crate) fn new() -> Self {
    Self {
      name: String::new(),
      term: String::new(),
    }
  }

  pub(crate) fn set_name_from_parts(self, parts: Vec<&str>) -> Self {
    Self {
      name: format!(
        "{} {}",
        parts.get(1).unwrap_or(&""),
        parts.first().unwrap_or(&"")
      ),
      ..self
    }
  }

  pub(crate) fn set_term(self, term: &str) -> Self {
    Self {
      term: term.to_owned(),
      ..self
    }
  }
}
