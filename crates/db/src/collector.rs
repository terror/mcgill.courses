use super::*;

#[derive(Debug)]
pub(crate) struct Collector<'a> {
  source: &'a PathBuf,
}

impl<'a> Collector<'a> {
  pub(crate) fn new(source: &'a PathBuf) -> Self {
    Self { source }
  }

  pub(crate) fn run(self) -> Result<Vec<Seed>> {
    Ok(if self.source.is_file() {
      vec![Seed::from_content(
        self.source.clone(),
        fs::read_to_string(self.source)?,
      )]
    } else {
      fs::read_dir(self.source)?
        .map(|path| -> Result<PathBuf> { Ok(path?.path()) })
        .collect::<Result<Vec<_>>>()?
        .into_iter()
        .sorted()
        .map(|path| -> Result<Seed> {
          Ok(Seed::from_content(path.clone(), fs::read_to_string(path)?))
        })
        .collect::<Result<Vec<_>>>()?
    })
  }
}
