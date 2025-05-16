use super::*;

pub(crate) fn get_course_codes(par: &ElementRef) -> Result<Vec<String>> {
  let re = Regex::new("(([A-Z0-9]){4} [0-9]{3}(D1|D2|N1|N2|J1|J2|J3)?)")
    .expect("invalid regex");
  let text = par.inner_html();

  let mut codes: Vec<String> = re
    .find_iter(&text)
    .map(|m| m.as_str().to_string().replace(" ", ""))
    .collect();

  dedup(&mut codes);

  Ok(codes)
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
    <p>Prerequisites: COMP 250; MATH 235 or MATH 240</p>
  </html>
  "#;

  const HTML2: &str = r#"
  <html>
    <p>Prerequisites: EAST 200D1</p>
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
  fn get_course_codes2() {
    assert_eq!(
      super::get_course_codes(
        &Html::parse_fragment(HTML2)
          .root_element()
          .select_single("p")
          .unwrap()
      )
      .unwrap(),
      vec!["EAST200D1"]
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
