use super::*;

#[derive(Debug)]
pub(crate) struct VsbClient<'a> {
  client: &'a reqwest::blocking::Client,
  retries: usize,
}

impl<'a> VsbClient<'a> {
  const BASE_URL: &'static str = "https://vsb.mcgill.ca/vsb/getclassdata.jsp";

  pub(crate) fn new(
    client: &'a reqwest::blocking::Client,
    retries: usize,
  ) -> Result<Self> {
    Ok(Self { client, retries })
  }

  pub(crate) fn schedule(
    &self,
    code: &str,
    terms: Vec<usize>,
  ) -> Result<Vec<Schedule>> {
    info!("Scraping schedules for {}...", code);

    let schedules = terms
      .into_iter()
      .map(|term| -> Result<Vec<Schedule>> {
        let res = &self
          .client
          .get(self.url(code, term))
          .retry(self.retries)?
          .text()?;

        Ok(VsbExtractor::extract_course_schedules(res)?)
      })
      .collect::<Result<Vec<_>>>()?
      .into_iter()
      .flatten()
      .collect();

    Ok(schedules)
  }

  fn url(&self, code: &str, term: usize) -> String {
    format!(
      "{}?term={}&course_1_0={}&rq_1_0=null{}&nouser=1&_={}",
      VsbClient::BASE_URL,
      term,
      code,
      self.window(),
      chrono::Local::now().timestamp_millis()
    )
  }

  fn window(&self) -> String {
    let f8b0 = ["\x26\x74\x3D", "\x26\x65\x3D"];
    let t = (chrono::Utc::now().timestamp_millis() / 60000) % 1000;
    let e = (t % 3) + (t % 19) + (t % 42);
    format!("{}{}{}{}", f8b0[0], t, f8b0[1], e)
  }
}
