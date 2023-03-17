use super::*;

pub(crate) trait ScheduleExt {
  fn from_block(block: &ElementRef) -> Self
  where
    Self: Sized;
}

impl ScheduleExt for Schedule {
  fn from_block(block: &ElementRef) -> Self {
    Schedule {
      campus: block.value().attr("campus").map(|s| s.to_string()),
      display: block.value().attr("disp").map(|s| s.to_string()),
      location: block.value().attr("location").map(|s| s.to_string()),
    }
  }
}
