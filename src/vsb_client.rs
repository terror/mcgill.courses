use super::*;

#[derive(Debug)]
pub(crate) struct VsbClient {
  client: reqwest::blocking::Client,
  term: String,
}

impl VsbClient {
  const BASE_URL: &str = "https://vsb.mcgill.ca/vsb/getclassdata.jsp";

  pub(crate) fn new(term: String, user_agent: String) -> Result<Self> {
    Ok(Self {
      client: reqwest::blocking::Client::builder()
        .user_agent(user_agent)
        .build()?,
      term,
    })
  }

  pub(crate) fn schedule(&self, code: &str) -> Result<Vec<Schedule>> {
    extractor::extract_schedule(
      &self
        .client
        .get(&self.format_url(code))
        .header("Accept-Encoding", "")
        .send()?
        .text()?,
    )
  }

  fn format_url(&self, code: &str) -> String {
    format!(
      "{}?term={}&course_1_0={}&rq_1_0=null{}&nouser=1&_={}",
      VsbClient::BASE_URL,
      self.term,
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
