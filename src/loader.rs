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
      "2023-2024"
    ],
    help = "The mcgill terms to scrape"
  )]
  mcgill_terms: Vec<String>,
  #[clap(
    long,
    default_values = ["202305", "202309", "202401"],
    help = "The schedule builder terms to scrape"
  )]
  vsb_terms: Vec<usize>,
  #[clap(
    long,
    default_value = "false",
    help = "Scrape visual schedule builder information"
  )]
  scrape_vsb: bool,
  #[clap(
    long,
    default_value = "false",
    help = "Parse logical relationship between course requirements using GPT-3.5"
  )]
  parse_reqs: bool,
}

impl Loader {
  const BASE_URL: &str = "https://www.mcgill.ca";

  pub(crate) fn run(&self, source: PathBuf) -> Result {
    info!("Running extractor...");

    for (index, term) in self.mcgill_terms.iter().enumerate() {
      let mut courses = Vec::new();

      let mut page = 0;

      while let Some(listings) = self.parse_course_listing_pages(
        self.aggregate_urls(term, page, page + self.batch_size),
      )? {
        let latest_term = index == self.mcgill_terms.len() - 1;
        let scrape_vsb = self.scrape_vsb && latest_term;
        let parse_reqs = self.parse_reqs && latest_term;

        courses.extend(
          listings
            .par_iter()
            .map(|listing| {
              self.parse_course(listing.clone(), scrape_vsb, parse_reqs)
            })
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

      fs::write(
        &match source.is_file() {
          true => source.clone(),
          _ => source.join(format!("courses-{term}.json")),
        },
        serde_json::to_string_pretty(&self.post_process(&mut courses)?)?,
      )
      .map_err(|err| Error(anyhow::Error::from(err)))?;
    }

    Ok(())
  }

  fn post_process(
    &self,
    courses: &mut Vec<Course>,
  ) -> Result<Vec<Course>, Error> {
    info!("Post processing courses...");

    for i in 0..courses.len() {
      let mut leading_to = Vec::new();

      for j in (0..courses.len()).filter(|&j| j != i) {
        let (curr, other) = (&courses[i], &courses[j]);

        if other.prerequisites.contains(&curr.id) {
          leading_to.push(other.id.clone());
        }
      }

      courses[i].leading_to = leading_to;
    }

    Ok(courses.to_vec())
  }

  fn aggregate_urls(&self, term: &str, start: usize, end: usize) -> Vec<Page> {
    (start..=end)
      .map(|index| Page {
        number: index,
        url: format!(
          "{}/study/{}/courses/search?page={}",
          Loader::BASE_URL,
          term,
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
    info!("Parsing html on page: {}...", page.number);

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

  fn parse_course(
    &self,
    listing: CourseListing,
    scrape_vsb: bool,
    parse_reqs: bool,
  ) -> Result<Course> {
    info!("{:?}", listing);

    let client = reqwest::blocking::Client::builder()
      .user_agent(&self.user_agent)
      .build()?;

    let course_page = extractor::extract_course_page(
      &client.get(&listing.url).retry(self.retries)?.text()?,
      parse_reqs,
    )?;

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
      level: listing.level,
      url: listing.url,
      department: listing.department,
      faculty: listing.faculty,
      faculty_url: format!("{}{}", Loader::BASE_URL, course_page.faculty_url),
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
    })
  }
}
