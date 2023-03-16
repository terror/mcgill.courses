use super::*;

pub(crate) fn parse_course_listing_page(html: &Html) -> Result<Option<Vec<CourseListing>>> {
  Ok(
    match html
      .root_element()
      .select_optional("div[class='view-content']")?
    {
      Some(content) => Some(
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
                .select_single("div[class~='views-field-field-course-title-long']")?
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
      ),
      None => None,
    },
  )
}

pub(crate) fn parse_course_instructors(html: Html) -> Result<Vec<Instructor>> {
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

  Ok(
    ["Fall", "Winter", "Summer"]
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
      .collect(),
  )
}

pub(crate) fn parse_course_requirements(html: Html) -> Result<Requirements> {
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

pub(crate) fn parse_course_page(html: Html) -> Result<CoursePage> {
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
      .split(' ')
      .skip(2)
      .collect::<Vec<&str>>()
      .join(" "),
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
    instructors: parser::parse_course_instructors(html.clone())?,
    requirements: parser::parse_course_requirements(html.clone())?,
  })
}

#[cfg(test)]
mod tests {
  use {
    super::*,
    include_dir::{include_dir, Dir},
  };

  static MOCK_DIR: Dir<'_> = include_dir!("mocks");

  #[test]
  fn test_parse_course_page() {
    assert_eq!(
      parse_course_listing_page(&Html::parse_fragment(
        MOCK_DIR
          .get_file("page.html")
          .unwrap()
          .contents_utf8()
          .unwrap()
      ),)
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
  fn test_parse_course_instructors() {
    assert_eq!(
      parse_course_instructors(Html::parse_fragment(
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
  fn test_parse_course_requirements() {
    assert_eq!(
      parse_course_requirements(Html::parse_fragment(
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
  fn test_parse_partial_course() {
    assert_eq!(
      parse_course_page(
        Html::parse_fragment(
          MOCK_DIR
            .get_file("course.html")
            .unwrap()
            .contents_utf8()
            .unwrap(),
        ),
      )
      .unwrap(),
      CoursePage {
        title: "Discrete Structures (3 credits)".into(),
        subject: "MATH".into(),
        code: "240".into(),
        faculty_url: "/study/2022-2023/faculties/science".into(),
        description: "Introduction to discrete mathematics and applications. Logical reasoning and methods of proof. Elementary number theory and cryptography  prime numbers, modular equations, RSA encryption. Combinatorics  basic enumeration, combinatorial methods, recurrence equations. Graph theory  trees, cycles, planar\ngraphs.".into(),
        instructors: vec![Instructor { name: "Adrian Roshan Vetta".into(), term: "Fall".into() }, Instructor { name: "Jérôme Fortier".into(), term: "Fall".into() }, Instructor { name: "Jérôme Fortier".into(), term: "Winter".into() }, Instructor { name: "Jeremy Macdonald".into(), term: "Winter".into() }],
        requirements: Requirements { corequisites: vec!["MATH 133".into()], prerequisites: vec![] } }
    );
  }
}
