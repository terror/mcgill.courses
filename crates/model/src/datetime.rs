use {
  bson::{Bson, DateTime as BsonDateTime},
  chrono::{DateTime as ChronoDateTime, Utc},
  serde::{Deserialize, Deserializer, Serialize, Serializer, de::Error},
  serde_json::Value,
  std::cmp::Ordering,
  utoipa::ToSchema,
};

#[derive(Clone, Debug, Hash, Eq, PartialEq)]
pub struct DateTime(pub BsonDateTime);

impl PartialOrd for DateTime {
  fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
    Some(self.cmp(other))
  }
}

impl Ord for DateTime {
  fn cmp(&self, other: &Self) -> Ordering {
    self.0.cmp(&other.0)
  }
}

impl DateTime {
  pub fn from_millis(millis: i64) -> Self {
    DateTime(BsonDateTime::from_millis(millis))
  }

  pub fn timestamp_millis(&self) -> i64 {
    self.0.timestamp_millis()
  }
}

impl From<BsonDateTime> for DateTime {
  fn from(dt: BsonDateTime) -> Self {
    DateTime(dt)
  }
}

impl From<DateTime> for BsonDateTime {
  fn from(wrapper: DateTime) -> Self {
    wrapper.0
  }
}

impl From<DateTime> for Bson {
  fn from(wrapper: DateTime) -> Self {
    Bson::DateTime(wrapper.0)
  }
}

impl From<ChronoDateTime<Utc>> for DateTime {
  fn from(dt: ChronoDateTime<Utc>) -> Self {
    DateTime(BsonDateTime::from_chrono(dt))
  }
}

impl ToSchema for DateTime {
  fn name() -> std::borrow::Cow<'static, str> {
    std::borrow::Cow::Borrowed("DateTime")
  }
}

impl utoipa::PartialSchema for DateTime {
  fn schema() -> utoipa::openapi::RefOr<utoipa::openapi::schema::Schema> {
    utoipa::openapi::schema::Object::builder()
      .schema_type(utoipa::openapi::schema::Type::String)
      .format(Some(utoipa::openapi::SchemaFormat::KnownFormat(
        utoipa::openapi::KnownFormat::DateTime,
      )))
      .description(Some("ISO 8601 DateTime string"))
      .examples([serde_json::json!("2023-01-01T00:00:00.000Z")])
      .into()
  }
}

impl Serialize for DateTime {
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where
    S: Serializer,
  {
    serializer.serialize_str(&self.0.timestamp_millis().to_string())
  }
}

impl<'de> Deserialize<'de> for DateTime {
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
  fn deserialize<D>(deserializer: D) -> Result<DateTime, D::Error>
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
}
