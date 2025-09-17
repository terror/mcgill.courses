use super::*;

mod datetime_as_string {
  use {
    bson::DateTime,
    serde::{de::Error, Deserialize, Deserializer, Serializer},
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
}

#[derive(Clone, Debug, Serialize, Deserialize, Hash, Eq, PartialEq)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Review {
  pub content: String,
  pub course_id: String,
  pub difficulty: u32,
  pub instructors: Vec<String>,
  pub likes: i32,
  pub rating: u32,
  #[serde(with = "datetime_as_string")]
  #[typeshare(serialized_as = "String")]
  pub timestamp: DateTime,
  pub user_id: String,
}

impl Default for Review {
  fn default() -> Self {
    Self {
      content: String::new(),
      course_id: String::new(),
      difficulty: 0,
      instructors: vec![],
      likes: 0,
      rating: 0,
      timestamp: DateTime::from_millis(0),
      user_id: String::new(),
    }
  }
}

impl Into<Bson> for Review {
  fn into(self) -> Bson {
    Bson::Document(doc! {
      "content": self.content,
      "courseId": self.course_id,
      "difficulty": self.difficulty,
      "instructors": self.instructors,
      "rating": self.rating,
      "timestamp": self.timestamp,
      "userId": self.user_id,
      "likes": self.likes
    })
  }
}

#[cfg(test)]
mod tests {
  use {
    super::*,
    serde_json::{json, Value},
  };

  #[test]
  fn serialize_datetime_as_string() {
    let timestamp = DateTime::from_millis(1640995200000); // 2022-01-01 00:00:00 UTC

    let review = Review {
      content: "Test review".to_string(),
      course_id: "COMP101".to_string(),
      difficulty: 3,
      instructors: vec!["Dr. Smith".to_string()],
      likes: 5,
      rating: 4,
      timestamp,
      user_id: "user123".to_string(),
    };

    let json =
      serde_json::to_value(&review).expect("Failed to serialize review");

    assert_eq!(
      json["timestamp"],
      Value::String("1640995200000".to_string())
    );
  }

  #[test]
  fn deserialize_string_timestamp() {
    let json = json!({
      "content": "Test review",
      "courseId": "COMP101",
      "difficulty": 3,
      "instructors": ["Dr. Smith"],
      "likes": 5,
      "rating": 4,
      "timestamp": "1640995200000",
      "userId": "user123"
    });

    let review: Review =
      serde_json::from_value(json).expect("Failed to deserialize review");

    assert_eq!(review.timestamp.timestamp_millis(), 1640995200000);
    assert_eq!(review.content, "Test review");
    assert_eq!(review.course_id, "COMP101");
  }

  #[test]
  fn deserialize_legacy_mongodb_timestamp() {
    let json = json!({
      "content": "Test review",
      "courseId": "COMP101",
      "difficulty": 3,
      "instructors": ["Dr. Smith"],
      "likes": 5,
      "rating": 4,
      "timestamp": {
        "$date": {
          "$numberLong": "1640995200000"
        }
      },
      "userId": "user123"
    });

    let review: Review = serde_json::from_value(json)
      .expect("Failed to deserialize legacy review");

    assert_eq!(review.timestamp.timestamp_millis(), 1640995200000);
    assert_eq!(review.content, "Test review");
  }

  #[test]
  fn deserialize_invalid_string_timestamp() {
    let json = json!({
      "content": "Test review",
      "courseId": "COMP101",
      "difficulty": 3,
      "instructors": ["Dr. Smith"],
      "likes": 5,
      "rating": 4,
      "timestamp": "not-a-number",
      "userId": "user123"
    });

    let result = serde_json::from_value::<Review>(json);

    assert!(result.is_err());

    assert!(result
      .unwrap_err()
      .to_string()
      .contains("invalid timestamp string"));
  }

  #[test]
  fn deserialize_malformed_mongodb_timestamp() {
    let json = json!({
      "content": "Test review",
      "courseId": "COMP101",
      "difficulty": 3,
      "instructors": ["Dr. Smith"],
      "likes": 5,
      "rating": 4,
      "timestamp": {
        "$date": "invalid-format"
      },
      "userId": "user123"
    });

    let result = serde_json::from_value::<Review>(json);

    assert!(result.is_err());

    assert!(result
      .unwrap_err()
      .to_string()
      .contains("'$date' field must be an object"));
  }

  #[test]
  fn deserialize_missing_numberlong() {
    let json = json!({
      "content": "Test review",
      "courseId": "COMP101",
      "difficulty": 3,
      "instructors": ["Dr. Smith"],
      "likes": 5,
      "rating": 4,
      "timestamp": {
        "$date": {}
      },
      "userId": "user123"
    });

    let result = serde_json::from_value::<Review>(json);

    assert!(result.is_err());

    assert!(result
      .unwrap_err()
      .to_string()
      .contains("missing '$numberLong' field"));
  }

  #[test]
  fn deserialize_invalid_timestamp_type() {
    let json = json!({
      "content": "Test review",
      "courseId": "COMP101",
      "difficulty": 3,
      "instructors": ["Dr. Smith"],
      "likes": 5,
      "rating": 4,
      "timestamp": 123, // Number instead of string or object
      "userId": "user123"
    });

    let result = serde_json::from_value::<Review>(json);

    assert!(result.is_err());

    assert!(result
      .unwrap_err()
      .to_string()
      .contains("expected either a timestamp string or MongoDB date object"));
  }

  #[test]
  fn roundtrip_serialization() {
    let original = Review {
      content: "Round trip test".to_string(),
      course_id: "MATH200".to_string(),
      difficulty: 2,
      instructors: vec!["Prof. Johnson".to_string(), "Dr. Lee".to_string()],
      likes: 10,
      rating: 5,
      timestamp: DateTime::from_millis(1672531200000), // 2023-01-01 00:00:00 UTC
      user_id: "user456".to_string(),
    };

    let json = serde_json::to_value(&original).expect("failed to serialize");

    let deserialized: Review =
      serde_json::from_value(json).expect("failed to deserialize");

    assert_eq!(original, deserialized);
  }
}
