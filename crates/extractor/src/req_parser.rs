use super::*;
use pyo3::prelude::*;

lazy_static! {
  static ref COURSE_CODE_PATTERN: Regex =
    Regex::new(r"^([A-Z0-9]){4} [0-9]{3}(D1|D2|N1|N2|J1|J2|J3)?$").unwrap();
}

#[derive(Debug, PartialEq, Eq, Default, Serialize, Deserialize)]
pub struct CourseReqs {
  pub prerequisites: Option<ReqNode>,
  pub corequisites: Option<ReqNode>,
}

pub(crate) struct ReqParser {
  parser_module: Py<PyModule>,
}

impl ReqParser {
  pub(crate) fn new() -> Self {
    let py_source = include_str!(concat!(
      env!("CARGO_MANIFEST_DIR"),
      "/python/gpt_parser.py"
    ));

    let gpt_module = Python::with_gil(|py| -> PyResult<Py<PyModule>> {
      let module = PyModule::from_code(py, py_source, "", "")?;
      Ok(module.into())
    })
    .expect("Failed to load Python module for course requirements parsing.");

    ReqParser {
      parser_module: gpt_module,
    }
  }

  pub(crate) fn parse(
    &self,
    prereq_str: Option<String>,
    coreq_str: Option<String>,
  ) -> Result<CourseReqs> {
    let res = Python::with_gil(|py| -> PyResult<String> {
      self
        .parser_module
        .getattr(py, "parse_course_req")?
        .call1(py, (prereq_str, coreq_str))?
        .extract(py)
    })?;

    let res = deserialize_req(&res)?;
    Ok(CourseReqs {
      prerequisites: res.prerequisites.as_ref().and_then(postprocess),
      corequisites: res.corequisites.as_ref().and_then(postprocess),
    })
  }
}

fn deserialize_req(req_str: &str) -> Result<CourseReqs> {
  serde_json::from_str(req_str).map_err(Into::into)
}

fn postprocess(req: &ReqNode) -> Option<ReqNode> {
  match req {
    ReqNode::Course(c) => COURSE_CODE_PATTERN.is_match(c).then(|| req.clone()),
    ReqNode::Group { groups, operator } => {
      let flattened: Vec<_> = groups.iter().filter_map(postprocess).collect();

      match flattened.len() {
        0 => None,
        1 => postprocess(&flattened[0]),
        _ => Some(ReqNode::Group {
          operator: operator.clone(),
          groups: flattened,
        }),
      }
    }
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use ReqNode::*;

  #[test]
  fn can_deserialize() {
    let deserialized = deserialize_req(
      r#"{"prerequisites": "MATH 141","corequisites":"MATH 133"}"#,
    )
    .unwrap();

    assert_eq!(
      deserialized,
      CourseReqs {
        prerequisites: Some(Course("MATH 141".into())),
        corequisites: Some(Course("MATH 133".into())),
      }
    );
  }

  #[test]
  fn can_deserialize_reqnode() {
    let deserialized = serde_json::from_str::<ReqNode>(
      r#"{"operator": "AND", "groups": ["MATH 141", "MATH 133"]}"#,
    )
    .unwrap();

    assert_eq!(
      deserialized,
      Group {
        operator: Operator::And,
        groups: vec![Course("MATH 141".into()), Course("MATH 133".into()),]
      }
    );
  }

  #[test]
  fn can_deserialize_group() {
    let deserialized = deserialize_req(
      r#"{"prerequisites": {"operator": "AND", "groups": ["MATH 141", {"operator": "OR", "groups": ["MATH 235", "MATH 240"]}]}, "corequisites": null}"#,
    )
    .unwrap();

    assert_eq!(
      deserialized,
      CourseReqs {
        prerequisites: Some(Group {
          operator: Operator::And,
          groups: vec![
            Course("MATH 141".into()),
            Group {
              operator: Operator::Or,
              groups: vec![
                Course("MATH 235".into()),
                Course("MATH 240".into()),
              ]
            }
          ]
        }),
        corequisites: None,
      }
    );
  }

  #[test]
  fn course_code_regex_works() {
    assert!(COURSE_CODE_PATTERN.is_match("COMP 250"));
    assert!(COURSE_CODE_PATTERN.is_match("CMS2 652"));
    assert!(COURSE_CODE_PATTERN.is_match("COMP 361D1"));
    assert!(COURSE_CODE_PATTERN.is_match("COMP 361D2"));
    assert!(COURSE_CODE_PATTERN.is_match("COMP 361N1"));
    assert!(COURSE_CODE_PATTERN.is_match("COMP 361N2"));
    assert!(COURSE_CODE_PATTERN.is_match("COMP 361J1"));
    assert!(COURSE_CODE_PATTERN.is_match("COMP 361J2"));
    assert!(COURSE_CODE_PATTERN.is_match("COMP 361J3"));
    assert!(!COURSE_CODE_PATTERN.is_match("GDEU DSRT"));
    assert!(!COURSE_CODE_PATTERN.is_match("COMP 361K2"));
    assert!(!COURSE_CODE_PATTERN.is_match("COMP 361D3"));
    assert!(!COURSE_CODE_PATTERN.is_match("D2"));
    assert!(!COURSE_CODE_PATTERN.is_match("MATH240"));
  }

  #[test]
  fn postprocess_simplifies_single() {
    let req = Group {
      operator: Operator::And,
      groups: vec![Course("MATH 141".into())],
    };

    let res = postprocess(&req).unwrap();

    assert_eq!(res, Course("MATH 141".into()));
  }

  #[test]
  fn postprocess_leaves_valid_untouched() {
    let req = Group {
      operator: Operator::Or,
      groups: vec![
        Course("MATH 462".into()),
        Course("COMP 451".into()),
        Group {
          operator: Operator::And,
          groups: vec![
            Course("COMP 551".into()),
            Course("MATH 222".into()),
            Course("MATH 223".into()),
            Course("MATH 324".into()),
          ],
        },
        Course("ECSE 551".into()),
      ],
    };

    let res = postprocess(&req).unwrap();
    assert_eq!(res, req);

    let req = Course("MATH 240".into());
    let res = postprocess(&req).unwrap();
    assert_eq!(res, req);

    let req = Group {
      operator: Operator::And,
      groups: vec![
        Course("MATH 141".into()),
        Course("MATH 133".into()),
        Course("MATH 222".into()),
        Course("MATH 223".into()),
        Course("MATH 324".into()),
      ],
    };

    let res = postprocess(&req).unwrap();
    assert_eq!(res, req);

    let req = Group {
      operator: Operator::And,
      groups: vec![
        Course("MATH 141".into()),
        Group {
          operator: Operator::Or,
          groups: vec![Course("MATH 235".into()), Course("MATH 240".into())],
        },
      ],
    };

    let res = postprocess(&req).unwrap();
    assert_eq!(res, req);
  }

  #[test]
  fn postprocess_filters_invalid_course_codes() {
    let req = Course("FOO".into());
    let res = postprocess(&req);
    assert!(res.is_none());

    let req = Group {
      operator: Operator::And,
      groups: vec![
        Course("FOO".into()),
        Course("9 biology credits".into()),
        Course("15 computer science credits".into()),
        Group {
          operator: Operator::Or,
          groups: vec![Course("ASDF".into()), Course("HJKL".into())],
        },
      ],
    };
    let res = postprocess(&req);
    assert!(res.is_none());

    let req = Group {
      operator: Operator::And,
      groups: vec![
        Course("FOO".into()),
        Course("9 biology credits".into()),
        Course("15 computer science credits".into()),
        Group {
          operator: Operator::Or,
          groups: vec![Course("MATH 235".into()), Course("MATH 240".into())],
        },
      ],
    };

    let res = postprocess(&req).unwrap();
    assert_eq!(
      res,
      Group {
        operator: Operator::Or,
        groups: vec![Course("MATH 235".into()), Course("MATH 240".into())],
      }
    );

    let req = Group {
      operator: Operator::And,
      groups: vec![
        Course("MATH 141".into()),
        Course("MATH 133".into()),
        Course("MATH 222".into()),
        Course("MATH 223".into()),
        Course("MATH 324".into()),
        Course("GDEU DSRT".into()),
      ],
    };

    let res = postprocess(&req).unwrap();
    assert_eq!(
      res,
      Group {
        operator: Operator::And,
        groups: vec![
          Course("MATH 141".into()),
          Course("MATH 133".into()),
          Course("MATH 222".into()),
          Course("MATH 223".into()),
          Course("MATH 324".into()),
        ],
      }
    );

    let req = Group {
      operator: Operator::And,
      groups: vec![
        Course("MATH 141".into()),
        Course("MATH 133".into()),
        Group {
          operator: Operator::Or,
          groups: vec![Course("FOO".into())],
        },
      ],
    };

    let res = postprocess(&req).unwrap();
    assert_eq!(
      res,
      Group {
        operator: Operator::And,
        groups: vec![Course("MATH 141".into()), Course("MATH 133".into()),],
      }
    );

    let req = Group {
      operator: Operator::And,
      groups: vec![
        Course("MATH 141".into()),
        Course("MATH 133".into()),
        Group {
          operator: Operator::Or,
          groups: vec![Course("FOO".into()), Course("BAR".into())],
        },
      ],
    };

    let res = postprocess(&req).unwrap();
    assert_eq!(
      res,
      Group {
        operator: Operator::And,
        groups: vec![Course("MATH 141".into()), Course("MATH 133".into()),],
      }
    );
  }

  #[test]
  fn postprocess_flattens_and_filters() {
    let req = Group {
      operator: Operator::And,
      groups: vec![
        Course("MATH 141".into()),
        Course("MATH 133".into()),
        Group {
          operator: Operator::Or,
          groups: vec![Group {
            operator: Operator::And,
            groups: vec![Course("MATH 222".into())],
          }],
        },
      ],
    };

    let res = postprocess(&req).unwrap();
    assert_eq!(
      res,
      Group {
        operator: Operator::And,
        groups: vec![
          Course("MATH 141".into()),
          Course("MATH 133".into()),
          Course("MATH 222".into())
        ],
      }
    );

    let req = Group {
      operator: Operator::And,
      groups: vec![
        Course("MATH 141".into()),
        Course("MATH 133".into()),
        Group {
          operator: Operator::Or,
          groups: vec![Group {
            operator: Operator::And,
            groups: vec![Group {
              operator: Operator::Or,
              groups: vec![Group {
                operator: Operator::And,
                groups: vec![Course("FOO".into())],
              }],
            }],
          }],
        },
      ],
    };

    let res = postprocess(&req).unwrap();
    assert_eq!(
      res,
      Group {
        operator: Operator::And,
        groups: vec![Course("MATH 141".into()), Course("MATH 133".into()),],
      }
    );

    let req = Group {
      operator: Operator::And,
      groups: vec![
        Course("MATH 141".into()),
        Course("MATH 133".into()),
        Group {
          operator: Operator::Or,
          groups: vec![Group {
            operator: Operator::And,
            groups: vec![Group {
              operator: Operator::Or,
              groups: vec![Group {
                operator: Operator::And,
                groups: vec![Course("FOO".into()), Course("MATH 222".into())],
              }],
            }],
          }],
        },
      ],
    };

    let res = postprocess(&req).unwrap();
    assert_eq!(
      res,
      Group {
        operator: Operator::And,
        groups: vec![
          Course("MATH 141".into()),
          Course("MATH 133".into()),
          Course("MATH 222".into())
        ],
      }
    );
  }
}
