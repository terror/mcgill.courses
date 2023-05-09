use super::*;

#[derive(Parser)]
pub(crate) struct Loader {
  #[clap(long, help = "A user agent")]
  user_agent: String,
  #[clap(
    long,
    default_value = "0",
    help = "Time delay between course requests in milliseconds"
  )]
  course_delay: u64,
  #[clap(
    long,
    default_value = "0",
    help = "Time delay between page requests in milliseconds"
  )]
  page_delay: u64,
  #[clap(long, default_value = "10", help = "Number of retries")]
  retries: usize,
  #[clap(
    long,
    default_value = "20",
    help = "Number of pages to scrape per concurrent batch"
  )]
  batch_size: usize,
  #[clap(
    long,
    default_value = "2022-2023",
    help = "The mcgill term to scrape"
  )]
  mcgill_term: String,
  #[clap(
    long,
    default_values = ["202305", "202309", "202401"],
    help = "The schedule builder term to scrape"
  )]
  vsb_terms: Vec<usize>,
  #[clap(
    long,
    default_value = "false",
    help = "Scrape visual schedule builder information"
  )]
  scrape_vsb: bool,
}

impl Loader {
  const BASE_URL: &str = "https://www.mcgill.ca";

  pub(crate) fn run(&self, source: PathBuf) -> Result {
    log::info!("Running extractor...");

    let mut courses = Vec::new();

    let mut page = 0;

    while let Some(listings) = self.parse_course_listing_pages(
      self.aggregate_urls(page, page + self.batch_size),
    )? {
      courses.extend(
        listings
          .par_iter()
          .map(|listing| self.parse_course(listing.clone()))
          .collect::<Result<Vec<Course>, _>>()?,
      );
      page += self.batch_size;
    }

    let mut courses = courses
      .into_iter()
      .collect::<HashSet<Course>>()
      .into_iter()
      .filter(|course| !course.title.is_empty())
      .collect::<Vec<Course>>();

    courses.sort();

    fs::write(source, serde_json::to_string_pretty(&courses)?)
      .map_err(|err| Error(anyhow::Error::from(err)))
  }

  fn aggregate_urls(&self, start: usize, end: usize) -> Vec<Page> {
    (start..=end)
      .map(|index| Page {
        number: index,
        url: format!(
          "{}/study/{}/courses/search?page={}",
          Loader::BASE_URL,
          self.mcgill_term,
          index
        ),
      })
      .collect()
  }

  fn parse_course_listing_pages(
    &self,
    pages: Vec<Page>,
  ) -> Result<Option<Vec<CourseListing>>> {
    Ok(
      pages
        .par_iter()
        .flat_map(|page| {
          self
            .parse_course_listing_page(page)
            .unwrap_or(Some(Vec::new()))
            .unwrap_or(Vec::new())
        })
        .collect::<Vec<CourseListing>>()
        .into_option(),
    )
  }

  fn parse_course_listing_page(
    &self,
    page: &Page,
  ) -> Result<Option<Vec<CourseListing>>> {
    log::info!("Parsing html on page: {}...", page.number);

    let listings = extractor::extract_course_listings(
      &reqwest::blocking::Client::builder()
        .user_agent(&self.user_agent)
        .build()?
        .get(&page.url)
        .retry(self.retries)?
        .text()?,
    )?;

    thread::sleep(Duration::from_millis(self.page_delay));

    if let Some(listings) = listings {
      return Ok(Some(
        listings
          .iter()
          .map(|listing| CourseListing {
            url: format!("{}{}", Loader::BASE_URL, listing.url),
            ..listing.clone()
          })
          .collect(),
      ));
    }

    Ok(None)
  }

  fn parse_course(&self, listing: CourseListing) -> Result<Course> {
    log::info!("{:?}", listing);

    let client = reqwest::blocking::Client::builder()
      .user_agent(&self.user_agent)
      .build()?;

    let course_page = extractor::extract_course_page(
      &client.get(&listing.url).retry(self.retries)?.text()?,
    )?;

    log::info!(
      "Parsed course {}{}",
      &course_page.subject,
      &course_page.code
    );

    thread::sleep(Duration::from_millis(self.course_delay));

    Ok(Course {
      id: format!("{}{}", course_page.subject, course_page.code),
      id_ngrams: None,
      title: course_page.title.clone(),
      title_ngrams: None,
      credits: course_page.credits,
      subject: course_page.subject.clone(),
      code: course_page.code.clone(),
      level: listing.level,
      url: listing.url,
      department: listing.department,
      faculty: listing.faculty,
      faculty_url: format!("{}{}", Loader::BASE_URL, course_page.faculty_url),
      terms: listing.terms,
      description: course_page.description,
      instructors: course_page.instructors,
      prerequisites: course_page.requirements.prerequisites,
      corequisites: course_page.requirements.corequisites,
      restrictions: course_page.requirements.restrictions,
      schedule: self.scrape_vsb.then_some(
        VsbClient::new(&client, self.retries)?.schedule(
          &format!("{}-{}", course_page.subject, course_page.code),
          self.vsb_terms.clone(),
        )?,
      ),
    })
  }
}
