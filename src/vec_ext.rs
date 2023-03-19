use super::*;

pub(crate) trait VecExt<T> {
  fn combine(self, other: Vec<T>) -> Vec<T>;

  fn into_option(self) -> Option<Self>
  where
    Self: Sized;
}

impl<T: Eq + Hash + Clone> VecExt<T> for Vec<T> {
  fn combine(self, other: Vec<T>) -> Vec<T> {
    [self, other].concat().iter().unique().cloned().collect()
  }

  fn into_option(self) -> Option<Self> {
    match self.is_empty() {
      true => None,
      _ => Some(self),
    }
  }
}
