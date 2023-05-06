use super::*;

pub(crate) trait CourseListingExt {
  fn from_listing(listing: &ElementRef) -> Result<Self>
  where
    Self: Sized;
}

impl CourseListingExt for CourseListing {
  fn from_listing(listing: &ElementRef) -> Result<Self> {
    Ok(Self {
      department: listing
        .select_single("span[class~='views-field-field-dept-code']")?
        .select_single("span[class='field-content']")?
        .inner_html()
        .replace("&amp;", "&"),
      faculty: listing
        .select_single("span[class~='views-field-field-faculty-code']")?
        .select_single("span[class='field-content']")?
        .inner_html()
        .replace("&amp;", "&"),
      level: listing
        .select_single("span[class~='views-field-level']")?
        .select_single("span[class='field-content']")?
        .inner_html(),
      terms: listing
        .select_single("span[class~='views-field-terms']")?
        .select_single("span[class='field-content']")?
        .inner_html()
        .split(", ")
        .map(|term| term.to_owned())
        .collect(),
      url: listing
        .select_single("div[class~='views-field-field-course-title-long']")?
        .select_single("a")?
        .value()
        .attr("href")
        .ok_or_else(|| anyhow!("Failed to get attribute"))?
        .to_string(),
    })
  }
}
