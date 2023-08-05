use super::*;

pub(crate) trait RequirementsExt {
  fn from_notes(notes: ElementRef) -> Result<Self>
  where
    Self: Sized;
}

impl RequirementsExt for Requirements {
  fn from_notes(notes: ElementRef) -> Result<Self> {
    let mut requirements = Self::default();

    let mut paragraphs = Vec::new();

    for note in notes.select_many("li")? {
      if let Some(paragraph) = note.select_optional("p")? {
        paragraphs.push(paragraph);
      } else {
        paragraphs.push(note);
      }
    }

    for paragraph in paragraphs {
      for title in ["Prerequisite", "Corequisite", "Restriction"].iter() {
        if paragraph.inner_html().starts_with(title) {
          match Requirement::from(*title) {
            Requirement::Prerequisites => {
              requirements.set_prerequisites_text(Some(paragraph.inner_html()));
              requirements.set_prerequisites(get_course_codes(&paragraph)?);
            }
            Requirement::Corequisites => {
              requirements.set_corequisites_text(Some(paragraph.inner_html()));
              requirements.set_corequisites(get_course_codes(&paragraph)?);
            }
            Requirement::Restrictions => {
              requirements.set_restrictions(get_text(&paragraph));
            }
            Requirement::Unknown => {
              return Err(anyhow!("Unknown requirement type"));
            }
          }
        }
      }
    }

    Ok(requirements)
  }
}
