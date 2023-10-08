use super::*;

pub(crate) fn merge(a: &Value, b: &Value) -> Value {
  match (a, b) {
    (&Value::Object(ref a_map), &Value::Object(ref b_map)) => {
      let mut merged = a_map.clone();

      b_map.iter().for_each(|(k, v)| {
        merged.insert(
          k.clone(),
          if let Some(existing) = a_map.get(k) {
            merge(existing, v)
          } else {
            v.clone()
          },
        );
      });

      Value::Object(merged)
    }
    (_, b) => b.clone(),
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn merge_objects() {
    let a = json!({
      "name": "John",
      "age": 30,
      "address": {
        "city": "New York"
      }
    });

    let b = json!({
      "age": 31,
      "address": {
        "state": "NY"
      },
      "phone": "1234567890"
    });

    let result = merge(&a, &b);

    assert_eq!(
      result,
      json!({
        "name": "John",
        "age": 31,
        "address": {
          "city": "New York",
          "state": "NY"
        },
        "phone": "1234567890"
      })
    );
  }

  #[test]
  fn merge_object_with_non_object() {
    let a = json!({
      "name": "John",
      "age": 30
    });

    let b = json!("string_value");

    let result = merge(&a, &b);

    assert_eq!(result, json!("string_value"));
  }

  #[test]
  fn merge_non_objects() {
    let a = json!(42);
    let b = json!(43);

    let result = merge(&a, &b);

    assert_eq!(result, json!(43));
  }

  #[test]
  fn merge_arrays() {
    let a = json!([1, 2, 3]);
    let b = json!([4, 5, 6]);

    let result = merge(&a, &b);

    assert_eq!(result, json!([4, 5, 6]));
  }
}
