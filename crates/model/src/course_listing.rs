use super::*;

#[derive(Debug, Clone, PartialEq, Hash, Eq)]
pub struct CourseListing {
  pub department: String,
  pub faculty: String,
  pub level: String,
  pub terms: Vec<String>,
  pub url: String,
}

impl CourseListing {
  pub fn content(&self) -> Result<String> {
    Ok(reqwest::blocking::get(self.url.clone())?.text()?)
  }
}
