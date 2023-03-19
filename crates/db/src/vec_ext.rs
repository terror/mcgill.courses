use super::*;

pub(crate) trait VecExt<T> {
  fn combine(self, other: Vec<T>) -> Vec<T>;
}

impl<T: Eq + Hash + Clone> VecExt<T> for Vec<T> {
  fn combine(self, other: Vec<T>) -> Vec<T> {
    [self, other].concat().iter().unique().cloned().collect()
  }
}
