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
    default_value = "",
    help = "A VSB session cookie, required for scraping course section locations"
  )]
  cookie: String,
  #[clap(
    long,
    default_value = "0",
    help = "Time delay between course requests in milliseconds"
  )]
  course_delay: u64,
  #[clap(
    long,
    default_values = ["2025-2026",],
    help = "The mcgill terms to scrape"
  )]
  mcgill_terms: Vec<String>,
  #[clap(long, default_value = "10", help = "Number of retries")]
  retries: usize,
  #[clap(
    long,
    default_value = "false",
    help = "Scrape visual schedule builder information"
  )]
  scrape_vsb: bool,
  #[clap(long, default_value = "courses.json")]
  source: PathBuf,
  #[clap(long, help = "A user agent")]
  user_agent: String,
  #[clap(
    long,
    default_values = ["202505", "202509", "202601"],
    help = "The schedule builder terms to scrape"
  )]
  vsb_terms: Vec<usize>,
}

impl Loader {
  const BASE_URL: &str = "https://coursecatalogue.mcgill.ca";

  pub(crate) fn run(&self) -> Result<()> {
    info!("Running extractor...");

    for (index, term) in self.mcgill_terms.iter().enumerate() {
      let scrape_vsb = self.scrape_vsb && index == self.mcgill_terms.len() - 1;

      let urls = self.get_course_urls()?;

      let mut courses = Vec::new();

      for chunk in urls.chunks(self.batch_size) {
        let chunk = chunk
          .par_iter()
          .map(|url| {
            self.parse_course(&format!("{}{}", Self::BASE_URL, url), scrape_vsb)
          })
          .collect::<Result<Vec<Option<Course>>, _>>()?;

        courses.extend(chunk.into_iter().flatten());
      }

      let mut courses = courses
        .into_iter()
        .collect::<HashSet<Course>>()
        .into_iter()
        .filter(|course| !course.title.is_empty())
        .collect::<Vec<Course>>();

      courses.sort();

      let source = if self.source.is_dir() {
        self.source.join(format!("courses-{term}.json"))
      } else {
        self.source.clone()
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
          serde_json::to_string_pretty(&self.post_process(&mut courses)?)?,
        )?;
      }
    }

    Ok(())
  }

  fn post_process(&self, courses: &mut [Course]) -> Result<Vec<Course>> {
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

  fn get_course_urls(&self) -> Result<Vec<String>> {
    let client = Client::builder().user_agent(&self.user_agent).build()?;

    let page = client
      .get(format!("{}/courses", Self::BASE_URL))
      .retry(self.retries)?
      .text()?;

    course_extractor::extract_course_urls(&page)
  }

  fn parse_course(
    &self,
    url: &str,
    scrape_vsb: bool,
  ) -> Result<Option<Course>> {
    info!("{}", url);

    let client = Client::builder().user_agent(&self.user_agent).build()?;

    let course_page = {
      let response = client.get(url).retry(self.retries)?;

      if response.status() == reqwest::StatusCode::NOT_FOUND {
        info!("Page for {} not found, skipping...", url);
        return Ok(None);
      }

      let mut course_page =
        course_extractor::extract_course_page(&response.text()?);

      while course_page.is_err() {
        warn!("Retrying course page: {}", url);

        thread::sleep(Duration::from_millis(500));

        let response = client.get(url).retry(self.retries)?;

        if response.status() == reqwest::StatusCode::NOT_FOUND {
          info!("Page for {} not found, skipping...", url);
          return Ok(None);
        };

        course_page = course_extractor::extract_course_page(&response.text()?);
      }

      course_page?
    };

    info!(
      "Parsed course {}{}",
      &course_page.subject, &course_page.code
    );

    thread::sleep(Duration::from_millis(self.course_delay));

    let schedule = if scrape_vsb {
      Some(
        VsbClient::new(&self.user_agent, &self.cookie, self.retries)?
          .schedule(
            &format!("{}-{}", course_page.subject, course_page.code),
            self.vsb_terms.clone(),
          )?,
      )
    } else {
      None
    };

    // Temporarily using VSB information to get term/instructor info
    // since course catalogue doesn't have it...
    let schedule_info = schedule.clone().map(|schedules| {
      let mut terms = schedules
        .iter()
        .filter_map(|s| s.term.clone())
        .collect::<Vec<_>>();

      utils::dedup(&mut terms);

      let mut instructors = Vec::new();

      for schedule in schedules {
        if let Some(blocks) = schedule.blocks {
          for block in blocks {
            for instructor in block.instructors {
              instructors.push(Instructor {
                name: instructor,
                term: schedule.term.clone().unwrap_or_default(),
                ..Default::default()
              });
            }
          }
        }
      }

      utils::dedup(&mut instructors);

      (terms, instructors)
    });

    Ok(Some(Course {
      id: format!("{}{}", course_page.subject, course_page.code),
      id_ngrams: None,
      title: course_page.title.clone(),
      title_ngrams: None,
      credits: course_page.credits,
      subject: course_page.subject.clone(),
      code: course_page.code.clone(),
      url: url.to_string(),
      department: course_page.department.unwrap_or_default(),
      faculty: course_page.faculty.unwrap_or_default(),
      terms: schedule_info
        .as_ref()
        .map(|s| s.0.clone())
        .unwrap_or(course_page.terms),
      description: course_page.description,
      instructors: schedule_info
        .as_ref()
        .map(|s| s.1.clone())
        .unwrap_or(course_page.instructors),
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
    }))
  }
}
