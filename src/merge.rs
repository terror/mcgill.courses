use super::*;

pub(crate) fn merge(a: &Value, b: &Value) -> Value {
  match (a, b) {
    (&Value::Object(ref a_map), &Value::Object(ref b_map)) => {
      let mut merged = a_map.clone();

      b_map
        .iter()
        .filter(|(_, v)| !v.is_null())
        .for_each(|(k, v)| {
          merged.insert(
            k.clone(),
            if let Some(e) = a_map.get(k) {
              merge(e, v)
            } else {
              v.clone()
            },
          );
        });

      Value::Object(merged)
    }
    (&Value::Array(ref a_arr), &Value::Array(ref b_arr)) => {
      let mut merged = vec![];

      for i in 0..std::cmp::max(a_arr.len(), b_arr.len()) {
        if i < a_arr.len() && i < b_arr.len() {
          merged.push(merge(&a_arr[i], &b_arr[i]));
        } else if i < a_arr.len() {
          merged.push(a_arr[i].clone());
        } else {
          merged.push(b_arr[i].clone());
        }
      }

      Value::Array(merged)
    }
    (a, b) => {
      if b.is_null() {
        a.clone()
      } else {
        b.clone()
      }
    }
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn merge_objects_recursive() {
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

    let a = json!("string_value");
    let b = json!(null);

    let result = merge(&a, &b);

    assert_eq!(result, json!("string_value"));
  }

  #[test]
  fn merge_arrays() {
    let a = json!([1, 2, 3]);
    let b = json!([4, 5, 6]);

    let result = merge(&a, &b);

    assert_eq!(result, json!([4, 5, 6]));
  }

  #[test]
  fn merge_array_of_objects() {
    let a = json!([
      { "name": "John", "age": 30 },
      { "name": "Jane", "age": 25 }
    ]);

    let b = json!([
      { "name": "John", "age": 31 },
      { "name": "Jane", "age": null }
    ]);

    let result = merge(&a, &b);

    assert_eq!(
      result,
      json!([
        { "name": "John", "age": 31 },
        { "name": "Jane", "age": 25 }
      ])
    );
  }

  #[test]
  fn leave_nullified_fields() {
    let a = json!({
      "name": "John",
      "age": 30,
      "address": {
        "city": "New York"
      }
    });

    let b = json!({
      "age": null,
      "address": null,
      "phone": "1234567890"
    });

    let result = merge(&a, &b);

    assert_eq!(
      result,
      json!({
        "name": "John",
        "age": 30,
        "address": {
          "city": "New York"
        },
        "phone": "1234567890"
      })
    );
  }

  #[test]
  fn merge_empty_objects() {
    let a = json!({});
    let b = json!({});

    let result = merge(&a, &b);

    assert_eq!(result, json!({}));
  }

  #[test]
  fn merge_object_with_empty_array() {
    let a = json!({});
    let b = json!([]);

    let result = merge(&a, &b);

    assert_eq!(result, json!([]));
  }

  #[test]
  fn merge_empty_array_with_object() {
    let a = json!([]);
    let b = json!({});

    let result = merge(&a, &b);

    assert_eq!(result, json!({}));
  }
}
