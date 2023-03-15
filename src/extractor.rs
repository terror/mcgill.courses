use super::*;

#[derive(Parser)]
pub(crate) struct Extractor {
  #[clap(long, default_value = "20")]
  batch_size: usize,
  #[clap(long, default_value = "202305")]
  vsb_term: usize,
}

#[derive(Debug)]
struct Page {
  pub(crate) number: usize,
  pub(crate) url: String,
}

impl Page {
  fn content(&self) -> Result<String> {
    Ok(reqwest::blocking::get(self.url.clone())?.text()?)
  }
}

#[derive(Debug, Clone)]
struct Entry {
  pub(crate) department: String,
  pub(crate) faculty: String,
  pub(crate) level: String,
  pub(crate) terms: Vec<String>,
  pub(crate) url: String,
}

impl Entry {
  fn content(&self) -> Result<String> {
    Ok(reqwest::blocking::get(self.url.clone())?.text()?)
  }
}

#[derive(Debug)]
struct VsbClient {
  client: reqwest::blocking::Client,
  term: String,
}

impl VsbClient {
  const BASE_URL: &str = "https://vsb.mcgill.ca/vsb/getclassdata.jsp";

  pub(crate) fn new(term: String) -> Result<Self> {
    Ok(Self {
      client: reqwest::blocking::Client::builder()
        .user_agent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36")
        .build()?,
      term,
    })
  }

  pub(crate) fn schedule(&self, code: &str) -> Result<Vec<Schedule>> {
    let response = self
      .client
      .get(&format!(
        "{}?term={}&course_1_0={}&rq_1_0=null{}&nouser=1&_={}",
        VsbClient::BASE_URL,
        self.term,
        code,
        self.window(),
        chrono::Local::now().timestamp_millis()
      ))
      .header("Accept-Encoding", "")
      .send()?
      .text()?;

    let html = Html::parse_fragment(&response);

    let error = html
      .root_element()
      .select_single("errors")?
      .select_many("error")?;

    if !error.is_empty() {
      return Ok(Vec::new());
    }

    Ok(
      html
        .root_element()
        .select_many("block")?
        .iter()
        .map(|block| Schedule {
          campus: block.value().attr("campus").map(|s| s.to_string()),
          course_type: block.value().attr("type").map(|s| s.to_string()),
          location: block.value().attr("location").map(|s| s.to_string()),
          section: block.value().attr("section").map(|s| s.to_string()),
        })
        .collect(),
    )
  }

  fn window(&self) -> String {
    let f8b0 = ["\x26\x74\x3D", "\x26\x65\x3D"];
    let t = (chrono::Utc::now().timestamp_millis() / 60000) % 1000;
    let e = (t % 3) + (t % 19) + (t % 42);
    format!("{}{}{}{}", f8b0[0], t, f8b0[1], e)
  }
}

impl Extractor {
  const BASE_URL: &str = "https://www.mcgill.ca";

  pub(crate) fn run(&self, source: PathBuf) -> Result {
    log::info!("Running extractor...");

    let mut courses = Vec::new();

    let mut page = 0;

    while let Some(entries) = self.parse_pages(self.aggregate_urls(page, page + self.batch_size))? {
      courses.extend(
        entries
          .par_iter()
          .map(|entry| self.parse_course(entry.clone()))
          .collect::<Result<Vec<Course>, _>>()?,
      );
      page += self.batch_size;
    }

    fs::write(source, serde_json::to_string(&courses)?).map_err(anyhow::Error::from)
  }

  fn aggregate_urls(&self, start: usize, end: usize) -> Vec<Page> {
    (start..=end)
      .map(|index| Page {
        number: index,
        url: format!(
          "{}/study/2022-2023/courses/search?page={}",
          Extractor::BASE_URL,
          index
        ),
      })
      .collect()
  }

  fn parse_pages(&self, pages: Vec<Page>) -> Result<Option<Vec<Entry>>> {
    Ok(
      pages
        .par_iter()
        .flat_map(|page| {
          self
            .parse_page(page)
            .unwrap_or(Some(Vec::new()))
            .unwrap_or(Vec::new())
        })
        .collect::<Vec<Entry>>()
        .into_option(),
    )
  }

  fn parse_page(&self, page: &Page) -> Result<Option<Vec<Entry>>> {
    log::info!("Parsing html on page: {}...", page.number);

    let html = Html::parse_fragment(&page.content()?);

    let content = html
      .root_element()
      .select_optional("div[class='view-content']")?;

    if content.is_none() {
      log::info!("Did not find any content on page {}", page.number);
      return Ok(None);
    }

    log::info!("Parsing found content on page {}...", page.number);

    let results = content
      .unwrap()
      .select_many("div[class~='views-row']")?
      .iter()
      .map(|entry| -> Result<Entry> {
        Ok(Entry {
          department: entry
            .select_single("span[class~='views-field-field-dept-code']")?
            .select_single("span[class='field-content']")?
            .inner_html(),
          faculty: entry
            .select_single("span[class~='views-field-field-faculty-code']")?
            .select_single("span[class='field-content']")?
            .inner_html(),
          level: entry
            .select_single("span[class~='views-field-level']")?
            .select_single("span[class='field-content']")?
            .inner_html(),
          terms: entry
            .select_single("span[class~='views-field-terms']")?
            .select_single("span[class='field-content']")?
            .inner_html()
            .split(", ")
            .map(|term| term.to_owned())
            .collect::<Vec<String>>(),
          url: format!(
            "{}{}",
            Extractor::BASE_URL,
            entry
              .select_single("div[class~='views-field-field-course-title-long']",)?
              .select_single("a")?
              .value()
              .attr("href")
              .ok_or_else(|| anyhow!("Failed to get attribute"))?
          ),
        })
      })
      .collect::<Result<Vec<Entry>, _>>();

    let entries = results?
      .into_iter()
      .filter(|entry| !entry.terms.contains(&String::from("Not Offered")))
      .collect::<Vec<Entry>>();

    log::info!("Scraped entries on page {}: {:?}", page.number, entries);

    Ok(Some(entries))
  }

  fn parse_instructors(&self, input: &str) -> Vec<Instructor> {
    let mut tokens = input.to_owned();

    ["Fall", "Winter", "Summer"]
      .iter()
      .flat_map(|term| match tokens.contains(&format!("({term})")) {
        false => Vec::new(),
        _ => {
          let split = tokens.split(&format!("({term})")).collect::<Vec<&str>>();

          let instructors = split[0]
            .split(';')
            .map(|s| {
              Instructor::new()
                .set_name_from_parts(s.trim().split(", ").collect())
                .set_term(term)
            })
            .collect();

          if split.len() > 1 {
            tokens = split[1].trim().to_string();
          }

          instructors
        }
      })
      .collect()
  }

  fn parse_requirements(&self, notes: Vec<ElementRef>) -> Result<Requirements> {
    let mut requirements = Requirements::new();

    notes.iter().try_for_each(|note| -> Result {
      let curr = note.select_single("li")?.select_single("p")?;

      ["Prerequisite", "Corequisite"]
        .iter()
        .try_for_each(|title| -> Result {
          match curr.inner_html().starts_with(title) {
            false => Ok(()),
            _ => requirements.set_requirement(
              Requirement::from(*title),
              curr
                .select_many("a")?
                .iter()
                .map(|link| link.inner_html())
                .collect(),
            ),
          }
        })
    })?;

    Ok(requirements)
  }

  fn parse_course(&self, entry: Entry) -> Result<Course> {
    let html = Html::parse_fragment(&entry.content()?);

    let full_title = html
      .root_element()
      .select_single("h1[id='page-title']")?
      .inner_html()
      .trim()
      .to_owned();

    let full_code = full_title
      .split(' ')
      .take(2)
      .collect::<Vec<&str>>()
      .join(" ");

    let subject = full_code
      .split(' ')
      .take(1)
      .collect::<Vec<&str>>()
      .join(" ");

    let code = full_code
      .split(' ')
      .skip(1)
      .collect::<Vec<&str>>()
      .join(" ");

    let content = html
      .root_element()
      .select_single("div[class='node node-catalog clearfix']")?;

    log::info!("Parsed course {}{}", &subject, &code);

    Ok(Course {
      id: Uuid::new_v5(
        &Uuid::NAMESPACE_X500,
        format!("{}-{}", subject, &code).as_bytes(),
      )
      .to_string(),
      title: full_title
        .split(' ')
        .skip(2)
        .collect::<Vec<&str>>()
        .join(" "),
      subject: subject.clone(),
      code: code.clone(),
      level: entry.level,
      url: entry.url,
      department: entry.department,
      faculty: entry.faculty,
      faculty_url: format!(
        "{}{}",
        Extractor::BASE_URL,
        content
          .select_single("div[class='meta']")?
          .select_single("p")?
          .select_single("a")?
          .value()
          .attr("href")
          .ok_or_else(|| anyhow!("Failed to get attribute"))?
      ),
      description: content
        .select_single("div[class='content']")?
        .select_single("p")?
        .inner_html()
        .trim()
        .split(':')
        .skip(1)
        .collect::<Vec<&str>>()
        .join(" ")
        .trim()
        .to_owned(),
      terms: entry.terms,
      instructors: self.parse_instructors(
        content
          .select_single("p[class='catalog-instructors']")?
          .inner_html()
          .trim()
          .split(' ')
          .skip(1)
          .collect::<Vec<&str>>()
          .join(" ")
          .trim(),
      ),
      requirements: self.parse_requirements(
        html
          .root_element()
          .select_many("ul[class='catalog-notes']")?,
      )?,
      schedule: VsbClient::new(self.vsb_term.to_string())?
        .schedule(&format!("{}-{}", subject, code))?,
    })
  }
}
