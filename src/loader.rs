use super::*;

#[derive(Parser)]
pub(crate) struct Loader {
  #[clap(
    long,
    default_value = "20",
    help = "Number of pages to scrape per concurrent batch"
  )]
  batch_size: usize,

  #[clap(
    long,
    default_value = "0",
    help = "Time delay between course requests in milliseconds"
  )]
  course_delay: u64,

  #[clap(
    default_value = "catalog",
    help = "Extraction mode",
    long,
    value_enum
  )]
  extraction_mode: ExtractionMode,

  #[clap(
    long,
    default_values = [
      "2009-2010",
      "2010-2011",
      "2011-2012",
      "2012-2013",
      "2013-2014",
      "2014-2015",
      "2015-2016",
      "2016-2017",
      "2017-2018",
      "2018-2019",
      "2019-2020",
      "2020-2021",
      "2021-2022",
      "2022-2023",
      "2023-2024",
      "2024-2025",
    ],
    help = "The mcgill terms to scrape"
  )]
  mcgill_terms: Vec<String>,

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
    default_value = "false",
    help = "Scrape visual schedule builder information"
  )]
  scrape_vsb: bool,

  #[clap(long, help = "A user agent")]
  user_agent: String,

  #[clap(
    long,
    default_values = ["202405", "202409", "202501"],
    help = "The schedule builder terms to scrape"
  )]
  vsb_terms: Vec<usize>,
}

impl Loader {
  pub(crate) fn run(&self, source: PathBuf) -> Result {
    info!("Running extractor...");

    for (index, term) in self.mcgill_terms.iter().enumerate() {
      let mut courses = Vec::new();

      let mut page = 0;

      while let Some(listings) = self.parse_course_listing_pages(
        self.aggregate_urls(term, page, page + self.batch_size),
      )? {
        let scrape_vsb =
          self.scrape_vsb && index == self.mcgill_terms.len() - 1;

        courses.extend(
          listings
            .par_iter()
            .map(|listing| self.parse_course(listing.clone(), scrape_vsb))
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

      let source = if source.is_dir() {
        source.join(format!("courses-{term}.json"))
      } else {
        source.clone()
      };

      if source.exists() {
        info!("Merging with existing courses...");

        let sourced =
          serde_json::from_str::<Vec<Course>>(&fs::read_to_string(&source)?)?;

        let mut merged = courses
          .iter()
          .map(|course| {
            sourced
              .iter()
              .find(|sourced| sourced.id == course.id)
              .map(|sourced| sourced.clone().merge(course.clone()))
              .unwrap_or_else(|| course.clone())
          })
          .collect::<Vec<Course>>();

        let courses = &self.post_process(&mut merged)?;

        fs::write(&source, serde_json::to_string_pretty(&courses)?)?;
      } else {
        fs::write(
          &source,
          serde_json::to_string_pretty(&&self.post_process(&mut courses)?)?,
        )?;
      }
    }

    Ok(())
  }

  fn post_process(&self, courses: &mut [Course]) -> Result<Vec<Course>, Error> {
    info!("Post processing courses...");

    let mapping = courses
      .iter()
      .enumerate()
      .map(|(index, course)| {
        (
          index,
          courses
            .iter()
            .filter(|other| {
              other.id != course.id && other.prerequisites.contains(&course.id)
            })
            .map(|other| other.id.clone())
            .collect(),
        )
      })
      .collect::<Vec<(usize, Vec<String>)>>();

    for (i, leading_to) in mapping {
      courses[i].leading_to = leading_to;
    }

    Ok(courses.to_vec())
  }

  fn aggregate_urls(&self, term: &str, start: usize, end: usize) -> Vec<Page> {
    (start..=end)
      .map(|index| {
        let url = match self.extraction_mode {
          ecalendar @ ExtractionMode::ECalendar => {
            format!(
              "{}/study/{}/courses/search?page={}",
              ecalendar.base_url(),
              term,
              index
            )
          }
          catalog @ ExtractionMode::Catalog => {
            format!(
              "{}/search/?f[0]=type:courses&query=*&page={}",
              catalog.base_url(),
              index
            )
          }
        };

        Page { number: index, url }
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
            .unwrap_or_default()
        })
        .collect::<Vec<CourseListing>>()
        .into_option(),
    )
  }

  fn parse_course_listing_page(
    &self,
    page: &Page,
  ) -> Result<Option<Vec<CourseListing>>> {
    info!("Parsing html on page: {}...", page.number);

    let client = Client::builder().user_agent(&self.user_agent).build()?;

    let extractor = self.extraction_mode.course_extractor();

    let listings = {
      let mut listings = extractor.extract_course_listings(
        &client.get(&page.url).retry(self.retries)?.text()?,
      );

      while listings.is_err() {
        warn!("Retrying course listings: {}", page.url);

        thread::sleep(Duration::from_millis(500));

        listings = extractor.extract_course_listings(
          &client.get(&page.url).retry(self.retries)?.text()?,
        );
      }

      listings?
    };

    thread::sleep(Duration::from_millis(self.page_delay));

    if let Some(listings) = listings {
      return Ok(Some(
        listings
          .iter()
          .map(|listing| CourseListing {
            url: format!("{}{}", self.extraction_mode.base_url(), listing.url),
            ..listing.clone()
          })
          .collect(),
      ));
    }

    Ok(None)
  }

  fn parse_course(
    &self,
    listing: CourseListing,
    scrape_vsb: bool,
  ) -> Result<Course> {
    info!("{:?}", listing);

    let client = Client::builder().user_agent(&self.user_agent).build()?;

    let extractor = self.extraction_mode.course_extractor();

    let course_page = {
      let mut course_page = extractor.extract_course_page(
        &client.get(&listing.url).retry(self.retries)?.text()?,
      );

      while course_page.is_err() {
        warn!("Retrying course page: {}", listing.url);

        thread::sleep(Duration::from_millis(500));

        course_page = extractor.extract_course_page(
          &client.get(&listing.url).retry(self.retries)?.text()?,
        );
      }

      course_page?
    };

    info!(
      "Parsed course {}{}",
      &course_page.subject, &course_page.code
    );

    thread::sleep(Duration::from_millis(self.course_delay));

    let schedule = if scrape_vsb {
      Some(VsbClient::new(&client, self.retries)?.schedule(
        &format!("{}-{}", course_page.subject, course_page.code),
        self.vsb_terms.clone(),
      )?)
    } else {
      None
    };

    Ok(Course {
      id: format!("{}{}", course_page.subject, course_page.code),
      id_ngrams: None,
      title: course_page.title.clone(),
      title_ngrams: None,
      credits: course_page.credits,
      subject: course_page.subject.clone(),
      code: course_page.code.clone(),
      level: listing.level.unwrap_or(String::new()),
      url: listing.url,
      department: listing.department.unwrap_or(String::new()),
      faculty: listing.faculty.unwrap_or(String::new()),
      faculty_url: format!(
        "{}{}",
        self.extraction_mode.base_url(),
        course_page.faculty_url
      ),
      terms: listing.terms,
      description: course_page.description,
      instructors: course_page.instructors,
      prerequisites_text: course_page.requirements.prerequisites_text,
      corequisites_text: course_page.requirements.corequisites_text,
      prerequisites: course_page.requirements.prerequisites,
      corequisites: course_page.requirements.corequisites,
      leading_to: Vec::new(),
      restrictions: course_page.requirements.restrictions,
      logical_prerequisites: course_page.requirements.logical_prerequisites,
      logical_corequisites: course_page.requirements.logical_corequisites,
      schedule,
      ..Default::default()
    })
  }
}
