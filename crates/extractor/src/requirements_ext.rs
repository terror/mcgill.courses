use super::*;

pub(crate) trait RequirementsExt {
  fn from_notes(notes: ElementRef, parse_reqs: bool) -> Result<Self>
  where
    Self: Sized;
}

lazy_static! {
  static ref REQ_PARSER: ReqParser = ReqParser::new();
}

impl RequirementsExt for Requirements {
  fn from_notes(notes: ElementRef, parse_reqs: bool) -> Result<Self> {
    let mut requirements = Self::default();

    let mut par = Vec::new();

    for note in notes.select_many("li")? {
      if let Some(p) = note.select_optional("p")? {
        par.push(p);
      } else {
        par.push(note);
      }
    }

    let mut prereq_str: Option<String> = None;
    let mut coreq_str: Option<String> = None;

    par.iter().try_for_each(|par| -> Result {
      ["Prerequisite", "Corequisite", "Restriction"]
        .into_iter()
        .try_for_each(|title| -> Result {
          match par.inner_html().starts_with(title) {
            false => Ok(()),
            _ => match Requirement::from(title) {
              Requirement::Prerequisites => {
                requirements.set_prerequisites_text(Some(get_text(par)));
                requirements.set_prerequisites(get_course_codes(par)?);
                prereq_str = Some(wrap_course_codes(par));

                Ok(())
              }
              Requirement::Corequisites => {
                requirements.set_corequisites_text(Some(get_text(par)));
                requirements.set_corequisites(get_course_codes(par)?);
                coreq_str = Some(wrap_course_codes(par));

                Ok(())
              }
              Requirement::Restrictions => {
                requirements.set_restrictions(get_text(par));

                Ok(())
              }
              Requirement::Unknown => {
                Err(anyhow!("Unknown course requirement"))
              }
            },
          }
        })
    })?;

    if parse_reqs {
      let reqs = REQ_PARSER.parse(prereq_str, coreq_str)?;
      requirements.set_logical_prerequisites(reqs.prerequisites);
      requirements.set_logical_corequisites(reqs.corequisites);
    }

    Ok(requirements)
  }
}

fn get_course_codes(par: &ElementRef) -> Result<Vec<String>> {
  let mut codes = par
    .select_many("a")?
    .iter()
    .map(|link| {
      link
        .value()
        .attr("href")
        .unwrap_or("")
        .split('/')
        .last()
        .unwrap_or("")
        .to_ascii_uppercase()
        .replace('-', "")
    })
    .filter(|code| !code.is_empty())
    .collect::<Vec<String>>();
  dedup(&mut codes);

  Ok(codes)
}

fn get_text(par: &ElementRef) -> String {
  par
    .text()
    .collect::<String>()
    .split(' ')
    .skip(1)
    .collect::<Vec<&str>>()
    .join(" ")
}

fn wrap_course_codes(par: &ElementRef) -> String {
  par
    .children()
    .map(|el| {
      match el.value() {
        Node::Text(t) => t.to_string(),
        Node::Element(e) => {
          // This unwrap will never panic
          let text = ElementRef::wrap(el).unwrap().text().collect::<String>();
          if e.name() == "a" && !text.is_empty() {
            format!("`{}`", text)
          } else {
            text
          }
        }
        _ => String::from(""),
      }
    })
    .collect::<String>()
}

fn dedup(v: &mut Vec<String>) {
  let mut set = HashSet::new();

  v.retain(|e| set.insert(e.clone()));
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_wrap_course_codes() {
    let html = Html::parse_fragment(
      r#"<html><p>Prerequisites: <a href="/study/2023-2024/courses/isla-651d1"></a><a href="http://www.mcgill.ca/study/2023-2024/courses/ISLA-651D1">ISLA 651D1</a>/<a href="/study/2023-2024/courses/isla-651d2">D2</a> or <a href="/study/2023-2024/courses/isla-551d1"></a><a href="http://www.mcgill.ca/study/2023-2024/courses/ISLA-551D1" title="" class="tooltip">ISLA 551D1</a>/<a href="/study/2023-2024/courses/isla-551d2" title="" class="tooltip">D2</a> or <a href="/study/2023-2024/courses/isla-251d1"></a><a href="http://www.mcgill.ca/study/2023-2024/courses/ISLA-251D1">ISLA 251D1</a>/<a href="/study/2023-2024/courses/isla-251d2">D2</a> or permission of the Institute.</p></html>"#,
    );
    let elem = html.root_element().select_single("p").unwrap();

    assert_eq!(wrap_course_codes(&elem), "Prerequisites: `ISLA 651D1`/`D2` or `ISLA 551D1`/`D2` or `ISLA 251D1`/`D2` or permission of the Institute.");
  }

  #[test]
  fn wrap_course_codes_ignores_non_a_tags() {
    let html = Html::parse_fragment(
      r#"<html><p>this <span>is a</span> <a href="foo.com">test</a> for ignoring tags</p></html>"#,
    );
    let elem = html.root_element().select_single("p").unwrap();

    assert_eq!(
      wrap_course_codes(&elem),
      "this is a `test` for ignoring tags"
    );
  }
}
