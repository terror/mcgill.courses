use super::*;

pub(crate) async fn get_courses(
  AppState(state): AppState<State>,
) -> Result<impl IntoResponse> {
  Ok(Json(state.db.courses().await?))
}

pub(crate) async fn get_course_by_id(
  Path(id): Path<String>,
  AppState(state): AppState<State>,
) -> Result<impl IntoResponse> {
  Ok(match state.db.find_course_by_id(&id).await? {
    Some(course) => (StatusCode::OK, Json(Some(course))),
    None => (StatusCode::NOT_FOUND, Json(None)),
  })
}
