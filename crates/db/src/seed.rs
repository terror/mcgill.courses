use super::*;

#[derive(Debug)]
pub(crate) enum Seed {
  Courses((PathBuf, Vec<Course>)),
  Reviews((PathBuf, Vec<Review>)),
  Unknown(PathBuf),
}

impl Seed {
  pub(crate) fn from_path(path: &PathBuf) -> Result<Vec<Self>> {
    Ok(if path.is_file() {
      vec![Self::from_content(path.clone(), fs::read_to_string(path)?)]
    } else {
      fs::read_dir(path)?
        .map(|path| -> Result<PathBuf> { Ok(path?.path()) })
        .collect::<Result<Vec<_>>>()?
        .into_iter()
        .sorted()
        .map(|path| -> Result<Self> {
          Ok(Self::from_content(path.clone(), fs::read_to_string(path)?))
        })
        .collect::<Result<Vec<_>>>()?
    })
  }

  fn from_content(path: PathBuf, content: String) -> Self {
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
