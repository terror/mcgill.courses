use super::*;
use pyo3::prelude::*;

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

    deserialize_req(&res)
  }
}

pub(crate) fn deserialize_req(req_str: &str) -> Result<CourseReqs> {
  serde_json::from_str(req_str).map_err(Into::into)
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
        prerequisites: Some(Course("MATH 141".to_string())),
        corequisites: Some(Course("MATH 133".to_string())),
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
        groups: vec![
          Course("MATH 141".to_string()),
          Course("MATH 133".to_string()),
        ]
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
            Course("MATH 141".to_string()),
            Group {
              operator: Operator::Or,
              groups: vec![
                Course("MATH 235".to_string()),
                Course("MATH 240".to_string()),
              ]
            }
          ]
        }),
        corequisites: None,
      }
    );
  }
}
