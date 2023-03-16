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
  #[clap(long, default_value = "202305")]
  vsb_term: usize,
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

    fs::write(source, serde_json::to_string(&courses)?)
      .map_err(anyhow::Error::from)
  }

  fn aggregate_urls(&self, start: usize, end: usize) -> Vec<Page> {
    (start..=end)
      .map(|index| Page {
        number: index,
        url: format!(
          "{}/study/2022-2023/courses/search?page={}",
          Loader::BASE_URL,
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

    let listings = extract::extract_course_listing_page(&page.content()?)?;

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

    let course_page = extract::extract_course_page(&listing.content()?)?;

    log::info!(
      "Parsed course {}{}",
      &course_page.subject,
      &course_page.code
    );

    Ok(Course {
      title: course_page.title,
      subject: course_page.subject.clone(),
      code: course_page.code.clone(),
      department: listing.department,
      description: course_page.description,
      faculty: listing.faculty,
      faculty_url: format!("{}{}", Loader::BASE_URL, course_page.faculty_url),
      instructors: course_page.instructors,
      requirements: course_page.requirements,
      terms: listing.terms,
      level: listing.level,
      url: listing.url,
      schedule: VsbClient::new(
        self.vsb_term.to_string(),
        self.user_agent.to_string(),
      )?
      .schedule(&format!("{}-{}", course_page.subject, course_page.code))?,
    })
  }
}
