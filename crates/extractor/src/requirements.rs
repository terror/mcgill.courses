use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Requirements {
  pub(crate) corequisites: Vec<String>,
  pub(crate) prerequisites: Vec<String>,
}

impl Requirements {
  pub fn new() -> Self {
    Self {
      corequisites: Vec::new(),
      prerequisites: Vec::new(),
    }
  }

  pub fn set_requirement(
    &mut self,
    requirement: Requirement,
    data: Vec<String>,
  ) -> Result {
    match requirement {
      Requirement::Corequisites => Ok(self.set_corequisites(data)),
      Requirement::Prerequisites => Ok(self.set_prerequisites(data)),
      Requirement::Unknown => Err(anyhow!("Unknown course requirement")),
    }
  }

  fn set_corequisites(&mut self, corequisites: Vec<String>) {
    self.corequisites = corequisites;
  }

  fn set_prerequisites(&mut self, prerequisites: Vec<String>) {
    self.prerequisites = prerequisites;
  }
}
