use super::*;

pub(crate) fn get_course_codes(par: &ElementRef) -> Result<Vec<String>> {
  let mut codes = par
    .select_many("a")?
    .iter()
    .map(|link| get_course_code_from_link(link).replace(' ', ""))
    .filter(|code| !code.is_empty())
    .collect::<Vec<String>>();

  dedup(&mut codes);

  Ok(codes)
}

pub(crate) fn get_course_code_from_link(link: &ElementRef) -> String {
  link
    .value()
    .attr("href")
    .unwrap_or("")
    .split('/')
    .next_back()
    .unwrap_or("")
    .to_ascii_uppercase()
    .replace('-', " ")
}

pub(crate) fn get_text(par: &ElementRef) -> String {
  par
    .text()
    .collect::<String>()
    .split(' ')
    .skip(1)
    .collect::<Vec<&str>>()
    .join(" ")
}

pub(crate) fn dedup(v: &mut Vec<String>) {
  let mut set = HashSet::new();
  v.retain(|e| set.insert(e.clone()));
}

#[cfg(test)]
mod tests {
  use super::*;

  const HTML: &str = r#"
  <html>
    <p>Prerequisites: <a href="/study/2022-2023/courses/comp-250"></a><a href="http://www.mcgill.ca/study/2022-2023/courses/COMP-250" title="" class="tooltip">COMP 250</a>; <a href="/study/2022-2023/courses/math-235"></a><a href="http://www.mcgill.ca/study/2022-2023/courses/MATH-235" title="" class="tooltip">MATH 235</a> or <a href="/study/2022-2023/courses/math-240"></a><a href="http://www.mcgill.ca/study/2022-2023/courses/MATH-240" title="" class="tooltip">MATH 240</a></p>
  </html>
  "#;

  #[test]
  fn get_course_codes() {
    assert_eq!(
      super::get_course_codes(
        &Html::parse_fragment(HTML)
          .root_element()
          .select_single("p")
          .unwrap()
      )
      .unwrap(),
      vec!["COMP250", "MATH235", "MATH240"]
    );
  }

  #[test]
  fn get_course_code_from_link() {
    assert_eq!(
      super::get_course_code_from_link(
        &Html::parse_fragment(
          "<html><a href=\"/study/2022-2023/courses/comp-250\"></a></html>"
        )
        .root_element()
        .select_single("a")
        .unwrap()
      ),
      "COMP 250"
    );
  }

  #[test]
  fn get_text() {
    assert_eq!(
      super::get_text(
        &Html::parse_fragment(HTML)
          .root_element()
          .select_single("p")
          .unwrap()
      ),
      "COMP 250; MATH 235 or MATH 240"
    );
  }

  #[test]
  fn dedup() {
    let mut v = vec!["a".to_string(), "b".to_string(), "a".to_string()];
    super::dedup(&mut v);
    assert_eq!(v, vec!["a".to_string(), "b".to_string()]);
  }
}
