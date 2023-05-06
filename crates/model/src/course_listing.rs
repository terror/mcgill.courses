#[derive(Clone, Debug, Eq, Hash, PartialEq)]
pub struct CourseListing {
  pub department: String,
  pub faculty: String,
  pub level: String,
  pub terms: Vec<String>,
  pub url: String,
}

impl CourseListing {
  pub fn filter_terms(self) -> Self {
    Self {
      terms: self
        .terms
        .into_iter()
        .filter(|term| term != "Not Offered")
        .collect(),
      ..self
    }
  }
}
