use super::*;

#[derive(Debug, Clone, PartialEq)]
pub(crate) struct CourseListing {
  pub(crate) department: String,
  pub(crate) faculty: String,
  pub(crate) level: String,
  pub(crate) terms: Vec<String>,
  pub(crate) url: String,
}

impl CourseListing {
  pub(crate) fn content(&self) -> Result<String> {
    Ok(reqwest::blocking::get(self.url.clone())?.text()?)
  }
}
