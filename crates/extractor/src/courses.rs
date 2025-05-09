use anyhow::bail;
use regex::Regex;

use super::*;

pub fn extract_course_urls(text: &str) -> Result<Vec<String>> {
  let page = Html::parse_fragment(text);

  let selector = Selector::parse("#textcontainer li a").unwrap();

  Ok(
    page
      .select(&selector)
      .filter_map(|elem| elem.attr("href").map(|x| x.to_string()))
      .collect(),
  )
}

pub fn extract_course_page(text: &str) -> Result<CoursePage> {
  let page = Html::parse_fragment(text);

  let element = page.root_element();

  let full_title = element
    .select_single("h1.page-title")?
    .inner_html()
    .trim()
    .to_owned();

  let parts = full_title
    .split(".")
    .filter(|x| !x.trim().is_empty())
    .collect::<Vec<&str>>();

  if parts.len() < 2 {
    bail!("Failed to parse course title");
  }

  let full_code = parts[0].trim();

  let title = parts[1].trim().to_owned();

  let parts: Vec<&str> = full_code.split(" ").collect();

  if parts.len() < 2 {
    bail!("Failed to parse course code");
  }

  let subject = parts[0].trim().to_owned();

  let code = parts[1].trim().to_owned();

  let credits = element
    .select_single(".detail-credits .value")?
    .inner_html()
    .trim()
    .to_owned();

  // Course might not have a description
  let description = element
    .select_single(".section--description div.section__content")
    .map(|elem| elem.inner_html().trim().to_owned())
    .unwrap_or_default();

  // Terms may or may not exist, if they don't then just fall back
  // to an empty vec
  let terms = element
    .select_single(".detail-terms_offered .value")
    .map(|elem| {
      elem
        .inner_html()
        .split(",")
        .map(|term| term.trim().to_owned())
        .collect::<Vec<_>>()
    })
    .unwrap_or_default();

  // Offered by is in the format:
  // <department> (<faculty>)
  let re = Regex::new(r"^(.*) \((.*)\)$").unwrap();

  let offered_by = element
    .select_single(".detail-offered_by .value")
    .ok()
    .and_then(|elem| {
      let offered_by = elem.inner_html();
      let captures = re.captures(&offered_by)?;
      Some((captures[1].to_string(), captures[2].to_string()))
    });

  // TODO: Extract instructors when they're available
  //
  // We also need to update the test in `/test-samples/`
  let instructors = Vec::new();

  Ok(CoursePage {
    title,
    credits,
    subject,
    code,
    terms,
    description,
    department: offered_by.as_ref().map(|x| x.0.clone()),
    faculty: offered_by.as_ref().map(|x| x.1.clone()),
    instructors,
    requirements: extract_course_requirements(&element)?,
  })
}

fn extract_course_requirements(element: &ElementRef) -> Result<Requirements> {
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
              requirements.set_prerequisites_text(Some(paragraph.inner_html()));
              requirements.set_prerequisites(get_course_codes(&paragraph)?);
            }
            Requirement::Corequisites => {
              requirements.set_corequisites_text(Some(paragraph.inner_html()));
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
