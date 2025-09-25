use {
  super::*,
  serde::{Deserialize, Deserializer, Serializer, de::Error},
  serde_json::Value,
};

pub fn serialize<S>(
  datetime: &DateTime,
  serializer: S,
) -> Result<S::Ok, S::Error>
where
  S: Serializer,
{
  serializer.serialize_str(&datetime.timestamp_millis().to_string())
}

/// Deserializes DateTime from either string or MongoDB object format for backward
/// compatibility.
///
/// This function handles two different timestamp formats during deserialization.
/// The new format expects timestamps as string representations of milliseconds
/// since Unix epoch (e.g., "1640995200000"), which matches the typeshare-generated
/// TypeScript types. However, existing database records contain timestamps in
/// MongoDB's extended JSON format with nested objects like {"$date":
/// {"$numberLong": "1640995200000"}}.
///
/// The dual format support exists because historical reviews in the database were
/// stored using MongoDB's native BSON DateTime serialization, while new records
/// use the string format for consistency with frontend expectations.
pub fn deserialize<'de, D>(deserializer: D) -> Result<DateTime, D::Error>
where
  D: Deserializer<'de>,
{
  let value = Value::deserialize(deserializer)?;

  match value {
    Value::String(millis_str) => Ok(DateTime::from_millis(
      millis_str.parse::<i64>().map_err(|error| {
        D::Error::custom(format!(
          "invalid timestamp string '{}': {}",
          millis_str, error
        ))
      })?,
    )),
    Value::Object(map) => {
      let date_obj = map.get("$date").ok_or_else(|| {
        D::Error::custom("missing '$date' field in timestamp object")
      })?;

      let number_long_obj = date_obj
        .as_object()
        .ok_or_else(|| D::Error::custom("'$date' field must be an object"))?;

      let number_long_str = number_long_obj
        .get("$numberLong")
        .ok_or_else(|| {
          D::Error::custom("missing '$numberLong' field in $date object")
        })?
        .as_str()
        .ok_or_else(|| {
          D::Error::custom("'$numberLong' field must be a string")
        })?;

      let millis = number_long_str.parse::<i64>().map_err(|error| {
        D::Error::custom(format!(
          "invalid $numberLong value '{}': {}",
          number_long_str, error
        ))
      })?;

      Ok(DateTime::from_millis(millis))
    }
    _ => Err(D::Error::custom(
      "expected either a timestamp string or MongoDB date object",
    )),
  }
}
