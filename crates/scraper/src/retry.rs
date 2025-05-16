use super::*;

#[derive(Debug, Clone)]
pub(crate) struct RetryConfig {
  pub(crate) max_retries: usize,
  pub(crate) base_delay: Duration,
  pub(crate) max_delay: Duration,
}

impl Default for RetryConfig {
  fn default() -> Self {
    Self {
      max_retries: 3,
      base_delay: Duration::from_millis(100),
      max_delay: Duration::from_secs(30),
    }
  }
}

pub(crate) trait Retry {
  fn retry(self, max_retries: usize) -> Result<reqwest::blocking::Response>;

  fn retry_with_config(
    self,
    config: RetryConfig,
  ) -> Result<reqwest::blocking::Response>;
}

impl Retry for RequestBuilder {
  fn retry(self, max_retries: usize) -> Result<reqwest::blocking::Response> {
    self.retry_with_config(RetryConfig {
      max_retries,
      ..Default::default()
    })
  }

  fn retry_with_config(
    self,
    config: RetryConfig,
  ) -> Result<reqwest::blocking::Response> {
    let mut attempts = 0;

    while attempts <= config.max_retries {
      match self
        .try_clone()
        .ok_or_else(|| anyhow!("Failed to clone request builder"))?
        .send()
      {
        Ok(response) => {
          // some mcgill links are 404s :(
          if response.status().is_success()
            || response.status() == reqwest::StatusCode::NOT_FOUND
          {
            return Ok(response);
          } else {
            error!(
              "Request failed (attempt {}/{}): status {}",
              attempts + 1,
              config.max_retries + 1,
              response.status()
            );
          }
        }
        Err(error) => {
          error!(
            "Request failed (attempt {}/{}): {}",
            attempts + 1,
            config.max_retries + 1,
            error
          );
        }
      }

      if attempts == config.max_retries {
        break;
      }

      let (exp_delay, jitter) = (
        config
          .base_delay
          .saturating_mul(2_u32.saturating_pow(attempts as u32)),
        Duration::from_millis(rand::random::<u64>() % 100),
      );

      let delay = std::cmp::min(exp_delay + jitter, config.max_delay);

      warn!("Retrying in {:?}...", delay);

      thread::sleep(delay);

      attempts += 1;
    }

    Err(anyhow!(
      "Request failed after {} attempts",
      config.max_retries + 1
    ))
  }
}

#[cfg(test)]
mod tests {
  use {super::*, mockito::Server, std::time::Instant};

  #[test]
  fn successful_first_attempt() {
    let mut server = Server::new();

    let mock = server
      .mock("GET", "/success")
      .with_status(200)
      .with_body("success")
      .create();

    let client = reqwest::blocking::Client::builder()
      .build()
      .expect("Failed to create test client");

    let start = Instant::now();

    let response = client
      .get(format!("{}/success", server.url()))
      .retry(3)
      .expect("Request should succeed");

    mock.assert();

    assert_eq!(response.status(), 200);
    assert!(start.elapsed() < Duration::from_millis(500));
  }

  #[test]
  fn success_after_retries() {
    let mut server = Server::new();

    server
      .mock("GET", "/eventually-success")
      .with_status(500)
      .with_body("error")
      .expect(2)
      .create();

    server
      .mock("GET", "/eventually-success")
      .with_status(200)
      .with_body("success")
      .expect(1)
      .create();

    let client = reqwest::blocking::Client::builder()
      .build()
      .expect("Failed to create test client");

    let start = Instant::now();

    let response = client
      .get(format!("{}/eventually-success", server.url()))
      .retry(3)
      .expect("Request should eventually succeed");

    assert_eq!(response.status(), 200);
    assert!(start.elapsed() > Duration::from_millis(300));
  }

  #[test]
  fn max_retries_exceeded() {
    let mut server = Server::new();

    let mock = server
      .mock("GET", "/always-fail")
      .with_status(500)
      .with_body("error")
      .expect(4)  // Initial attempt + 3 retries
      .create();

    let client = reqwest::blocking::Client::builder()
      .build()
      .expect("Failed to create test client");

    let start = Instant::now();

    let result = client.get(format!("{}/always-fail", server.url())).retry(3);

    mock.assert();
    assert!(result.is_err());
    assert!(result.unwrap_err().to_string().contains("after 4 attempts"));
    assert!(start.elapsed() > Duration::from_millis(700));
  }

  #[test]
  fn max_delay_cap() {
    let mut server = Server::new();

    let mock = server
      .mock("GET", "/long-retry")
      .with_status(500)
      .with_body("error")
      .expect(10)  // Initial attempt + 9 retries
      .create();

    let client = reqwest::blocking::Client::builder()
      .build()
      .expect("Failed to create test client");

    let start = Instant::now();

    let result = client
      .get(format!("{}/long-retry", server.url()))
      .retry_with_config(RetryConfig {
        max_retries: 9,
        base_delay: Duration::from_millis(1),
        max_delay: Duration::from_millis(10),
      });

    mock.assert(); // Verify we made exactly 10 requests

    assert!(result.is_err());
    assert!(start.elapsed() < Duration::from_secs(1)); // 10ms * 10 = 100ms max delay + latency
  }

  #[test]
  fn no_retries() {
    let mut server = Server::new();

    let mock = server
      .mock("GET", "/no-retry")
      .with_status(500)
      .with_body("error")
      .expect(1)
      .create();

    let client = reqwest::blocking::Client::new();

    let start = Instant::now();

    let result = client
      .get(format!("{}/no-retry", server.url()))
      .retry_with_config(RetryConfig {
        max_retries: 0,
        base_delay: Duration::from_millis(50),
        max_delay: Duration::from_millis(100),
      });

    mock.assert();

    assert!(result.is_err());
    assert!(start.elapsed() < Duration::from_millis(200));
  }

  #[test]
  fn retry_on_4xx() {
    let mut server = Server::new();

    server
      .mock("GET", "/retry-4xx")
      .with_status(400)
      .with_body("not found")
      .expect(1)
      .create();

    server
      .mock("GET", "/retry-4xx")
      .with_status(200)
      .with_body("finally success")
      .expect(1)
      .create();

    let client = reqwest::blocking::Client::new();

    let start = Instant::now();

    let response = client
      .get(format!("{}/retry-4xx", server.url()))
      .retry_with_config(RetryConfig {
        max_retries: 1,
        base_delay: Duration::from_millis(50),
        max_delay: Duration::from_millis(50),
      })
      .expect("Should succeed on the second attempt");

    assert_eq!(response.status(), 200);
    assert!(start.elapsed() > Duration::from_millis(40));
  }
}
