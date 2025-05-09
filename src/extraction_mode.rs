use super::*;

#[derive(Eq, PartialEq, Debug, Copy, Clone, clap::ValueEnum)]
pub(crate) enum ExtractionMode {
  ECalendar = 1,
  Catalog = 2,
}

impl ExtractionMode {
  pub(crate) fn base_url(&self) -> String {
    match self {
      ExtractionMode::ECalendar | ExtractionMode::Catalog => {
        "https://www.mcgill.ca".into()
      }
    }
  }

  pub(crate) fn course_extractor(&self) -> Box<dyn CourseExtractor> {
    match self {
      ExtractionMode::ECalendar => Box::new(ECalendarExtractor),
      ExtractionMode::Catalog => Box::new(CatalogExtractor),
    }
  }
}
