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
        .iter()
        .try_for_each(|title| -> Result {
          match par.inner_html().starts_with(title) {
            false => Ok(()),
            _ => match Requirement::from(*title) {
              Requirement::Prerequisites => {
                requirements.set_prerequisites(
                  par
                    .select_many("a")?
                    .iter()
                    .map(|link| link.inner_html())
                    .collect(),
                );

                Ok(())
              }
              Requirement::Corequisites => {
                requirements.set_corequisites(
                  par
                    .select_many("a")?
                    .iter()
                    .map(|link| link.inner_html())
                    .collect(),
                );

                Ok(())
              }
              Requirement::Restrictions => {
                requirements.set_restrictions(
                  par
                    .text()
                    .collect::<String>()
                    .split(' ')
                    .skip(1)
                    .collect::<Vec<&str>>()
                    .join(" "),
                );

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
