use super::*;

use serde::de::MapAccess;

#[derive(Clone, Debug, Serialize, Deserialize, Hash, Eq, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Review {
  pub content: String,
  pub course_id: String,
  pub instructor: String,
  pub rating: u32,
  #[serde(deserialize_with = "deserialize_timestamp")]
  pub timestamp: DateTime,
  pub user_id: String,
}

struct TimestampVisitor;

impl<'de> Visitor<'de> for TimestampVisitor {
  type Value = DateTime;

  fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
    formatter.write_str("an integer or a DateTime map")
  }

  fn visit_u64<E>(self, value: u64) -> Result<Self::Value, E>
  where
    E: de::Error,
  {
    Ok(DateTime::from_chrono::<Utc>(
      Utc.from_utc_datetime(
        &NaiveDateTime::from_timestamp_opt(
          value.try_into().map_err(|_| {
            de::Error::custom(format!("Invalid timestamp value"))
          })?,
          0,
        )
        .ok_or_else(|| {
          de::Error::custom(format!("Invalid timestamp: {}", value))
        })?,
      ),
    ))
  }

  fn visit_map<A>(self, mut map: A) -> Result<DateTime, A::Error>
  where
    A: MapAccess<'de>,
  {
    let mut timestamp: Option<i64> = None;

    while let Some(key) = map.next_key::<String>()? {
      match key.as_str() {
        "$date" => {
          let next = map.next_value::<serde_json::Value>()?;

          if let Some(number) = next.get("$numberLong") {
            timestamp = number.as_str().unwrap_or("0").parse::<i64>().ok();
          }
        }
        _ => (),
      }
    }

    let value = timestamp.ok_or_else(|| {
      de::Error::custom("Invalid timestamp: expected $date with $numberLong")
    })?;

    Ok(DateTime::from_chrono(Utc.from_utc_datetime(
      &NaiveDateTime::from_timestamp_opt(value, 0).ok_or_else(|| {
        de::Error::custom(format!("Invalid timestamp: {}", value))
      })?,
    )))
  }
}

fn deserialize_timestamp<'de, D>(deserializer: D) -> Result<DateTime, D::Error>
where
  D: Deserializer<'de>,
{
  deserializer.deserialize_any(TimestampVisitor)
}

impl Default for Review {
  fn default() -> Self {
    Self {
      content: String::new(),
      course_id: String::new(),
      instructor: String::new(),
      rating: 0,
      timestamp: DateTime::from_chrono::<Utc>(
        Utc.from_utc_datetime(&NaiveDateTime::default()),
      ),
      user_id: String::new(),
    }
  }
}
