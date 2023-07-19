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
        .iter()
        .try_for_each(|title| -> Result {
          match par.inner_html().starts_with(title) {
            false => Ok(()),
            _ => match Requirement::from(*title) {
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
          if e.name() == "a" {
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
