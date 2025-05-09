use super::*;

pub struct ECalendarExtractor;

impl CourseExtractor for ECalendarExtractor {
  fn extract_course_listings(text: &str) -> Result<Option<Vec<CourseListing>>> {
    let page = Html::parse_fragment(text);

    let content = page
      .root_element()
      .select_optional("div[class='view-content']")?;

    if let Some(content) = content {
      let course_listings = content
        .select_many("div[class~='views-row']")?
        .into_iter()
        .map(Self::extract_course_listing)
        .collect::<Result<Vec<CourseListing>, _>>()?;

      let filtered_course_listings = course_listings
        .into_iter()
        .map(|listing| listing.filter_terms())
        .collect();

      return Ok(Some(filtered_course_listings));
    }

    Ok(None)
  }

  fn extract_course_page(text: &str) -> Result<CoursePage> {
    let page = Html::parse_fragment(text);

    let element = page.root_element();

    let content = element.try_select_single(vec![
      "div[class='node node-catalog clearfix']",
      "div[class='node node-catalog node-promoted clearfix']",
    ])?;

    let full_title = element
      .select_single("h1[id='page-title']")?
      .inner_html()
      .trim()
      .to_owned()
      .replace("&amp;", "&");

    let full_code = full_title
      .split(' ')
      .take(2)
      .collect::<Vec<&str>>()
      .join(" ");

    let title = full_title
      .splitn(3, ' ')
      .nth(2)
      .unwrap_or("")
      .split(" (")
      .next()
      .unwrap_or("")
      .to_owned()
      .replace("&amp;", "&");

    let credits = full_title
      .split('(')
      .skip(1)
      .collect::<String>()
      .split(' ')
      .take(1)
      .collect();

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

    let description = content
      .select_single("div[class='content']")?
      .select_single("p")?
      .inner_html()
      .trim()
      .split(':')
      .skip(1)
      .collect::<Vec<&str>>()
      .join(" ")
      .trim()
      .to_owned()
      .replace("&amp;", "&");

    Ok(CoursePage {
      title,
      credits,
      subject,
      code,
      description,
      instructors: ECalendarExtractor::extract_course_instructors(&element)?,
      requirements: ECalendarExtractor::extract_course_requirements(&element)?,
    })
  }
}

impl ECalendarExtractor {
  pub fn extract_course_instructors(
    element: &ElementRef,
  ) -> Result<Vec<Instructor>> {
    let mut instructors = Vec::new();

    let catalog = element.try_select_single(vec![
      "div[class='node node-catalog clearfix']",
      "div[class='node node-catalog node-promoted clearfix']",
    ])?;

    let raw = catalog
      .select_single("p[class='catalog-terms']")?
      .inner_html();

    let terms = raw
      .trim()
      .split(' ')
      .skip(1)
      .filter(|entry| !entry.is_empty())
      .collect::<Vec<&str>>();

    let mut tokens = catalog
      .select_single("p[class='catalog-instructors']")?
      .inner_html()
      .trim()
      .split(' ')
      .skip(1)
      .collect::<Vec<&str>>()
      .join(" ");

    terms
      .join(" ")
      .split(", ")
      .map(|term| {
        (
          term.split(' ').take(1).collect::<String>(),
          term.to_string(),
        )
      })
      .for_each(|(term, full_term)| {
        if tokens.contains(&format!("({term})")) {
          let split = tokens.split(&format!("({term})")).collect::<Vec<&str>>();

          let inner = split[0]
            .split(';')
            .map(|s| {
              Instructor::default()
                .set_name(&s.trim().split(", ").collect::<Vec<&str>>())
                .set_term(&full_term)
            })
            .collect::<Vec<Instructor>>();

          if split.len() > 1 {
            tokens = split[1].trim().to_string();
          }

          instructors.extend(inner);
        }
      });

    Ok(instructors)
  }

  fn extract_course_listing(element: ElementRef) -> Result<CourseListing> {
    let department = element
      .select_single("span[class~='views-field-field-dept-code']")?
      .select_single("span[class='field-content']")?
      .inner_html()
      .replace("&amp;", "&");

    let faculty = element
      .select_single("span[class~='views-field-field-faculty-code']")?
      .select_single("span[class='field-content']")?
      .inner_html()
      .replace("&amp;", "&");

    let level = element
      .select_single("span[class~='views-field-level']")?
      .select_single("span[class='field-content']")?
      .inner_html();

    let terms = element
      .select_single("span[class~='views-field-terms']")?
      .select_single("span[class='field-content']")?
      .inner_html()
      .split(", ")
      .map(|term| term.to_owned())
      .collect();

    let url = element
      .select_single("div[class~='views-field-field-course-title-long']")?
      .select_single("a")?
      .value()
      .attr("href")
      .ok_or_else(|| anyhow!("Failed to get attribute"))?
      .to_string();

    Ok(CourseListing {
      department,
      faculty,
      level,
      terms,
      url,
    })
  }

  pub fn extract_course_requirements(
    element: &ElementRef,
  ) -> Result<Requirements> {
    let notes = element.select_optional("ul[class='catalog-notes']")?;

    let mut requirements = Requirements::default();

    if let Some(notes) = notes {
      let mut paragraphs = Vec::new();

      for note in notes.select_many("li")? {
        if let Some(paragraph) = note.select_optional("p")? {
          paragraphs.push(paragraph);
        } else {
          paragraphs.push(note);
        }
      }

      for paragraph in paragraphs {
        for title in ["Prerequisite", "Corequisite", "Restriction"].iter() {
          if paragraph.inner_html().starts_with(title) {
            match Requirement::from(*title) {
              Requirement::Prerequisites => {
                requirements
                  .set_prerequisites_text(Some(paragraph.inner_html()));
                requirements.set_prerequisites(get_course_codes(&paragraph)?);
              }
              Requirement::Corequisites => {
                requirements
                  .set_corequisites_text(Some(paragraph.inner_html()));
                requirements.set_corequisites(get_course_codes(&paragraph)?);
              }
              Requirement::Restrictions => {
                requirements.set_restrictions(get_text(&paragraph));
              }
              Requirement::Unknown => {
                return Err(anyhow!("Unknown requirement type"));
              }
            }
          }
        }
      }
    }

    Ok(requirements)
  }
}
