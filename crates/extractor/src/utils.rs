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
    .last()
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

pub(crate) fn wrap_course_codes(par: &ElementRef) -> String {
  par
    .children()
    .map(|el| {
      match el.value() {
        Node::Text(t) => t.to_string(),
        Node::Element(e) => {
          // This unwrap will never panic
          let elem = ElementRef::wrap(el).unwrap();
          let text = elem.text().collect::<String>();
          if e.name() == "a" && !text.is_empty() {
            format!("`{}`", get_course_code_from_link(&elem))
          } else {
            text
          }
        }
        _ => String::from(""),
      }
    })
    .collect::<String>()
}

pub(crate) fn dedup(v: &mut Vec<String>) {
  let mut set = HashSet::new();

  v.retain(|e| set.insert(e.clone()));
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_wrap_course_codes() {
    let html = Html::parse_fragment(
      r#"<html><p>Prerequisites: <a href="/study/2023-2024/courses/isla-651d1"></a><a href="http://www.mcgill.ca/study/2023-2024/courses/ISLA-651D1">ISLA 651D1</a>/<a href="/study/2023-2024/courses/isla-651d2">D2</a> or <a href="/study/2023-2024/courses/isla-551d1"></a><a href="http://www.mcgill.ca/study/2023-2024/courses/ISLA-551D1" title="" class="tooltip">ISLA 551D1</a>/<a href="/study/2023-2024/courses/isla-551d2" title="" class="tooltip">D2</a> or <a href="/study/2023-2024/courses/isla-251d1"></a><a href="http://www.mcgill.ca/study/2023-2024/courses/ISLA-251D1">ISLA 251D1</a>/<a href="/study/2023-2024/courses/isla-251d2">D2</a> or permission of the Institute.</p></html>"#,
    );
    let elem = html.root_element().select_single("p").unwrap();

    assert_eq!(wrap_course_codes(&elem), "Prerequisites: `ISLA 651D1`/`ISLA 651D2` or `ISLA 551D1`/`ISLA 551D2` or `ISLA 251D1`/`ISLA 251D2` or permission of the Institute.");
  }

  #[test]
  fn wrap_course_codes_ignores_non_a_tags() {
    let html = Html::parse_fragment(
      r#"<html><p>this <span>is a</span> <a href="foo.com/test-396">TEST 396</a> for ignoring tags</p></html>"#,
    );
    let elem = html.root_element().select_single("p").unwrap();

    assert_eq!(
      wrap_course_codes(&elem),
      "this is a `TEST 396` for ignoring tags"
    );
  }
}
