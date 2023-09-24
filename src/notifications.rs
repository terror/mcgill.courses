use super::*;

pub(crate) async fn get_notifications(
  user: User,
  AppState(db): AppState<Arc<Db>>,
) -> Result<impl IntoResponse> {
  let mut notifications = db.get_notifications(&user.id()).await?;
  notifications.sort_by(|a, b| b.review.timestamp.cmp(&a.review.timestamp));
  Ok(Json(notifications))
}
