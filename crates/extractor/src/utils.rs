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

pub(crate) fn dedup(v: &mut Vec<String>) {
  let mut set = HashSet::new();
  v.retain(|e| set.insert(e.clone()));
}
