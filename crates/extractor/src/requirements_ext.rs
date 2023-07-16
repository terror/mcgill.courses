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
                prereq_str = Some(wrap_course_codes(par)?);

                Ok(())
              }
              Requirement::Corequisites => {
                requirements.set_corequisites_text(Some(get_text(par)));
                requirements.set_corequisites(get_course_codes(par)?);
                coreq_str = Some(wrap_course_codes(par)?);

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
  Ok(
    par
      .select_many("a")?
      .iter()
      .map(|link| link.inner_html().split(' ').collect::<Vec<&str>>().join(""))
      .collect(),
  )
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

fn wrap_course_codes(par: &ElementRef) -> Result<String> {
  Ok(par.inner_html().replace("<a>", "`").replace("</a>", "`"))
}
