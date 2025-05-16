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
      let term = html
        .root_element()
        .select_single("term")?
        .attr("v")
        .map(String::from);

      html
        .root_element()
        .select_many("uselection")?
        .into_iter()
        .map(|elem| Self::extract_course_schedule(elem, term.clone()))
        .collect::<Result<Vec<Schedule>>>()?
    } else {
      Vec::new()
    })
  }
}

impl VsbExtractor {
  fn extract_course_schedule(
    element: ElementRef,
    term: Option<String>,
  ) -> Result<Schedule> {
    let timeblocks = element.select_many("timeblock")?;

    Ok(Schedule {
      blocks: Some(
        element
          .select_many("block")?
          .into_iter()
          .map(|block| {
            Ok(Block {
              campus: block.value().attr("campus").map(title_case),
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
              instructors: block
                .value()
                .attr("teacher")
                .and_then(|s| {
                  s.split("; ")
                    .map(format_instructor_name)
                    .collect::<Result<Vec<String>>>()
                    .ok()
                })
                .unwrap_or_default(),
            })
          })
          .collect::<Result<Vec<_>>>()?,
      ),
      term,
    })
  }
}

fn format_instructor_name(last_first: &str) -> Result<String> {
  let Some((last_name, first_name)) = last_first.split_once(", ") else {
    bail!("Improperly formatted instructor name")
  };

  Ok(format!("{} {}", first_name, last_name))
}

fn title_case(s: &str) -> String {
  let mut s = s.to_string();
  if let Some(rest) = s.get_mut(1..) {
    rest.make_ascii_lowercase();
    s
  } else {
    s
  }
}
