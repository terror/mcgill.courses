use super::*;

pub(crate) async fn get_notifications(
  user: User,
  AppState(db): AppState<Arc<Db>>,
) -> Result<impl IntoResponse> {
  Ok(Json(db.get_notifications(&user.id()).await?))
}
