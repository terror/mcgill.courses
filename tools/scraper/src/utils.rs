use super::*;

pub(crate) fn dedup<T>(v: &mut Vec<T>)
where
  T: Eq + Clone + Hash,
{
  let mut set = HashSet::new();
  v.retain(|e| set.insert(e.clone()));
}

pub(crate) fn format_instructor_name(last_first: &str) -> Result<String> {
  let Some((last_name, first_name)) = last_first.split_once(", ") else {
    bail!("Improperly formatted instructor name")
  };

  Ok(format!("{} {}", first_name, last_name))
}

pub(crate) fn get_course_codes(par: &ElementRef) -> Result<Vec<String>> {
  let pattern = Regex::new("(([A-Z0-9]){4} [0-9]{3}(D1|D2|N1|N2|J1|J2|J3)?)")?;

  let text = par.inner_html();

  let mut codes = pattern
    .find_iter(&text)
    .map(|m| m.as_str().to_string().replace(" ", ""))
    .collect::<Vec<String>>();

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

pub(crate) fn str_to_title_case(s: &str) -> String {
  let mut chars = s.chars();

  match chars.next() {
    None => String::new(),
    Some(first) => {
      format!("{}{}", first.to_uppercase(), chars.as_str().to_lowercase())
    }
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn dedup() {
    let mut v = vec!["a".to_string(), "b".to_string(), "a".to_string()];
    super::dedup(&mut v);
    assert_eq!(v, vec!["a".to_string(), "b".to_string()]);
  }

  #[test]
  fn format_instructor_name() {
    assert_eq!(
      super::format_instructor_name("Smith, John").unwrap(),
      "John Smith"
    );

    assert_eq!(
      super::format_instructor_name("Johnson, Mary Jane").unwrap(),
      "Mary Jane Johnson"
    );

    assert_eq!(
      super::format_instructor_name("O'Connor, Patrick").unwrap(),
      "Patrick O'Connor"
    );

    assert!(super::format_instructor_name("Smith John").is_err());
    assert!(super::format_instructor_name("Smith,John").is_err());
    assert!(super::format_instructor_name("Smith").is_err());
    assert!(super::format_instructor_name("").is_err());
    assert_eq!(super::format_instructor_name(", John").unwrap(), "John ");
    assert_eq!(super::format_instructor_name("Smith, ").unwrap(), " Smith");
  }

  #[test]
  fn get_normal_course_codes() {
    assert_eq!(
      super::get_course_codes(
        &Html::parse_fragment(
          "<html><p>Prerequisites: COMP 250; MATH 235 or MATH 240</p></html>"
        )
        .root_element()
        .select_single("p")
        .unwrap()
      )
      .unwrap(),
      vec!["COMP250", "MATH235", "MATH240"]
    );
  }

  #[test]
  fn get_multi_course_course_codes() {
    assert_eq!(
      super::get_course_codes(
        &Html::parse_fragment("<html><p>Prerequisites: EAST 200D1</p></html>")
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
        &Html::parse_fragment(
          "<html><p>Prerequisites: COMP 250; MATH 235 or MATH 240</p></html>"
        )
        .root_element()
        .select_single("p")
        .unwrap()
      ),
      "COMP 250; MATH 235 or MATH 240"
    );
  }

  #[test]
  fn str_to_title_case() {
    assert_eq!(super::str_to_title_case("!@#$%"), "!@#$%");
    assert_eq!(super::str_to_title_case(""), "");
    assert_eq!(super::str_to_title_case("123ABC"), "123abc");
    assert_eq!(super::str_to_title_case("A"), "A");
    assert_eq!(super::str_to_title_case("HELLO"), "Hello");
    assert_eq!(super::str_to_title_case("PROGRAMMING"), "Programming");
    assert_eq!(super::str_to_title_case("a"), "A");
    assert_eq!(super::str_to_title_case("tEST"), "Test");
    assert_eq!(super::str_to_title_case("world"), "World");
  }
}
