use super::*;

pub(crate) trait Select<'a> {
  fn select_single(&self, selector: &str) -> Result<ElementRef<'a>>;
  fn try_select_single(&self, selectors: Vec<&str>) -> Result<ElementRef<'a>>;
  fn select_optional(&self, selector: &str) -> Result<Option<ElementRef<'a>>>;
  fn select_many(&self, selector: &str) -> Result<Vec<ElementRef<'a>>>;
}

impl<'a> Select<'a> for ElementRef<'a> {
  fn select_single(&self, selector: &str) -> Result<ElementRef<'a>> {
    self
      .select(
        &Selector::parse(selector)
          .map_err(|error| anyhow!("Failed to parse selector: {:?}", error))?,
      )
      .next()
      .ok_or_else(|| anyhow!("Failed to select element"))
  }

  fn try_select_single(&self, selectors: Vec<&str>) -> Result<ElementRef<'a>> {
    selectors
      .iter()
      .map(|selector| self.select_single(selector))
      .find(|result| result.is_ok())
      .unwrap_or_else(|| {
        Err(anyhow!(
          "Failed to select element with selectors: {:?}",
          selectors
        ))
      })
  }

  fn select_optional(&self, selector: &str) -> Result<Option<ElementRef<'a>>> {
    Ok(
      self
        .select(
          &Selector::parse(selector).map_err(|error| {
            anyhow!("Failed to parse selector: {:?}", error)
          })?,
        )
        .next(),
    )
  }

  fn select_many(&self, selector: &str) -> Result<Vec<ElementRef<'a>>> {
    Ok(
      self
        .select(
          &Selector::parse(selector).map_err(|error| {
            anyhow!("Failed to parse selector: {:?}", error)
          })?,
        )
        .collect(),
    )
  }
}
