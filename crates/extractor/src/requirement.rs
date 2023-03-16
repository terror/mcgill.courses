pub enum Requirement {
  Corequisites,
  Prerequisites,
  Unknown,
}

impl From<&str> for Requirement {
  fn from(s: &str) -> Self {
    match s {
      "Corequisite" => Self::Corequisites,
      "Prerequisite" => Self::Prerequisites,
      _ => Self::Unknown,
    }
  }
}
