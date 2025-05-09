use super::*;

pub struct CatalogExtractor;

impl CourseExtractor for CatalogExtractor {
  fn extract_course_listings(
    &self,
    text: &str,
  ) -> Result<Option<Vec<CourseListing>>> {
    let page = Html::parse_fragment(text);

    let content = page.root_element().select_optional("ol.mds-list--none")?;

    if let Some(content) = content {
      let course_listings = content
        .select_many("li.mds-search__results")?
        .into_iter()
        .map(Self::extract_course_listing)
        .collect::<Result<Vec<CourseListing>, _>>()?;

      return Ok(Some(course_listings));
    }

    Ok(None)
  }

  fn extract_course_page(&self, text: &str) -> Result<CoursePage> {
    let page = Html::parse_fragment(text);

    let element = page.root_element();

    let full_title = element
      .select_single("h1.page-title")?
      .inner_html()
      .trim()
      .to_owned();

    let parts = full_title.split(".").collect::<Vec<&str>>();

    if parts.len() < 3 {
      return Err(anyhow!("Failed to parse course title"));
    }

    let full_code = parts[0].trim();

    let title = parts[1].trim().to_owned();

    let parts: Vec<&str> = full_code.split(" ").collect();

    if parts.len() < 2 {
      return Err(anyhow!("Failed to parse course code"));
    }

    let subject = parts[0].trim().to_owned();

    let code = parts[1].trim().to_owned();

    let credits = element
      .select_single("div.detail-credits span.value")?
      .inner_html()
      .trim()
      .to_owned();

    let description = element
      .select_single("div.section--description div.section__content")?
      .inner_html()
      .trim()
      .to_owned();

    // TODO: Extract instructors when they're available
    //
    // We also need to update the test in `/test-samples/`
    let instructors = Vec::new();

    Ok(CoursePage {
      title,
      credits,
      subject,
      code,
      description,
      instructors,
      requirements: Self::extract_course_requirements(&element)?,
    })
  }
}

impl CatalogExtractor {
  fn extract_course_listing(element: ElementRef) -> Result<CourseListing> {
    let url = element
      .select_single("div[class~='views-field-title-s'] a, h3.field-content a")?
      .value()
      .attr("href")
      .ok_or_else(|| anyhow!("Failed to get attribute"))?
      .to_string();

    Ok(CourseListing {
      url,
      ..Default::default()
    })
  }

  pub fn extract_course_requirements(
    element: &ElementRef,
  ) -> Result<Requirements> {
    let notes = element.select_optional("div.detail-note_text ul")?;

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
