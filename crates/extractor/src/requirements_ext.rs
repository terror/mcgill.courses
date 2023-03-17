use super::*;

pub(crate) trait RequirementsExt {
  fn from_notes(notes: ElementRef) -> Result<Self>
  where
    Self: Sized;
}

impl RequirementsExt for Requirements {
  fn from_notes(notes: ElementRef) -> Result<Self> {
    let mut requirements = Self::default();

    notes
      .select_many("li")?
      .iter()
      .try_for_each(|note| -> Result {
        let par = note.select_single("p")?;

        ["Prerequisite", "Corequisite"]
          .iter()
          .try_for_each(|title| -> Result {
            match par.inner_html().starts_with(title) {
              false => Ok(()),
              _ => requirements.set_requirement(
                Requirement::from(*title),
                par
                  .select_many("a")?
                  .iter()
                  .map(|link| link.inner_html())
                  .collect(),
              ),
            }
          })
      })?;

    Ok(requirements)
  }
}
