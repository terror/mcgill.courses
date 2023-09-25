use super::*;

pub(crate) async fn get_notifications(
  user: User,
  AppState(db): AppState<Arc<Db>>,
) -> Result<impl IntoResponse> {
  let mut notifications = db.get_notifications(&user.id()).await?;
  notifications.sort_by(|a, b| b.review.timestamp.cmp(&a.review.timestamp));
  Ok(Json(notifications))
}

#[derive(Debug, Serialize, Deserialize)]
pub(crate) struct DeleteNotificationbody {
  course_id: String,
}

pub(crate) async fn delete_notification(
  user: User,
  AppState(db): AppState<Arc<Db>>,
  body: Json<DeleteNotificationbody>,
) -> Result<impl IntoResponse> {
  db.delete_notification(&user.id(), &body.course_id).await?;
  Ok(())
}
