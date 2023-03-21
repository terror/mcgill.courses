use super::*;

pub(crate) trait RequirementsExt {
  fn from_notes(notes: ElementRef) -> Result<Self>
  where
    Self: Sized;
}

impl RequirementsExt for Requirements {
  fn from_notes(notes: ElementRef) -> Result<Self> {
    let mut requirements = Self::default();

    let par = notes
      .select_many("li")?
      .iter()
      .map(|note| note.select_single("p"))
      .collect::<Result<Vec<ElementRef>, _>>()?;

    par.iter().try_for_each(|par| -> Result {
      ["Prerequisite", "Corequisite", "Restriction"]
        .iter()
        .try_for_each(|title| -> Result {
          match par.inner_html().starts_with(title) {
            false => Ok(()),
            _ => match Requirement::from(*title) {
              Requirement::Prerequisites => Ok(
                requirements.set_prerequisites(
                  par
                    .select_many("a")?
                    .iter()
                    .map(|link| link.inner_html())
                    .collect(),
                ),
              ),
              Requirement::Corequisites => Ok(
                requirements.set_corequisites(
                  par
                    .select_many("a")?
                    .iter()
                    .map(|link| link.inner_html())
                    .collect(),
                ),
              ),
              Requirement::Restrictions => Ok(
                requirements.set_restrictions(
                  par
                    .text()
                    .collect::<String>()
                    .split(' ')
                    .skip(1)
                    .collect::<Vec<&str>>()
                    .join(" "),
                ),
              ),
              Requirement::Unknown => Err(anyhow!("Unkown course requirement")),
            },
          }
        })
    })?;

    Ok(requirements)
  }
}
