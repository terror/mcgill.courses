use super::*;

#[derive(Debug)]
pub(crate) struct VsbClient {
  client: reqwest::blocking::Client,
  retries: usize,
}

impl VsbClient {
  pub const BASE_URL: &'static str = "https://vsb.mcgill.ca/api/class-data";

  pub(crate) fn new(
    user_agent: &str,
    cookie: &str,
    retries: usize,
  ) -> Result<Self> {
    let client = Client::builder()
      .user_agent(user_agent)
      .default_headers(
        [(
          reqwest::header::COOKIE,
          reqwest::header::HeaderValue::from_str(cookie)?,
        )]
        .into_iter()
        .collect(),
      )
      .build()?;

    Ok(Self { client, retries })
  }

  pub(crate) fn schedule(
    &self,
    code: &str,
    terms: Vec<usize>,
  ) -> Result<Vec<Schedule>> {
    info!("Scraping schedules for {code}...");

    let url = |code: &str, term: usize| -> String {
      let t = (Utc::now().timestamp_millis() / 60000) % 1000;

      let e = (t % 3) + (t % 39) + (t % 42);

      format!(
        "{}?term={term}&course_0_0={code}&t={t}&e={e}",
        VsbClient::BASE_URL,
      )
    };

    let schedules = terms
      .into_iter()
      .map(|term| -> Result<Vec<Schedule>> {
        vsb_extractor::extract_course_schedules(
          &self
            .client
            .get(url(code, term))
            .retry(self.retries)?
            .text()?,
        )
      })
      .collect::<Result<Vec<_>>>()?
      .into_iter()
      .flatten()
      .collect();

    info!("Found schedules: {schedules:?}");

    Ok(schedules)
  }
}
