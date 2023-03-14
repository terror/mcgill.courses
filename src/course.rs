use super::*;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub(crate) struct Instructor {
  pub(crate) name: String,
  pub(crate) term: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub(crate) struct Requirements {
  corequisites: Vec<String>,
  prerequisites: Vec<String>,
}

impl Requirements {
  pub(crate) fn new() -> Self {
    Self {
      corequisites: Vec::new(),
      prerequisites: Vec::new(),
    }
  }

  pub(crate) fn set_corequisites(&mut self, corequisites: Vec<String>) {
    self.corequisites = corequisites;
  }

  pub(crate) fn set_prerequisites(&mut self, prerequisites: Vec<String>) {
    self.prerequisites = prerequisites;
  }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub(crate) struct Course {
  pub(crate) id: String,
  pub(crate) title: String,
  pub(crate) subject: String,
  pub(crate) code: String,
  pub(crate) level: String,
  pub(crate) url: String,
  pub(crate) department: String,
  pub(crate) faculty: String,
  pub(crate) faculty_url: String,
  pub(crate) terms: Vec<String>,
  pub(crate) description: String,
  pub(crate) instructors: Vec<Instructor>,
  pub(crate) requirements: Requirements,
}
