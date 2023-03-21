use super::*;

pub enum Requirement {
  Corequisites,
  Prerequisites,
  Restrictions,
  Unknown,
}

impl From<&str> for Requirement {
  fn from(s: &str) -> Self {
    match s {
      "Corequisite" => Self::Corequisites,
      "Prerequisite" => Self::Prerequisites,
      "Restriction" => Self::Restrictions,
      _ => Self::Unknown,
    }
  }
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, PartialEq)]
pub struct Requirements {
  pub corequisites: Vec<String>,
  pub prerequisites: Vec<String>,
  pub restrictions: Option<String>,
}

impl Requirements {
  pub fn set_corequisites(&mut self, corequisites: Vec<String>) {
    self.corequisites = corequisites;
  }

  pub fn set_prerequisites(&mut self, prerequisites: Vec<String>) {
    self.prerequisites = prerequisites;
  }

  pub fn set_restrictions(&mut self, restrictions: String) {
    self.restrictions = Some(restrictions);
  }
}
