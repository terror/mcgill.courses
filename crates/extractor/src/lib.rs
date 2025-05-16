use {
  anyhow::{anyhow, bail},
  model::{Block, CoursePage, Requirement, Requirements, Schedule, TimeBlock},
  regex::Regex,
  scraper::{ElementRef, Html, Selector},
  select::Select,
  std::collections::HashSet,
  utils::*,
};

pub use vsb_extractor::VsbExtractor;

pub mod courses;
mod select;
mod utils;
mod vsb_extractor;

type Result<T = (), E = anyhow::Error> = std::result::Result<T, E>;

pub trait ScheduleExtractor {
  fn extract_course_schedules(text: &str) -> Result<Vec<Schedule>>;
}

#[cfg(test)]
mod tests {
  use {
    super::*,
    crate::vsb_extractor::VsbExtractor,
    include_dir::{Dir, include_dir},
    pretty_assertions::assert_eq,
  };

  static MOCK_DIR: Dir<'_> = include_dir!("crates/extractor/test-samples");

  fn get_content(name: &str) -> String {
    MOCK_DIR
      .get_file(name)
      .unwrap()
      .contents_utf8()
      .unwrap()
      .to_string()
  }

  #[test]
  fn extract_vsb_course_schedules_202509() {
    assert_eq!(
      VsbExtractor::extract_course_schedules(&get_content(
        "vsb_course_schedules_202509.xml"
      ))
      .unwrap(),
      vec![Schedule {
        blocks: Some(vec![Block {
          campus: Some("Downtown".into()),
          display: Some("Lec 001".into()),
          location: Some("LEA 132".into()),
          timeblocks: Some(vec![
            TimeBlock {
              day: Some("3".into()),
              t1: Some("875".into()),
              t2: Some("955".into()),
            },
            TimeBlock {
              day: Some("5".into()),
              t1: Some("875".into()),
              t2: Some("955".into()),
            }
          ]),
          crn: Some("2411".into()),
          instructors: vec!["Mona Elsaadawy".into(), "Jacob Errington".into()]
        }]),
        term: Some("Fall 2025".into())
      }]
    );
  }

  #[test]
  fn extract_catalog_course_urls_2025_2026() {
    assert_eq!(
      courses::extract_course_urls(&get_content("catalog_all_courses.html"))
        .unwrap(),
      vec![
        "https://coursecatalogue.mcgill.ca/courses/aaaa-100/index.html"
          .to_string(),
        "https://coursecatalogue.mcgill.ca/courses/acct-351/index.html"
          .to_string(),
        "https://coursecatalogue.mcgill.ca/courses/acct-352/index.html"
          .to_string(),
        "https://coursecatalogue.mcgill.ca/courses/acct-354/index.html"
          .to_string(),
        "https://coursecatalogue.mcgill.ca/courses/acct-361/index.html"
          .to_string(),
        "https://coursecatalogue.mcgill.ca/courses/acct-362/index.html"
          .to_string(),
        "https://coursecatalogue.mcgill.ca/courses/acct-385/index.html"
          .to_string(),
        "https://coursecatalogue.mcgill.ca/courses/acct-401/index.html"
          .to_string(),
        "https://coursecatalogue.mcgill.ca/courses/acct-434/index.html"
          .to_string(),
        "https://coursecatalogue.mcgill.ca/courses/acct-451/index.html"
          .to_string(),
        "https://coursecatalogue.mcgill.ca/courses/acct-452/index.html"
          .to_string(),
        "https://coursecatalogue.mcgill.ca/courses/acct-453/index.html"
          .to_string(),
        "https://coursecatalogue.mcgill.ca/courses/acct-455/index.html"
          .to_string(),
        "https://coursecatalogue.mcgill.ca/courses/acct-463/index.html"
          .to_string(),
        "https://coursecatalogue.mcgill.ca/courses/acct-475/index.html"
          .to_string(),
        "https://coursecatalogue.mcgill.ca/courses/acct-486/index.html"
          .to_string(),
        "https://coursecatalogue.mcgill.ca/courses/acct-604/index.html"
          .to_string(),
        "https://coursecatalogue.mcgill.ca/courses/acct-605/index.html"
          .to_string(),
        "https://coursecatalogue.mcgill.ca/courses/acct-618/index.html"
          .to_string(),
        "https://coursecatalogue.mcgill.ca/courses/acct-623/index.html"
          .to_string(),
        "https://coursecatalogue.mcgill.ca/courses/acct-626/index.html"
          .to_string(),
        "https://coursecatalogue.mcgill.ca/courses/acct-645/index.html"
          .to_string(),
        "https://coursecatalogue.mcgill.ca/courses/acct-645d1/index.html"
          .to_string(),
      ]
    );
  }

  #[test]
  fn extract_catalog_course_page_2025_2026() {
    assert_eq!(
      courses::extract_course_page(
        &get_content("catalog_course_page_2025_2026.html"),
      )
      .unwrap(),
      CoursePage {
        title: "Algorithms and Data Structures".into(),
        credits: "3".into(),
        subject: "COMP".into(),
        code: "251".into(),
        terms: vec![],
        department: Some("Computer Science".into()),
        faculty: Some("Faculty of Science".into()),
        description: "Data Structures: priority queues, balanced binary search trees, hash tables, graphs. Algorithms: topological sort, connected components, shortest paths, minimum spanning trees, bipartite matching, network flows. Algorithm design: greedy, divide and conquer, dynamic programming, randomization. Mathematicaltools: proofs of asymptotic complexity and program correctness, Master theorem.".into(),
        instructors: vec![],
        requirements: Requirements {
          prerequisites_text: Some("Prerequisites: COMP 250; MATH 235 or MATH 240".into()),
          prerequisites: vec!["COMP250".into(), "MATH235".into(), "MATH240".into()],
          restrictions: Some("Not open to students who have taken or are taking: COMP 252 or COMP 260.".into()),
          ..Requirements::default()
        }
      }
    );
  }

  #[test]
  fn extract_catalog_course_page_2025_2026_with_terms() {
    assert_eq!(
      courses::extract_course_page(&get_content(
        "catalog_course_page_2025_2026_with_terms.html"
      ),)
      .unwrap(),
      CoursePage {
        title: "Academic Integrity Tutorial".into(),
        credits: "0".into(),
        subject: "AAAA".into(),
        code: "100".into(),
        terms: vec!["Fall 2025".into(), "Winter 2026".into()],
        department: Some("Student Services".into()),
        faculty: Some("No College Designated".into()),
        description: "".into(),
        instructors: vec![],
        requirements: Requirements::default()
      }
    );
  }
}
