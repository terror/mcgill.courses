use super::*;

pub struct CatalogExtractor;

impl CourseExtractor for CatalogExtractor {
  fn extract_course_listings(
    &self,
    text: &str,
  ) -> Result<Option<Vec<CourseListing>>> {
    let page = Html::parse_fragment(text);

    let content = page.root_element().select_optional("ol.mds-list--none")?;

    if let Some(content) = content {
      let course_listings = content
        .select_many("li.mds-search__results")?
        .into_iter()
        .map(Self::extract_course_listing)
        .collect::<Result<Vec<CourseListing>, _>>()?;

      return Ok(Some(course_listings));
    }

    Ok(None)
  }

  fn extract_course_page(&self, _text: &str) -> Result<CoursePage> {
    todo!()
  }
}

impl CatalogExtractor {
  fn extract_course_listing(element: ElementRef) -> Result<CourseListing> {
    let url = element
      .select_single("div[class~='views-field-title-s'] a, h3.field-content a")?
      .value()
      .attr("href")
      .ok_or_else(|| anyhow!("Failed to get attribute"))?
      .to_string();

    Ok(CourseListing {
      url,
      ..Default::default()
    })
  }
}
