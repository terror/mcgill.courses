use super::*;

pub(crate) trait RequirementsExt {
  fn from_notes(notes: ElementRef) -> Result<Self>
  where
    Self: Sized;
}

impl RequirementsExt for Requirements {
  fn from_notes(notes: ElementRef) -> Result<Self> {
    let mut requirements = Self::default();

    let mut par = Vec::new();

    for note in notes.select_many("li")? {
      if let Some(p) = note.select_optional("p")? {
        par.push(p);
      } else {
        par.push(note);
      }
    }

    par.iter().try_for_each(|par| -> Result {
      ["Prerequisite", "Corequisite", "Restriction"]
        .into_iter()
        .try_for_each(|title| -> Result {
          match par.inner_html().starts_with(title) {
            false => Ok(()),
            _ => match Requirement::from(title) {
              Requirement::Prerequisites => {
                requirements.set_prerequisites_text(Some(par.inner_html()));
                requirements.set_prerequisites(get_course_codes(par)?);

                Ok(())
              }
              Requirement::Corequisites => {
                requirements.set_corequisites_text(Some(par.inner_html()));
                requirements.set_corequisites(get_course_codes(par)?);

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

    Ok(requirements)
  }
}
