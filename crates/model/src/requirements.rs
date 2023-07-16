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

#[derive(Debug, PartialEq, Eq, Serialize, Deserialize, Clone)]
pub enum Operator {
  #[serde(rename = "AND")]
  And,
  #[serde(rename = "OR")]
  Or,
}

#[derive(Debug, PartialEq, Eq, Serialize, Deserialize, Clone)]
#[serde(untagged)]
pub enum ReqNode {
  Course(String),
  Group {
    operator: Operator,
    groups: Vec<ReqNode>,
  },
}

impl Default for ReqNode {
  fn default() -> Self {
    Self::Course("".to_string())
  }
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, PartialEq)]
pub struct Requirements {
  pub prerequisites_text: Option<String>,
  pub corequisites_text: Option<String>,
  pub corequisites: Vec<String>,
  pub prerequisites: Vec<String>,
  pub restrictions: Option<String>,
  pub logical_prerequisites: Option<ReqNode>,
  pub logical_corequisites: Option<ReqNode>,
}

impl Requirements {
  pub fn set_prerequisites_text(&mut self, prerequisites_text: Option<String>) {
    self.prerequisites_text = prerequisites_text;
  }

  pub fn set_corequisites_text(&mut self, corequisites_text: Option<String>) {
    self.corequisites_text = corequisites_text;
  }

  pub fn set_corequisites(&mut self, corequisites: Vec<String>) {
    self.corequisites = corequisites;
  }

  pub fn set_prerequisites(&mut self, prerequisites: Vec<String>) {
    self.prerequisites = prerequisites;
  }

  pub fn set_restrictions(&mut self, restrictions: String) {
    self.restrictions = Some(restrictions);
  }

  pub fn set_logical_prerequisites(
    &mut self,
    logical_prerequisites: Option<ReqNode>,
  ) {
    self.logical_prerequisites = logical_prerequisites;
  }

  pub fn set_logical_corequisites(
    &mut self,
    logical_corequisites: Option<ReqNode>,
  ) {
    self.logical_corequisites = logical_corequisites;
  }
}
