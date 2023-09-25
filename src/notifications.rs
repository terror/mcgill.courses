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
pub(crate) struct UpdateNotificationbody {
  course_id: String,
  creator_id: String,
  seen: bool,
}

pub(crate) async fn update_notification(
  user: User,
  AppState(db): AppState<Arc<Db>>,
  body: Json<UpdateNotificationbody>,
) -> Result<impl IntoResponse> {
  db.update_notification(
    &user.id(),
    &body.course_id,
    &body.creator_id,
    body.seen,
  )
  .await?;
  Ok(())
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
