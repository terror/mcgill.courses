use super::*;

pub(crate) trait Element {
  fn from_element(element: ElementRef) -> Result<Self>
  where
    Self: Sized;
}

impl Element for CourseListing {
  fn from_element(element: ElementRef) -> Result<Self> {
    Ok(Self {
      department: element
        .select_single("span[class~='views-field-field-dept-code']")?
        .select_single("span[class='field-content']")?
        .inner_html()
        .replace("&amp;", "&"),
      faculty: element
        .select_single("span[class~='views-field-field-faculty-code']")?
        .select_single("span[class='field-content']")?
        .inner_html()
        .replace("&amp;", "&"),
      level: element
        .select_single("span[class~='views-field-level']")?
        .select_single("span[class='field-content']")?
        .inner_html(),
      terms: element
        .select_single("span[class~='views-field-terms']")?
        .select_single("span[class='field-content']")?
        .inner_html()
        .split(", ")
        .map(|term| term.to_owned())
        .collect(),
      url: element
        .select_single("div[class~='views-field-field-course-title-long']")?
        .select_single("a")?
        .value()
        .attr("href")
        .ok_or_else(|| anyhow!("Failed to get attribute"))?
        .to_string(),
    })
  }
}

impl Element for CoursePage {
  fn from_element(element: ElementRef) -> Result<Self> {
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

    Ok(Self {
      title: full_title
        .splitn(3, ' ')
        .nth(2)
        .unwrap_or("")
        .split(" (")
        .next()
        .unwrap_or("")
        .to_owned()
        .replace("&amp;", "&"),
      credits: full_title
        .split('(')
        .skip(1)
        .collect::<String>()
        .split(' ')
        .take(1)
        .collect(),
      subject: full_code
        .split(' ')
        .take(1)
        .collect::<Vec<&str>>()
        .join(" "),
      code: full_code
        .split(' ')
        .skip(1)
        .collect::<Vec<&str>>()
        .join(" "),
      faculty_url: content
        .select_single("div[class='meta']")?
        .select_single("p")?
        .select_single("a")?
        .value()
        .attr("href")
        .ok_or_else(|| anyhow!("Failed to get attribute"))?
        .to_string(),
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
        .to_owned()
        .replace("&amp;", "&"),
      instructors: extract_course_instructors(&element)?,
      requirements: extract_course_requirements(&element)?,
    })
  }
}

impl Element for Schedule {
  fn from_element(element: ElementRef) -> Result<Self> {
    let timeblocks = element.select_many("timeblock")?;

    let term = |ssid: Option<&str>| -> Option<String> {
      match (ssid.map(|ssid| &ssid[4..6]), ssid.map(|ssid| &ssid[0..4])) {
        (Some("01"), Some(year)) => Some(format!("Winter {year}")),
        (Some("05"), Some(year)) => Some(format!("Summer {year}")),
        (Some("09"), Some(year)) => Some(format!("Fall {year}")),
        _ => None,
      }
    };

    Ok(Self {
      blocks: Some(
        element
          .select_many("block")?
          .into_iter()
          .map(|block| {
            Ok(Block {
              campus: block.value().attr("campus").map(String::from),
              display: block.value().attr("disp").map(String::from),
              location: block.value().attr("location").map(String::from),
              crn: block.value().attr("key").map(String::from),
              timeblocks: Some(
                timeblocks
                  .iter()
                  .filter(|timeblock| {
                    block
                      .value()
                      .attr("timeblockids")
                      .unwrap_or_default()
                      .split(',')
                      .any(|id| {
                        id == timeblock.value().attr("id").unwrap_or_default()
                      })
                  })
                  .map(|timeblock| TimeBlock {
                    day: timeblock.value().attr("day").map(String::from),
                    t1: timeblock.value().attr("t1").map(String::from),
                    t2: timeblock.value().attr("t2").map(String::from),
                  })
                  .collect(),
              ),
            })
          })
          .collect::<Result<Vec<_>>>()?,
      ),
      term: term(element.select_single("selection")?.value().attr("ssid")),
    })
  }
}

impl Element for Requirements {
  fn from_element(element: ElementRef) -> Result<Self> {
    let mut requirements = Self::default();

    let mut paragraphs = Vec::new();

    for note in element.select_many("li")? {
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

    Ok(requirements)
  }
}
