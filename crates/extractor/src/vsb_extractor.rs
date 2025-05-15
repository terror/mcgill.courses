use super::*;

pub struct VsbExtractor;

impl ScheduleExtractor for VsbExtractor {
  fn extract_course_schedules(text: &str) -> Result<Vec<Schedule>> {
    let html = Html::parse_fragment(text);
    let err = html
      .root_element()
      .select_single("errors")?
      .select_many("error")?;

    Ok(if err.is_empty() {
      html
        .root_element()
        .select_many("uselection")?
        .into_iter()
        .map(Self::extract_course_schedule)
        .collect::<Result<Vec<Schedule>>>()?
    } else {
      Vec::new()
    })
  }
}

impl VsbExtractor {
  fn extract_course_schedule(element: ElementRef) -> Result<Schedule> {
    let timeblocks = element.select_many("timeblock")?;

    let term = |ssid: Option<&str>| -> Option<String> {
      match (ssid.map(|ssid| &ssid[4..6]), ssid.map(|ssid| &ssid[0..4])) {
        (Some("01"), Some(year)) => Some(format!("Winter {year}")),
        (Some("05"), Some(year)) => Some(format!("Summer {year}")),
        (Some("09"), Some(year)) => Some(format!("Fall {year}")),
        _ => None,
      }
    };

    Ok(Schedule {
      blocks: Some(
        element
          .select_many("block")?
          .into_iter()
          .map(|block| {
            Ok(Block {
              campus: block.value().attr("campus").map(String::from),
              display: block.value().attr("disp").map(String::from),
              location: block.value().attr("location").map(String::from),
              crn: block.value().attr("key").map(String::from),
              timeblocks: Some(
                timeblocks
                  .iter()
                  .filter(|timeblock| {
                    block
                      .value()
                      .attr("timeblockids")
                      .unwrap_or_default()
                      .split(',')
                      .any(|id| {
                        id == timeblock.value().attr("id").unwrap_or_default()
                      })
                  })
                  .map(|timeblock| TimeBlock {
                    day: timeblock.value().attr("day").map(String::from),
                    t1: timeblock.value().attr("t1").map(String::from),
                    t2: timeblock.value().attr("t2").map(String::from),
                  })
                  .collect(),
              ),
            })
          })
          .collect::<Result<Vec<_>>>()?,
      ),
      term: term(element.select_single("selection")?.value().attr("ssid")),
    })
  }
}
