use super::*;

pub(crate) async fn get_instructor(
  Path(name): Path<String>,
  AppState(db): AppState<Arc<Db>>,
) -> Result<impl IntoResponse> {
  Ok(Json(db.find_instructor_by_name(&name).await?))
}
