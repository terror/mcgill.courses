use super::*;

pub(crate) trait ScheduleExt {
  fn from_selection(selection: &ElementRef) -> Self
  where
    Self: Sized;
}

fn term(ssid: Option<&str>) -> Option<String> {
  match ssid {
    Some("202305") => Some(String::from("Summer 2023")),
    Some(_) | None => None,
  }
}

impl ScheduleExt for Schedule {
  fn from_selection(selection: &ElementRef) -> Self {
    let blocks = selection.select_many("block");

    Self {
      campus: block.value().attr("campus").map(|s| s.to_string()),
      display: block.value().attr("disp").map(|s| s.to_string()),
      location: block.value().attr("location").map(|s| s.to_string()),
      term: term(block.value().attr("ssid")),
    }
  }
}
