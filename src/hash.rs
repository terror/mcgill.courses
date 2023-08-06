use super::*;

pub(crate) trait Hash {
  fn hash(&self) -> Result<Vec<u8>>;
}

impl Hash for PathBuf {
  fn hash(&self) -> Result<Vec<u8>> {
    let mut hasher = Sha256::new();

    let read = |path: &PathBuf| -> Result<Vec<u8>> {
      let mut file = File::open(path)?;
      let mut buffer = Vec::new();
      file.read_to_end(&mut buffer)?;
      Ok(buffer)
    };

    match (self.is_dir(), self.is_file()) {
      (true, false) => {
        for entry in WalkDir::new(self)
          .into_iter()
          .filter_map(|e| e.ok())
          .filter(|e| e.file_type().is_file())
        {
          hasher.update(read(&entry.path().to_path_buf())?);
        }
      }
      (false, true) => {
        hasher.update(read(self)?);
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
