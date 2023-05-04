use reqwest::blocking::{RequestBuilder, Response};

use super::*;

pub(crate) trait Retry {
  fn retry(self, retries: u32) -> Result<Response>;
}

impl Retry for RequestBuilder {
  fn retry(self, retries: u32) -> Result<Response> {
    let mut attempts = 0;

    while attempts <= retries {
      match self
        .try_clone()
        .ok_or_else(|| anyhow!("Failed to clone request builder"))?
        .send()
      {
        Ok(response) => return Ok(response),
        Err(err) => {
          if err.is_timeout() {
            attempts += 1;
            thread::sleep(Duration::from_secs(1));
          } else {
            return Err(err.into());
          }
        }
      }
    }

    Err(Error(anyhow!("Request timed out")))
  }
}
