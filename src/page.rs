use super::*;

#[derive(Debug)]
pub(crate) struct Page {
  pub(crate) number: usize,
  pub(crate) url: String,
}

impl Page {
  pub(crate) fn content(&self) -> Result<String> {
    Ok(reqwest::blocking::get(self.url.clone())?.text()?)
  }
}
