use std::fmt::Display;

use chatgpt::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Eq, Serialize, Deserialize)]
pub(crate) enum Operator {
  And,
  Or,
}

#[derive(Debug, PartialEq, Eq, Serialize, Deserialize)]
pub(crate) enum ReqNode {
  Course(String),
  Group {
    operator: Option<Operator>,
    groups: Vec<ReqNode>,
  },
}

impl Default for ReqNode {
  fn default() -> Self {
    ReqNode::Group {
      operator: None,
      groups: vec![],
    }
  }
}

#[derive(Debug, PartialEq, Eq, Default, Serialize, Deserialize)]
pub struct Requirements {
  prerequisites: Option<ReqNode>,
  corequisites: Option<ReqNode>,
}

impl Display for Requirements {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    let s = serde_json::to_string(self).unwrap();
    write!(f, "{}", s)
  }
}

const PARSER_PROMPT: &str = "";

pub(crate) struct ReqParser {
  client: ChatGPT,
}

impl ReqParser {
  pub(crate) fn new(key: &str) -> Result<Self> {
    let client = ChatGPT::new(key)?;

    Ok(ReqParser { client })
  }

  pub(crate) fn parse(
    &self,
    prereq_str: Option<&str>,
    coreq_str: Option<&str>,
  ) -> Result<Requirements> {
    Ok(Requirements::default())
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use ReqNode::*;
  const KEY: &str = "foo";

  #[test]
  fn math222() {
    let parser = ReqParser::new(KEY).unwrap();
    let reqs = parser.parse(Some("Prerequisite: MATH 141. Familiarity with vector geometry or Corequisite: MATH 133"), None).unwrap();

    assert_eq!(
      reqs,
      Requirements {
        prerequisites: Some(Group {
          operator: None,
          groups: vec![Course("MATH 141".to_string()),]
        }),
        corequisites: Some(Group {
          operator: None,
          groups: vec![Course("MATH 133".to_string()),]
        }),
      }
    );
  }

  #[test]
  fn comp250() {
    let parser = ReqParser::new(KEY).unwrap();
    let reqs = parser.parse(Some("Prerequisites: Familiarity with a high level programming language and CEGEP level Math."), None).unwrap();

    assert_eq!(
      reqs,
      Requirements {
        prerequisites: None,
        corequisites: None,
      }
    );
  }

  #[test]
  fn comp579() {
    let parser = ReqParser::new(KEY).unwrap();
    let reqs = parser.parse(Some("Prerequisite: A university level course in machine learning such as COMP 451 or COMP 551. Background in calculus, linear algebra, probability at the level of MATH 222, MATH 223, MATH 323, respectively."), None).unwrap();

    assert_eq!(
      reqs,
      Requirements {
        prerequisites: Some(Group {
          operator: Some(Operator::Or),
          groups: vec![
            Course("COMP 451".to_string()),
            Course("COMP 551".to_string()),
            Group {
              operator: Some(Operator::And),
              groups: vec![
                Course("MATH 222".to_string()),
                Course("MATH 223".to_string()),
                Course("MATH 323".to_string()),
              ]
            }
          ]
        }),
        corequisites: None,
      }
    );
  }

  #[test]
  fn comp401() {
    let parser = ReqParser::new(KEY).unwrap();
    let reqs = parser.parse(Some("Prerequisites: COMP 251 and 9 credits of BIOL courses, BIOL 301 recommended."), None).unwrap();

    assert_eq!(
      reqs,
      Requirements {
        prerequisites: Some(Group {
          operator: None,
          groups: vec![Course("COMP 251".to_string()),]
        }),
        corequisites: None,
      }
    )
  }

  #[test]
  fn math350() {
    let parser = ReqParser::new(KEY).unwrap();
    let reqs = parser
      .parse(
        Some("Prerequisites: MATH 235 or MATH 240 and MATH 251 or MATH 223."),
        None,
      )
      .unwrap();

    assert_eq!(
      reqs,
      Requirements {
        prerequisites: Some(Group {
          operator: Some(Operator::And),
          groups: vec![
            Group {
              operator: Some(Operator::Or),
              groups: vec![
                Course("MATH 235".to_string()),
                Course("MATH 240".to_string()),
              ]
            },
            Group {
              operator: Some(Operator::Or),
              groups: vec![
                Course("MATH 251".to_string()),
                Course("MATH 223".to_string()),
              ]
            }
          ]
        }),
        corequisites: None,
      }
    )
  }

  #[test]
  fn ecse324() {
    let parser = ReqParser::new(KEY).unwrap();
    let reqs = parser
      .parse(
        Some("Prerequisite(s): ECSE 200, ECSE 222, and COMP 206"),
        None,
      )
      .unwrap();

    assert_eq!(
      reqs,
      Requirements {
        prerequisites: Some(Group {
          operator: Some(Operator::And),
          groups: vec![
            Course("ECSE 200".to_string()),
            Course("ECSE 222".to_string()),
            Course("COMP 206".to_string()),
          ]
        }),
        corequisites: None,
      }
    )
  }

  #[test]
  fn comp562() {
    let parser = ReqParser::new(KEY).unwrap();
    let reqs = parser.parse(
      Some("Prerequisites: MATH 462 or COMP 451 or (COMP 551, MATH 222, MATH 223 and MATH 324) or ECSE 551."),
      None
    ).unwrap();

    assert_eq!(
      reqs,
      Requirements {
        prerequisites: Some(Group {
          operator: Some(Operator::Or),
          groups: vec![
            Course("MATH 462".to_string()),
            Course("COMP 451".to_string()),
            Group {
              operator: Some(Operator::And),
              groups: vec![
                Course("COMP 551".to_string()),
                Course("MATH 222".to_string()),
                Course("MATH 223".to_string()),
                Course("MATH 324".to_string()),
              ]
            },
            Course("ECSE 551".to_string()),
          ]
        }),
        corequisites: None,
      }
    )
  }

  #[test]
  fn comp553() {
    let parser = ReqParser::new(KEY).unwrap();
    let reqs = parser.parse(
      Some("Prerequisite: COMP 362 or MATH 350 or MATH 454 or MATH 487, or instructor permission"),
      None
    ).unwrap();

    assert_eq!(
      reqs,
      Requirements {
        prerequisites: Some(Group {
          operator: Some(Operator::Or),
          groups: vec![
            Course("COMP 362".to_string()),
            Course("MATH 350".to_string()),
            Course("MATH 454".to_string()),
            Course("MATH 487".to_string()),
          ]
        }),
        corequisites: None,
      }
    )
  }

  #[test]
  fn comp551() {
    let parser = ReqParser::new(KEY).unwrap();
    let reqs = parser.parse(
      Some("Prerequisite(s): MATH 323 or ECSE 205, COMP 202, MATH 133, MATH 222 (or their equivalents)."),
      None
    ).unwrap();

    assert_eq!(
      reqs,
      Requirements {
        prerequisites: Some(Group {
          operator: Some(Operator::And),
          groups: vec![
            Group {
              operator: Some(Operator::Or),
              groups: vec![
                Course("MATH 323".to_string()),
                Course("ECSE 205".to_string()),
              ]
            },
            Course("COMP 202".to_string()),
            Course("MATH 133".to_string()),
            Course("MATH 222".to_string()),
          ]
        }),
        corequisites: None,
      }
    )
  }

  #[test]
  fn math223() {
    let parser = ReqParser::new(KEY).unwrap();
    let reqs = parser
      .parse(Some("Prerequisite: MATH 133 or equivalent"), None)
      .unwrap();

    assert_eq!(
      reqs,
      Requirements {
        prerequisites: Some(Group {
          operator: None,
          groups: vec![Course("MATH 133".to_string())]
        }),
        corequisites: None,
      }
    )
  }
}
