use super::*;

pub(crate) trait CoursePageExt {
  fn from_html(html: Html, parse_reqs: bool) -> Result<Self>
  where
    Self: Sized;
}

impl CoursePageExt for CoursePage {
  fn from_html(html: Html, parse_reqs: bool) -> Result<Self> {
    let content = html.root_element().try_select_single(vec![
      "div[class='node node-catalog clearfix']",
      "div[class='node node-catalog node-promoted clearfix']",
    ])?;

    let full_title = html
      .root_element()
      .select_single("h1[id='page-title']")?
      .inner_html()
      .trim()
      .to_owned()
      .replace("&amp;", "&");

    let full_code = full_title
      .split(' ')
      .take(2)
      .collect::<Vec<&str>>()
      .join(" ");

    Ok(Self {
      title: full_title
        .splitn(3, ' ')
        .nth(2)
        .unwrap_or("")
        .split(" (")
        .next()
        .unwrap_or("")
        .to_owned()
        .replace("&amp;", "&"),
      credits: full_title
        .split('(')
        .skip(1)
        .collect::<String>()
        .split(' ')
        .take(1)
        .collect(),
      subject: full_code
        .split(' ')
        .take(1)
        .collect::<Vec<&str>>()
        .join(" "),
      code: full_code
        .split(' ')
        .skip(1)
        .collect::<Vec<&str>>()
        .join(" "),
      faculty_url: content
        .select_single("div[class='meta']")?
        .select_single("p")?
        .select_single("a")?
        .value()
        .attr("href")
        .ok_or_else(|| anyhow!("Failed to get attribute"))?
        .to_string(),
      description: content
        .select_single("div[class='content']")?
        .select_single("p")?
        .inner_html()
        .trim()
        .split(':')
        .skip(1)
        .collect::<Vec<&str>>()
        .join(" ")
        .trim()
        .to_owned()
        .replace("&amp;", "&"),
      instructors: extract_course_instructors(&html)?,
      requirements: extract_course_requirements(&html, parse_reqs)?,
    })
  }
}
