use super::*;

pub struct CatalogExtractor;

impl CourseExtractor for CatalogExtractor {
  fn extract_course_listings(
    &self,
    _text: &str,
  ) -> Result<Option<Vec<CourseListing>>> {
    todo!()
  }

  fn extract_course_page(&self, _text: &str) -> Result<CoursePage> {
    todo!()
  }
}
