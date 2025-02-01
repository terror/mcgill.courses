use super::*;

pub(crate) trait Retry {
  fn retry(self, max_retries: usize) -> Result<reqwest::blocking::Response>;
}

impl Retry for RequestBuilder {
  fn retry(self, max_retries: usize) -> Result<reqwest::blocking::Response> {
    let mut attempts = 0;

    let (base_delay, max_delay) =
      (Duration::from_millis(100), Duration::from_secs(30));

    while attempts <= max_retries {
      match self
        .try_clone()
        .ok_or_else(|| anyhow!("Failed to clone request builder"))?
        .send()
      {
        Ok(response) => return Ok(response),
        Err(error) => {
          error!(
            "Request failed (attempt {}/{}): {}",
            attempts + 1,
            max_retries + 1,
            error
          );

          if attempts == max_retries {
            break;
          }

          let (exp_delay, jitter) = (
            base_delay * (2_u32.pow(attempts as u32)),
            Duration::from_millis(rand::random::<u64>() % 100),
          );

          let delay = std::cmp::min(exp_delay + jitter, max_delay);

          warn!("Retrying in {:?}...", delay);

          thread::sleep(delay);

          attempts += 1;
        }
      }
    }

    Err(Error(anyhow!(
      "Request failed after {} attempts",
      max_retries + 1
    )))
  }
}
