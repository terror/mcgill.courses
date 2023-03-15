use super::*;

#[derive(Debug, Clone, Serialize, Deserialize)]
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

pub(crate) enum Requirement {
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

#[derive(Debug, Clone, Serialize, Deserialize)]
pub(crate) struct Requirements {
  pub(crate) corequisites: Vec<String>,
  pub(crate) prerequisites: Vec<String>,
}

impl Requirements {
  pub(crate) fn new() -> Self {
    Self {
      corequisites: Vec::new(),
      prerequisites: Vec::new(),
    }
  }

  pub(crate) fn set_requirement(&mut self, requirement: Requirement, data: Vec<String>) -> Result {
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

#[derive(Debug, Clone, Serialize, Deserialize)]
pub(crate) struct Schedule {
  pub(crate) campus: Option<String>,
  pub(crate) course_type: Option<String>,
  pub(crate) location: Option<String>,
  pub(crate) section: Option<String>,
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
  pub(crate) schedule: Vec<Schedule>,
}
