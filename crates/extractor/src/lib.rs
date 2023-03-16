use {
  anyhow::anyhow,
  model::{
    course_listing::CourseListing,
    course_page::CoursePage,
    instructor::Instructor,
    requirements::{Requirement, Requirements},
    schedule::Schedule,
  },
  scraper::{ElementRef, Html, Selector},
};

type Result<T = (), E = anyhow::Error> = std::result::Result<T, E>;

pub(crate) trait Select<'a> {
  fn select_single(&self, selector: &str) -> Result<ElementRef<'a>>;
  fn select_optional(&self, selector: &str) -> Result<Option<ElementRef<'a>>>;
  fn select_many(&self, selector: &str) -> Result<Vec<ElementRef<'a>>>;
}

impl<'a> Select<'a> for ElementRef<'a> {
  fn select_single(&self, selector: &str) -> Result<ElementRef<'a>> {
    self
      .select(
        &Selector::parse(selector)
          .map_err(|error| anyhow!("Failed to parse selector: {:?}", error))?,
      )
      .next()
      .ok_or_else(|| anyhow!("Failed to select element"))
  }

  fn select_optional(&self, selector: &str) -> Result<Option<ElementRef<'a>>> {
    Ok(
      self
        .select(
          &Selector::parse(selector).map_err(|error| {
            anyhow!("Failed to parse selector: {:?}", error)
          })?,
        )
        .next(),
    )
  }

  fn select_many(&self, selector: &str) -> Result<Vec<ElementRef<'a>>> {
    Ok(
      self
        .select(
          &Selector::parse(selector).map_err(|error| {
            anyhow!("Failed to parse selector: {:?}", error)
          })?,
        )
        .collect::<Vec<ElementRef<'a>>>(),
    )
  }
}

pub fn extract_course_listing_page(
  text: &str,
) -> Result<Option<Vec<CourseListing>>> {
  match Html::parse_fragment(text)
    .root_element()
    .select_optional("div[class='view-content']")?
  {
    Some(content) => Ok(Some(
      content
        .select_many("div[class~='views-row']")?
        .iter()
        .map(|listing| -> Result<CourseListing> {
          Ok(CourseListing {
            department: listing
              .select_single("span[class~='views-field-field-dept-code']")?
              .select_single("span[class='field-content']")?
              .inner_html(),
            faculty: listing
              .select_single("span[class~='views-field-field-faculty-code']")?
              .select_single("span[class='field-content']")?
              .inner_html(),
            level: listing
              .select_single("span[class~='views-field-level']")?
              .select_single("span[class='field-content']")?
              .inner_html(),
            terms: listing
              .select_single("span[class~='views-field-terms']")?
              .select_single("span[class='field-content']")?
              .inner_html()
              .split(", ")
              .map(|term| term.to_owned())
              .collect::<Vec<String>>(),
            url: listing
              .select_single(
                "div[class~='views-field-field-course-title-long']",
              )?
              .select_single("a")?
              .value()
              .attr("href")
              .ok_or_else(|| anyhow!("Failed to get attribute"))?
              .to_string(),
          })
        })
        .collect::<Result<Vec<CourseListing>, _>>()?
        .into_iter()
        .filter(|entry| !entry.terms.contains(&String::from("Not Offered")))
        .collect::<Vec<CourseListing>>(),
    )),
    None => Ok(None),
  }
}

pub fn extract_course_page(text: &str) -> Result<CoursePage> {
  let html = Html::parse_fragment(text);

  let full_title = html
    .root_element()
    .select_single("h1[id='page-title']")?
    .inner_html()
    .trim()
    .to_owned();

  let full_code = full_title
    .split(' ')
    .take(2)
    .collect::<Vec<&str>>()
    .join(" ");

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

  let content = html
    .root_element()
    .select_single("div[class='node node-catalog clearfix']")?;

  Ok(CoursePage {
    title: full_title
      .splitn(3, ' ')
      .nth(2)
      .unwrap_or("")
      .split(" (")
      .next()
      .unwrap_or("")
      .to_owned(),
    credits: full_title
      .split('(')
      .skip(1)
      .collect::<String>()
      .split(' ')
      .take(1)
      .collect::<String>(),
    subject: subject.clone(),
    code: code.clone(),
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
      .to_owned(),
    instructors: extract_course_instructors(html.clone())?,
    requirements: extract_course_requirements(html.clone())?,
  })
}

pub fn extract_schedule(text: &str) -> Result<Vec<Schedule>> {
  let html = Html::parse_fragment(text);

  Ok(
    match html
      .root_element()
      .select_single("errors")?
      .select_many("error")?
      .is_empty()
    {
      false => Vec::new(),
      _ => html
        .root_element()
        .select_many("block")?
        .iter()
        .map(|block| Schedule {
          campus: block.value().attr("campus").map(|s| s.to_string()),
          display: block.value().attr("disp").map(|s| s.to_string()),
          location: block.value().attr("location").map(|s| s.to_string()),
        })
        .collect(),
    },
  )
}

fn extract_course_instructors(html: Html) -> Result<Vec<Instructor>> {
  let mut tokens = html
    .root_element()
    .select_single("div[class='node node-catalog clearfix']")?
    .select_single("p[class='catalog-instructors']")?
    .inner_html()
    .trim()
    .split(' ')
    .skip(1)
    .collect::<Vec<&str>>()
    .join(" ")
    .to_owned();

  let instructors = ["Fall", "Winter", "Summer"]
    .iter()
    .flat_map(|term| match tokens.contains(&format!("({term})")) {
      false => Vec::new(),
      _ => {
        let split = tokens.split(&format!("({term})")).collect::<Vec<&str>>();

        let instructors = split[0]
          .split(';')
          .map(|s| {
            Instructor::new()
              .set_name_from_parts(s.trim().split(", ").collect())
              .set_term(term)
          })
          .collect();

        if split.len() > 1 {
          tokens = split[1].trim().to_string();
        }

        instructors
      }
    })
    .collect();

  Ok(instructors)
}

fn extract_course_requirements(html: Html) -> Result<Requirements> {
  let mut requirements = Requirements::new();

  if let Some(notes) = html
    .root_element()
    .select_optional("ul[class='catalog-notes']")?
  {
    notes
      .select_many("li")?
      .iter()
      .try_for_each(|note| -> Result {
        let par = note.select_single("p")?;

        ["Prerequisite", "Corequisite"]
          .iter()
          .try_for_each(|title| -> Result {
            match par.inner_html().starts_with(title) {
              false => Ok(()),
              _ => requirements.set_requirement(
                Requirement::from(*title),
                par
                  .select_many("a")?
                  .iter()
                  .map(|link| link.inner_html())
                  .collect(),
              ),
            }
          })
      })?;
  }

  Ok(requirements)
}

#[cfg(test)]
mod tests {
  use {
    super::*,
    include_dir::{include_dir, Dir},
  };

  static MOCK_DIR: Dir<'_> = include_dir!("mocks");

  #[test]
  fn test_extract_course_page() {
    assert_eq!(
      extract_course_listing_page(
        MOCK_DIR
          .get_file("page.html")
          .unwrap()
          .contents_utf8()
          .unwrap()
      )
      .unwrap()
      .unwrap(),
      vec![
        CourseListing {
          department: "Bioresource Engineering".into(),
          faculty: "Agricultural &amp; Environmental Sciences".into(),
          level: "Undergraduate".into(),
          terms: ["Fall 2022".into()].into(),
          url: "/study/2022-2023/courses/aeph-120".into()
        },
        CourseListing {
          department: "Bioresource Engineering".into(),
          faculty: "Agricultural &amp; Environmental Sciences".into(),
          level: "Undergraduate".into(),
          terms: ["Winter 2023".into()].into(),
          url: "/study/2022-2023/courses/aeph-122".into()
        },
        CourseListing {
          department: "Institute for Aerospace Eng.".into(),
          faculty: "Faculty of Engineering".into(),
          level: "Undergraduate".into(),
          terms: ["Fall 2022".into()].into(),
          url: "/study/2022-2023/courses/aero-401".into(),
        },
        CourseListing {
          department: "Institute for Aerospace Eng.".into(),
          faculty: "Faculty of Engineering".into(),
          level: "Undergraduate".into(),
          terms: ["Winter 2023".into()].into(),
          url: "/study/2022-2023/courses/aero-410".into()
        },
        CourseListing {
          department: "Institute for Aerospace Eng.".into(),
          faculty: "Faculty of Engineering".into(),
          level: "Undergraduate".into(),
          terms: ["Fall 2022".into()].into(),
          url: "/study/2022-2023/courses/aero-460d1".into()
        },
        CourseListing {
          department: "Institute for Aerospace Eng.".into(),
          faculty: "Faculty of Engineering".into(),
          level: "Undergraduate".into(),
          terms: ["Winter 2023".into()].into(),
          url: "/study/2022-2023/courses/aero-460d2".into()
        },
        CourseListing {
          department: "Islamic Studies".into(),
          faculty: "Faculty of Arts".into(),
          level: "Undergraduate".into(),
          terms: ["Fall 2022".into()].into(),
          url: "/study/2022-2023/courses/afri-200".into()
        },
        CourseListing {
          department: "Islamic Studies".into(),
          faculty: "Faculty of Arts".into(),
          level: "Undergraduate".into(),
          terms: ["Fall 2022".into()].into(),
          url: "/study/2022-2023/courses/afri-401".into()
        },
        CourseListing {
          department: "Islamic Studies".into(),
          faculty: "Faculty of Arts".into(),
          level: "Undergraduate".into(),
          terms: ["Fall 2022".into()].into(),
          url: "/study/2022-2023/courses/afri-481".into()
        },
        CourseListing {
          department: "Islamic Studies".into(),
          faculty: "Faculty of Arts".into(),
          level: "Graduate, Undergraduate".into(),
          terms: ["Winter 2023".into()].into(),
          url: "/study/2022-2023/courses/afri-598".into()
        },
        CourseListing {
          department: "Agricultural Economics".into(),
          faculty: "Agricultural &amp; Environmental Sciences".into(),
          level: "Undergraduate".into(),
          terms: ["Fall 2022".into()].into(),
          url: "/study/2022-2023/courses/agec-200".into()
        },
        CourseListing {
          department: "Agricultural Economics".into(),
          faculty: "Agricultural &amp; Environmental Sciences".into(),
          level: "Undergraduate".into(),
          terms: ["Winter 2023".into()].into(),
          url: "/study/2022-2023/courses/agec-201".into()
        },
        CourseListing {
          department: "Agricultural Economics".into(),
          faculty: "Agricultural &amp; Environmental Sciences".into(),
          level: "Undergraduate".into(),
          terms: ["Winter 2023".into()].into(),
          url: "/study/2022-2023/courses/agec-231".into()
        },
        CourseListing {
          department: "Agricultural Economics".into(),
          faculty: "Agricultural &amp; Environmental Sciences".into(),
          level: "Undergraduate".into(),
          terms: ["Winter 2023".into()].into(),
          url: "/study/2022-2023/courses/agec-320".into()
        },
        CourseListing {
          department: "Natural Resource Sciences".into(),
          faculty: "Agricultural &amp; Environmental Sciences".into(),
          level: "Undergraduate".into(),
          terms: ["Fall 2022".into()].into(),
          url: "/study/2022-2023/courses/agec-332".into()
        },
        CourseListing {
          department: "Agricultural Economics".into(),
          faculty: "Agricultural &amp; Environmental Sciences".into(),
          level: "Undergraduate".into(),
          terms: ["Fall 2022".into()].into(),
          url: "/study/2022-2023/courses/agec-333".into()
        }
      ],
    );
  }

  #[test]
  fn test_extract_course_instructors() {
    assert_eq!(
      extract_course_instructors(Html::parse_fragment(
        MOCK_DIR
          .get_file("course.html")
          .unwrap()
          .contents_utf8()
          .unwrap()
      ))
      .unwrap(),
      vec![
        Instructor {
          name: "Adrian Roshan Vetta".into(),
          term: "Fall".into()
        },
        Instructor {
          name: "Jérôme Fortier".into(),
          term: "Fall".into()
        },
        Instructor {
          name: "Jérôme Fortier".into(),
          term: "Winter".into()
        },
        Instructor {
          name: "Jeremy Macdonald".into(),
          term: "Winter".into()
        }
      ]
    );
  }

  #[test]
  fn test_extract_course_requirements() {
    assert_eq!(
      extract_course_requirements(Html::parse_fragment(
        MOCK_DIR
          .get_file("course.html")
          .unwrap()
          .contents_utf8()
          .unwrap()
      ))
      .unwrap(),
      Requirements {
        corequisites: vec!["MATH 133".into()],
        prerequisites: Vec::new()
      }
    );
  }

  #[test]
  fn text_extract_course_page() {
    assert_eq!(
      extract_course_page(
        MOCK_DIR
          .get_file("course.html")
          .unwrap()
          .contents_utf8()
          .unwrap(),
      )
      .unwrap(),
      CoursePage {
        title: "Discrete Structures".into(),
        credits: "3".into(),
        subject: "MATH".into(),
        code: "240".into(),
        faculty_url: "/study/2022-2023/faculties/science".into(),
        description: "Introduction to discrete mathematics and applications. Logical reasoning and methods of proof. Elementary number theory and cryptography  prime numbers, modular equations, RSA encryption. Combinatorics  basic enumeration, combinatorial methods, recurrence equations. Graph theory  trees, cycles, planar\ngraphs.".into(),
        instructors: vec![Instructor { name: "Adrian Roshan Vetta".into(), term: "Fall".into() }, Instructor { name: "Jérôme Fortier".into(), term: "Fall".into() }, Instructor { name: "Jérôme Fortier".into(), term: "Winter".into() }, Instructor { name: "Jeremy Macdonald".into(), term: "Winter".into() }],
        requirements: Requirements { corequisites: vec!["MATH 133".into()], prerequisites: vec![] } }
    );
  }

  #[test]
  fn test_extract_schedule() {
    assert_eq!(
      extract_schedule(
        MOCK_DIR
          .get_file("vsb.xml")
          .unwrap()
          .contents_utf8()
          .unwrap(),
      )
      .unwrap(),
      vec![Schedule {
        campus: Some("Downtown".into()),
        display: Some("Lec 045".into()),
        location: Some("BRONF 422".into()),
      }]
    );
  }
}
