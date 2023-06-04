use super::*;

#[derive(Debug)]
pub(crate) enum Seed {
  Courses((PathBuf, Vec<Course>)),
  Reviews((PathBuf, Vec<Review>)),
  Unknown(PathBuf),
}

impl Seed {
  pub(crate) fn from_content(path: PathBuf, content: String) -> Self {
    match (
      serde_json::from_str::<Vec<Course>>(&content).ok(),
      serde_json::from_str::<Vec<Review>>(&content).ok(),
    ) {
      (Some(courses), _) => Self::Courses((path, courses)),
      (_, Some(reviews)) => Self::Reviews((path, reviews)),
      _ => Self::Unknown(path),
    }
  }
}
