use super::*;

#[async_trait]
pub(crate) trait Object {
  async fn get(&self, bucket: &str, key: &str) -> Result<Option<Vec<u8>>>;
  async fn put(
    &self,
    bucket: &str,
    key: &str,
    value: Vec<u8>,
  ) -> Result<PutObjectOutput>;
}

#[async_trait]
impl Object for S3Client {
  async fn get(&self, bucket: &str, key: &str) -> Result<Option<Vec<u8>>> {
    let response = self
      .get_object(GetObjectRequest {
        bucket: bucket.into(),
        key: key.into(),
        ..Default::default()
      })
      .await;

    Ok(match response {
      Ok(response) => match response.body {
        Some(stream) => Some(stream.map_ok(|b| b.to_vec()).try_concat().await?),
        None => None,
      },
      Err(_) => None,
    })
  }

  async fn put(
    &self,
    bucket: &str,
    key: &str,
    value: Vec<u8>,
  ) -> Result<PutObjectOutput> {
    Ok(
      self
        .put_object(PutObjectRequest {
          bucket: bucket.into(),
          key: key.into(),
          body: Some(value.into()),
          ..Default::default()
        })
        .await?,
    )
  }
}
