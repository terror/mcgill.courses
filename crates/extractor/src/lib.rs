use {
  anyhow::anyhow,
  model::{Block, CoursePage, Requirement, Requirements, Schedule, TimeBlock},
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
    include_dir::{include_dir, Dir},
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

  // #[test]
  // fn extract_ecalendar_course_listings_2009_2010() {
  //   assert_eq!(
  //     extract_course_listings(&get_content(
  //       "ecalendar_course_listings_2009_2010.html"
  //     ))
  //     .unwrap()
  //     .unwrap(),
  //     vec![
  //       CourseListing {
  //         department: Some("Management".into()),
  //         faculty: Some("Desautels Faculty of Management".into()),
  //         level: Some("Undergraduate".into()),
  //         terms: [].into(),
  //         url: "/study/2009-2010/courses/acct-210".into(),
  //       },
  //       CourseListing {
  //         department: Some("Management".into()),
  //         faculty: Some("Desautels Faculty of Management".into()),
  //         level: Some("Undergraduate".into()),
  //         terms: [
  //           "Fall 2009".into(),
  //           "Winter 2010".into(),
  //           "Summer 2010".into(),
  //         ]
  //         .into(),
  //         url: "/study/2009-2010/courses/acct-351".into(),
  //       },
  //       CourseListing {
  //         department: Some("Management".into()),
  //         faculty: Some("Desautels Faculty of Management".into()),
  //         level: Some("Undergraduate".into()),
  //         terms: ["Fall 2009".into(), "Winter 2010".into(),].into(),
  //         url: "/study/2009-2010/courses/acct-352".into(),
  //       },
  //       CourseListing {
  //         department: Some("Management".into()),
  //         faculty: Some("Desautels Faculty of Management".into()),
  //         level: Some("Undergraduate".into()),
  //         terms: [
  //           "Fall 2009".into(),
  //           "Winter 2010".into(),
  //           "Summer 2010".into(),
  //         ]
  //         .into(),
  //         url: "/study/2009-2010/courses/acct-354".into(),
  //       },
  //       CourseListing {
  //         department: Some("Management".into()),
  //         faculty: Some("Desautels Faculty of Management".into()),
  //         level: Some("Undergraduate".into()),
  //         terms: [].into(),
  //         url: "/study/2009-2010/courses/acct-356".into(),
  //       },
  //       CourseListing {
  //         department: Some("Management".into()),
  //         faculty: Some("Desautels Faculty of Management".into()),
  //         level: Some("Undergraduate".into()),
  //         terms: [
  //           "Fall 2009".into(),
  //           "Winter 2010".into(),
  //           "Summer 2010".into(),
  //         ]
  //         .into(),
  //         url: "/study/2009-2010/courses/acct-361".into(),
  //       },
  //       CourseListing {
  //         department: Some("Management".into()),
  //         faculty: Some("Desautels Faculty of Management".into()),
  //         level: Some("Undergraduate".into()),
  //         terms: ["Fall 2009".into(), "Winter 2010".into(),].into(),
  //         url: "/study/2009-2010/courses/acct-362".into(),
  //       },
  //       CourseListing {
  //         department: Some("Management".into()),
  //         faculty: Some("Desautels Faculty of Management".into()),
  //         level: Some("Undergraduate".into()),
  //         terms: ["Fall 2009".into(), "Winter 2010".into(),].into(),
  //         url: "/study/2009-2010/courses/acct-385".into(),
  //       },
  //       CourseListing {
  //         department: Some("Management".into()),
  //         faculty: Some("Desautels Faculty of Management".into()),
  //         level: Some("Undergraduate".into()),
  //         terms: [].into(),
  //         url: "/study/2009-2010/courses/acct-434".into(),
  //       },
  //       CourseListing {
  //         department: Some("Management".into()),
  //         faculty: Some("Desautels Faculty of Management".into()),
  //         level: Some("Undergraduate".into()),
  //         terms: ["Winter 2010".into(),].into(),
  //         url: "/study/2009-2010/courses/acct-452".into(),
  //       },
  //       CourseListing {
  //         department: Some("Management".into()),
  //         faculty: Some("Desautels Faculty of Management".into()),
  //         level: Some("Undergraduate".into()),
  //         terms: ["Fall 2009".into(), "Winter 2010".into(),].into(),
  //         url: "/study/2009-2010/courses/acct-453".into(),
  //       },
  //       CourseListing {
  //         department: Some("Management".into()),
  //         faculty: Some("Desautels Faculty of Management".into()),
  //         level: Some("Undergraduate".into()),
  //         terms: [].into(),
  //         url: "/study/2009-2010/courses/acct-454".into(),
  //       },
  //       CourseListing {
  //         department: Some("Management".into()),
  //         faculty: Some("Desautels Faculty of Management".into()),
  //         level: Some("Undergraduate".into()),
  //         terms: ["Fall 2009".into(), "Winter 2010".into(),].into(),
  //         url: "/study/2009-2010/courses/acct-455".into(),
  //       },
  //       CourseListing {
  //         department: Some("Management".into()),
  //         faculty: Some("Desautels Faculty of Management".into()),
  //         level: Some("Undergraduate".into()),
  //         terms: ["Fall 2009".into(), "Winter 2010".into(),].into(),
  //         url: "/study/2009-2010/courses/acct-463".into(),
  //       },
  //       CourseListing {
  //         department: Some("Management".into()),
  //         faculty: Some("Desautels Faculty of Management".into()),
  //         level: Some("Undergraduate".into()),
  //         terms: [].into(),
  //         url: "/study/2009-2010/courses/acct-471".into(),
  //       },
  //       CourseListing {
  //         department: Some("Management".into()),
  //         faculty: Some("Desautels Faculty of Management".into()),
  //         level: Some("Undergraduate".into()),
  //         terms: ["Fall 2009".into(), "Winter 2010".into(),].into(),
  //         url: "/study/2009-2010/courses/acct-475".into(),
  //       },
  //       CourseListing {
  //         department: Some("Management".into()),
  //         faculty: Some("Desautels Faculty of Management".into()),
  //         level: Some("Undergraduate".into()),
  //         terms: ["Winter 2010".into(),].into(),
  //         url: "/study/2009-2010/courses/acct-476".into(),
  //       },
  //       CourseListing {
  //         department: Some("Management".into()),
  //         faculty: Some("Desautels Faculty of Management".into()),
  //         level: Some("Undergraduate".into()),
  //         terms: ["Fall 2009".into(), "Winter 2010".into(),].into(),
  //         url: "/study/2009-2010/courses/acct-477".into(),
  //       },
  //       CourseListing {
  //         department: Some("Management".into()),
  //         faculty: Some("Desautels Faculty of Management".into()),
  //         level: Some("Undergraduate".into()),
  //         terms: ["Fall 2009".into(), "Winter 2010".into(),].into(),
  //         url: "/study/2009-2010/courses/acct-486".into(),
  //       },
  //       CourseListing {
  //         department: Some("Management".into()),
  //         faculty: Some("Desautels Faculty of Management".into()),
  //         level: Some("Graduate".into()),
  //         terms: [].into(),
  //         url: "/study/2009-2010/courses/acct-604".into(),
  //       }
  //     ]
  //     .to_vec(),
  //   );
  // }
  //
  // #[test]
  // fn extract_ecalendar_course_listings_2022_2023() {
  //   assert_eq!(
  //     ECalendarExtractor
  //       .extract_course_listings(&get_content(
  //         "ecalendar_course_listings_2022_2023.html"
  //       ))
  //       .unwrap()
  //       .unwrap(),
  //     vec![
  //       CourseListing {
  //         department: Some("Bioresource Engineering".into()),
  //         faculty: Some("Agricultural & Environmental Sciences".into()),
  //         level: Some("Undergraduate".into()),
  //         terms: ["Fall 2022".into()].to_vec(),
  //         url: "/study/2022-2023/courses/aeph-120".into(),
  //       },
  //       CourseListing {
  //         department: Some("Bioresource Engineering".into()),
  //         faculty: Some("Agricultural & Environmental Sciences".into()),
  //         level: Some("Undergraduate".into()),
  //         terms: ["Winter 2023".into()].to_vec(),
  //         url: "/study/2022-2023/courses/aeph-122".into(),
  //       },
  //       CourseListing {
  //         department: Some("Institute for Aerospace Eng.".into()),
  //         faculty: Some("Faculty of Engineering".into()),
  //         level: Some("Undergraduate".into()),
  //         terms: ["Fall 2022".into()].to_vec(),
  //         url: "/study/2022-2023/courses/aero-401".into(),
  //       },
  //       CourseListing {
  //         department: Some("Institute for Aerospace Eng.".into()),
  //         faculty: Some("Faculty of Engineering".into()),
  //         level: Some("Undergraduate".into()),
  //         terms: ["Winter 2023".into()].to_vec(),
  //         url: "/study/2022-2023/courses/aero-410".into(),
  //       },
  //       CourseListing {
  //         department: Some("Institute for Aerospace Eng.".into()),
  //         faculty: Some("Faculty of Engineering".into()),
  //         level: Some("Undergraduate".into()),
  //         terms: ["Fall 2022".into()].to_vec(),
  //         url: "/study/2022-2023/courses/aero-460d1".into(),
  //       },
  //       CourseListing {
  //         department: Some("Institute for Aerospace Eng.".into()),
  //         faculty: Some("Faculty of Engineering".into()),
  //         level: Some("Undergraduate".into()),
  //         terms: ["Winter 2023".into()].to_vec(),
  //         url: "/study/2022-2023/courses/aero-460d2".into(),
  //       },
  //       CourseListing {
  //         department: Some("Islamic Studies".into()),
  //         faculty: Some("Faculty of Arts".into()),
  //         level: Some("Undergraduate".into()),
  //         terms: ["Fall 2022".into()].to_vec(),
  //         url: "/study/2022-2023/courses/afri-200".into(),
  //       },
  //       CourseListing {
  //         department: Some("Islamic Studies".into()),
  //         faculty: Some("Faculty of Arts".into()),
  //         level: Some("Undergraduate".into()),
  //         terms: ["Fall 2022".into()].to_vec(),
  //         url: "/study/2022-2023/courses/afri-401".into(),
  //       },
  //       CourseListing {
  //         department: Some("Islamic Studies".into()),
  //         faculty: Some("Faculty of Arts".into()),
  //         level: Some("Undergraduate".into()),
  //         terms: [].to_vec(),
  //         url: "/study/2022-2023/courses/afri-480".into(),
  //       },
  //       CourseListing {
  //         department: Some("Islamic Studies".into()),
  //         faculty: Some("Faculty of Arts".into()),
  //         level: Some("Undergraduate".into()),
  //         terms: ["Fall 2022".into()].to_vec(),
  //         url: "/study/2022-2023/courses/afri-481".into(),
  //       },
  //       CourseListing {
  //         department: Some("Islamic Studies".into()),
  //         faculty: Some("Faculty of Arts".into()),
  //         level: Some("Undergraduate".into()),
  //         terms: [].to_vec(),
  //         url: "/study/2022-2023/courses/afri-499".into(),
  //       },
  //       CourseListing {
  //         department: Some("Islamic Studies".into()),
  //         faculty: Some("Faculty of Arts".into()),
  //         level: Some("Graduate, Undergraduate".into()),
  //         terms: ["Winter 2023".into()].to_vec(),
  //         url: "/study/2022-2023/courses/afri-598".into(),
  //       },
  //       CourseListing {
  //         department: Some("Agricultural Economics".into()),
  //         faculty: Some("Agricultural & Environmental Sciences".into()),
  //         level: Some("Undergraduate".into()),
  //         terms: ["Fall 2022".into()].to_vec(),
  //         url: "/study/2022-2023/courses/agec-200".into(),
  //       },
  //       CourseListing {
  //         department: Some("Agricultural Economics".into()),
  //         faculty: Some("Agricultural & Environmental Sciences".into()),
  //         level: Some("Undergraduate".into()),
  //         terms: ["Winter 2023".into()].to_vec(),
  //         url: "/study/2022-2023/courses/agec-201".into(),
  //       },
  //       CourseListing {
  //         department: Some("Agricultural Economics".into()),
  //         faculty: Some("Agricultural & Environmental Sciences".into()),
  //         level: Some("Undergraduate".into()),
  //         terms: ["Winter 2023".into()].to_vec(),
  //         url: "/study/2022-2023/courses/agec-231".into(),
  //       },
  //       CourseListing {
  //         department: Some("Agricultural Economics".into()),
  //         faculty: Some("Agricultural & Environmental Sciences".into()),
  //         level: Some("Undergraduate".into()),
  //         terms: [].to_vec(),
  //         url: "/study/2022-2023/courses/agec-242".into(),
  //       },
  //       CourseListing {
  //         department: Some("Agricultural Economics".into()),
  //         faculty: Some("Agricultural & Environmental Sciences".into()),
  //         level: Some("Undergraduate".into()),
  //         terms: ["Winter 2023".into()].to_vec(),
  //         url: "/study/2022-2023/courses/agec-320".into(),
  //       },
  //       CourseListing {
  //         department: Some("Natural Resource Sciences".into()),
  //         faculty: Some("Agricultural & Environmental Sciences".into()),
  //         level: Some("Undergraduate".into()),
  //         terms: [].to_vec(),
  //         url: "/study/2022-2023/courses/agec-330".into(),
  //       },
  //       CourseListing {
  //         department: Some("Natural Resource Sciences".into()),
  //         faculty: Some("Agricultural & Environmental Sciences".into()),
  //         level: Some("Undergraduate".into()),
  //         terms: ["Fall 2022".into()].to_vec(),
  //         url: "/study/2022-2023/courses/agec-332".into(),
  //       },
  //       CourseListing {
  //         department: Some("Agricultural Economics".into()),
  //         faculty: Some("Agricultural & Environmental Sciences".into()),
  //         level: Some("Undergraduate".into()),
  //         terms: ["Fall 2022".into()].to_vec(),
  //         url: "/study/2022-2023/courses/agec-333".into(),
  //       },
  //     ]
  //     .to_vec(),
  //   );
  // }
  //
  // #[test]
  // fn extract_ecalendar_course_instructors_2022_2023() {
  //   assert_eq!(
  //     ECalendarExtractor::extract_course_instructors(
  //       &Html::parse_fragment(&get_content(
  //         "ecalendar_course_page_2022_2023.html"
  //       ))
  //       .root_element()
  //     )
  //     .unwrap(),
  //     vec![
  //       Instructor {
  //         name: "Adrian Roshan Vetta".into(),
  //         name_ngrams: None,
  //         term: "Fall 2022".into()
  //       },
  //       Instructor {
  //         name: "Jérôme Fortier".into(),
  //         name_ngrams: None,
  //         term: "Fall 2022".into()
  //       },
  //       Instructor {
  //         name: "Jérôme Fortier".into(),
  //         name_ngrams: None,
  //         term: "Winter 2023".into()
  //       },
  //       Instructor {
  //         name: "Jeremy Macdonald".into(),
  //         name_ngrams: None,
  //         term: "Winter 2023".into()
  //       }
  //     ]
  //   );
  // }
  //
  // #[test]
  // fn extract_ecalendar_course_requirements_2022_2023() {
  //   assert_eq!(
  //     ECalendarExtractor::extract_course_requirements(&Html::parse_fragment(
  //       &get_content("ecalendar_course_page_2022_2023.html"),
  //     ).root_element())
  //     .unwrap(),
  //     Requirements {
  //         corequisites_text: Some("Corequisite: <a href=\"/study/2022-2023/courses/math-133\">MATH 133</a>.".into()),
  //       corequisites: vec!["MATH133".into()],
  //       prerequisites: Vec::new(),
  //       restrictions: Some("For students in any Computer Science, Computer Engineering, or Software Engineering programs. Others only with the instructor's permission. Not open to students who have taken or are taking MATH 235.".into()),
  //       ..Requirements::default()
  //     }
  //   );
  // }
  //
  // #[test]
  // fn extract_ecalendar_course_page_2009_2010() {
  //   assert_eq!(
  //     ECalendarExtractor.extract_course_page(
  //       &get_content("ecalendar_course_page_2009_2010.html")
  //     )
  //     .unwrap(),
  //     CoursePage {
  //       title: "Intermediate Financial Accounting 1".into(),
  //       credits: "3".into(),
  //       subject: "ACCT".into(),
  //       code: "351".into(),
  //       faculty_url: "/study/2009-2010/faculties/desautels".into(),
  //       description: "An examination of the theoretical foundation for financial reporting and revenue recognition. The tools of accounting, including a review of the accounting process and compound interest concepts. Asset recognition, measurement and disclosure. Partnership accounting.".into(),
  //       instructors: vec![
  //         Instructor {
  //           name: "Desmond Tsang".into(),
  //           name_ngrams: None,
  //           term: "Fall 2009".into(),
  //         },
  //         Instructor {
  //           name: "Ralph Cecere".into(),
  //           name_ngrams: None,
  //           term: "Fall 2009".into(),
  //         },
  //         Instructor {
  //           name: "Robert Porrello".into(),
  //           name_ngrams: None,
  //           term: "Fall 2009".into(),
  //         },
  //         Instructor {
  //           name: "Pietro Martucci".into(),
  //           name_ngrams: None,
  //           term: "Winter 2010".into(),
  //         },
  //         Instructor {
  //           name: "Robert Porrello".into(),
  //           name_ngrams: None,
  //           term: "Winter 2010".into(),
  //         },
  //       ],
  //       requirements: Requirements { prerequisites_text: Some("Prerequisite: MGCR 211".into()), corequisites: vec![], prerequisites: vec![], restrictions: None, ..Requirements::default() }
  //     }
  //   );
  // }
  //
  // #[test]
  // fn extract_ecalendar_course_page_2022_2023() {
  //   assert_eq!(
  //     ECalendarExtractor.extract_course_page(
  //       &get_content("ecalendar_course_page_2022_2023.html"),
  //     )
  //     .unwrap(),
  //     CoursePage {
  //       title: "Discrete Structures".into(),
  //       credits: "3".into(),
  //       subject: "MATH".into(),
  //       code: "240".into(),
  //       faculty_url: "/study/2022-2023/faculties/science".into(),
  //       description: "Introduction to discrete mathematics and applications. Logical reasoning and methods of proof. Elementary number theory and cryptography  prime numbers, modular equations, RSA encryption. Combinatorics  basic enumeration, combinatorial methods, recurrence equations. Graph theory  trees, cycles, planar\ngraphs.".into(),
  //       instructors: vec![
  //         Instructor {
  //           name: "Adrian Roshan Vetta".into(),
  //           name_ngrams: None,
  //           term: "Fall 2022".into()
  //         },
  //         Instructor {
  //           name: "Jérôme Fortier".into(),
  //           name_ngrams: None,
  //           term: "Fall 2022".into()
  //         },
  //         Instructor {
  //           name: "Jérôme Fortier".into(),
  //           name_ngrams: None,
  //           term: "Winter 2023".into()
  //         },
  //         Instructor {
  //           name: "Jeremy Macdonald".into(),
  //           name_ngrams: None,
  //           term: "Winter 2023".into()
  //         }
  //       ],
  //       requirements: Requirements {
  //         corequisites_text: Some("Corequisite: <a href=\"/study/2022-2023/courses/math-133\">MATH 133</a>.".into()),
  //         corequisites: vec!["MATH133".into()],
  //         prerequisites: vec![],
  //         restrictions: Some("For students in any Computer Science, Computer Engineering, or Software Engineering programs. Others only with the instructor's permission. Not open to students who have taken or are taking MATH 235.".into()),
  //         ..Requirements::default()
  //       }
  //     }
  //   );
  // }
  //
  #[test]
  fn extract_vsb_course_schedules_202305() {
    assert_eq!(
      VsbExtractor::extract_course_schedules(&get_content(
        "vsb_course_schedules_202305.xml"
      ))
      .unwrap(),
      vec![Schedule {
        blocks: Some(vec![Block {
          campus: Some("Downtown".into()),
          display: Some("Lec 045".into()),
          location: Some("BRONF 422".into()),
          timeblocks: Some(vec![
            TimeBlock {
              day: Some("4".into()),
              t1: Some("515".into()),
              t2: Some("1255".into()),
            },
            TimeBlock {
              day: Some("4".into()),
              t1: Some("515".into()),
              t2: Some("1255".into()),
            }
          ]),
          crn: Some("683".into()),
        }]),
        term: Some("Summer 2023".into())
      }]
    );
  }
  //
  // #[test]
  // fn extract_ecalendar_course_page_with_amp() {
  //   assert_eq!(
  //     ECalendarExtractor.extract_course_page(&get_content("ecalendar_course_page_with_amp.html"),)
  //       .unwrap(),
  //     CoursePage {
  //       title: "E & M Laboratory".into(),
  //       credits: "1".into(),
  //       subject: "PHYS".into(),
  //       code: "118".into(),
  //       faculty_url: "/study/2022-2023/faculties/science".into(),
  //       description: "The laboratory component of PHYS 142.".into(),
  //       instructors: vec![Instructor {
  //         name: "Hong Guo".into(),
  //         name_ngrams: None,
  //         term: "Winter 2023".into(),
  //       }],
  //       requirements: Requirements {
  //         prerequisites_text: Some("Prerequisite: Lecture component of <a href=\"/study/2022-2023/courses/phys-142\">PHYS 142</a> or equivalent".into()),
  //         corequisites: vec![],
  //         prerequisites: vec!["PHYS142".into()],
  //         restrictions: Some(
  //           "Not open to students who have taken or are taking PHYS 142".into()
  //         ),
  //         ..Requirements::default()
  //       }
  //     }
  //   );
  // }
  //
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
        description: "Data Structures: priority queues, balanced binary search trees, hash tables, graphs. Algorithms: topological sort, connected components, shortest paths, minimum spanning trees, bipartite matching, network flows. Algorithm design: greedy, divide and conquer, dynamic programming, randomization. Mathematicaltools: proofs of asymptotic complexity and program correctness, Master theorem.".into(),
        instructors: vec![],
        requirements: Requirements {
          prerequisites_text: Some("Prerequisites: COMP 250; MATH 235 or MATH 240".into()),
          restrictions: Some("Not open to students who have taken or are taking: COMP 252 or COMP 260.".into()),
          ..Requirements::default()
        }
      }
    );
  }
}
