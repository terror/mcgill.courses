use super::*;

#[derive(Debug)]
pub(crate) enum Seed {
  Courses(Vec<Course>),
  Reviews(Vec<Review>),
  Unknown,
}

impl From<String> for Seed {
  fn from(content: String) -> Self {
    match (
      serde_json::from_str::<Vec<Course>>(&content).ok(),
      serde_json::from_str::<Vec<Review>>(&content).ok(),
    ) {
      (Some(courses), _) => Self::Courses(courses),
      (_, Some(reviews)) => Self::Reviews(reviews),
      _ => Self::Unknown,
    }
  }
}

impl Seed {
  pub(crate) fn from_path(path: PathBuf) -> Result<Vec<Self>> {
    if path.is_file() {
      Ok(vec![Self::from(fs::read_to_string(path)?)])
    } else {
      let mut paths = fs::read_dir(path)?
        .map(|path| -> Result<PathBuf> { Ok(path?.path()) })
        .collect::<Result<Vec<_>>>()?;

      paths.sort();

      Ok(
        paths
          .into_iter()
          .map(|path| -> Result<Self> {
            Ok(Self::from(fs::read_to_string(path)?))
          })
          .collect::<Result<Vec<_>>>()?,
      )
    }
  }
}
