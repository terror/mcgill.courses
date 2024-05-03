use super::*;

pub(crate) trait Combine<T> {
  fn combine(self, other: Vec<T>) -> Vec<T>;
  fn combine_opt(self, other: Option<Vec<T>>) -> Vec<T>;
}

impl<T: Eq + Hash + Clone> Combine<T> for Vec<T> {
  fn combine(self, other: Vec<T>) -> Vec<T> {
    [self, other].concat().iter().unique().cloned().collect()
  }

  fn combine_opt(self, other: Option<Vec<T>>) -> Vec<T> {
    [self, other.unwrap_or_default()]
      .concat()
      .iter()
      .unique()
      .cloned()
      .collect()
  }
}

impl<T: Eq + Hash + Clone> Combine<T> for Option<Vec<T>> {
  fn combine(self, other: Vec<T>) -> Vec<T> {
    [self.unwrap_or_default(), other]
      .concat()
      .iter()
      .unique()
      .cloned()
      .collect()
  }

  #[allow(unused)]
  fn combine_opt(self, other: Option<Vec<T>>) -> Vec<T> {
    [self.unwrap_or_default(), other.unwrap_or_default()]
      .concat()
      .iter()
      .unique()
      .cloned()
      .collect()
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn combine_empty_vecs() {
    assert_eq!(
      Vec::<i32>::new().combine(Vec::<i32>::new()),
      Vec::<i32>::new()
    );
  }

  #[test]
  fn combine_first_empty_vec() {
    assert_eq!(Vec::<i32>::new().combine(vec![1, 2, 3]), vec![1, 2, 3]);
  }

  #[test]
  fn combine_second_empty_vec() {
    assert_eq!(vec![1, 2, 3].combine(Vec::<i32>::new()), vec![1, 2, 3]);
  }

  #[test]
  fn combine_with_duplicates() {
    assert_eq!(
      vec![1, 2, 3, 4].combine(vec![3, 4, 5, 6]),
      vec![1, 2, 3, 4, 5, 6]
    );
  }

  #[test]
  fn combine_without_duplicates() {
    assert_eq!(vec![1, 2, 3].combine(vec![4, 5, 6]), vec![1, 2, 3, 4, 5, 6]);
  }

  #[test]
  fn combine_opt_first_empty() {
    assert_eq!(None::<Vec<i32>>.combine(vec![1, 2, 3]), vec![1, 2, 3]);
  }

  #[test]
  fn combine_opt_second_empty() {
    assert_eq!(
      Some(vec![1, 2, 3]).combine(Vec::<i32>::new()),
      vec![1, 2, 3]
    );
  }

  #[test]
  fn combine_opt_both_empty() {
    assert_eq!(
      None::<Vec<i32>>.combine(Vec::<i32>::new()),
      Vec::<i32>::new()
    );
  }

  #[test]
  fn combine_opt_with_duplicates() {
    assert_eq!(
      Some(vec![1, 2, 3, 4]).combine(vec![3, 4, 5, 6]),
      vec![1, 2, 3, 4, 5, 6]
    );
  }

  #[test]
  fn combine_opt_without_duplicates() {
    assert_eq!(
      Some(vec![1, 2, 3]).combine(vec![4, 5, 6]),
      vec![1, 2, 3, 4, 5, 6]
    );
  }

  #[test]
  fn combine_opt_both_empty_vecs() {
    assert_eq!(
      Vec::<i32>::new().combine_opt(Some(Vec::<i32>::new())),
      Vec::<i32>::new()
    );
  }

  #[test]
  fn combine_opt_first_empty_vec() {
    assert_eq!(
      Vec::<i32>::new().combine_opt(Some(vec![1, 2, 3])),
      vec![1, 2, 3]
    );
  }

  #[test]
  fn combine_opt_second_empty_vec() {
    assert_eq!(
      vec![1, 2, 3].combine_opt(Some(Vec::<i32>::new())),
      vec![1, 2, 3]
    );
  }

  #[test]
  fn combine_opt_both_vecs_with_duplicates() {
    assert_eq!(
      vec![1, 2, 3].combine_opt(Some(vec![2, 3, 4, 5])),
      vec![1, 2, 3, 4, 5]
    );
  }
}
