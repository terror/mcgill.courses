pub(crate) trait VecExt<T> {
  fn into_option(self) -> Option<Self>
  where
    Self: Sized;
}

impl<T> VecExt<T> for Vec<T> {
  fn into_option(self) -> Option<Self> {
    if self.is_empty() {
      None
    } else {
      Some(self)
    }
  }
}
