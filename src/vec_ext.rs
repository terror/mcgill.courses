use super::*;

pub(crate) trait VecExt<T> {
  fn into_option(self) -> Option<Self>
  where
    Self: Sized;
}

impl<T> VecExt<T> for Vec<T> {
  fn into_option(self) -> Option<Self> {
    match self.is_empty() {
      true => None,
      _ => Some(self),
    }
  }
}
