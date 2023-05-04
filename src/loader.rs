use super::*;

#[derive(Parser)]
pub(crate) struct Loader {
  #[clap(long)]
  user_agent: String,
  #[clap(long, default_value = "0")]
  course_delay: u64,
  #[clap(long, default_value = "0")]
  page_delay: u64,
  #[clap(long, default_value = "20")]
  batch_size: usize,
  #[clap(long, default_value = "2022-2023")]
  mcgill_term: String,
  #[clap(long, default_value = "202305")]
  vsb_term: usize,
  #[clap(long, default_value = "false")]
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

    let listings = extractor::extract_course_listings(&page.content()?)?;

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

    let mut content = listing.content();

    while let Err(ref error) = content {
      log::error!("Error fetching course information: {error}, retrying...");
      thread::sleep(Duration::from_secs(1));
      content = listing.content();
    }

    let course_page = extractor::extract_course_page(&content?)?;

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
      schedule: if self.scrape_vsb {
        Some(VsbClient::new(self.user_agent.to_string())?.schedule(
          &format!("{}-{}", course_page.subject, course_page.code),
          self.vsb_term,
        )?)
      } else {
        None
      },
    })
  }
}
