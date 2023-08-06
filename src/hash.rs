use super::*;

pub(crate) trait Hash {
  fn hash(&self) -> Result<Vec<u8>>;
}

impl Hash for PathBuf {
  fn hash(&self) -> Result<Vec<u8>> {
    let mut hasher = Sha256::new();

    match (self.is_dir(), self.is_file()) {
      (true, false) => {
        for entry in WalkDir::new(self)
          .into_iter()
          .filter_map(|e| e.ok())
          .filter(|e| e.file_type().is_file())
        {
          let mut file = File::open(entry.path())?;
          let mut buffer = Vec::new();
          file.read_to_end(&mut buffer)?;
          hasher.update(&buffer);
        }
      }
      (false, true) => {
        let mut file = File::open(self)?;
        let mut buffer = Vec::new();
        file.read_to_end(&mut buffer)?;
        hasher.update(&buffer);
      }
      _ => {
        return Err(Error(anyhow!(
          "{} is neither a file nor a directory",
          self.display()
        )))
      }
    }

    Ok(hasher.finalize().to_vec())
  }
}
