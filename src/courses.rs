use super::*;

#[derive(Deserialize)]
pub(crate) struct GetCoursesParams {
  limit: Option<i64>,
  offset: Option<u64>,
}

#[derive(Deserialize)]
pub(crate) struct GetCoursesBody {
  codes: Option<Vec<String>>,
  level: Option<Vec<String>>,
  name: Option<Vec<String>>,
}

pub(crate) async fn get_courses(
  Query(params): Query<GetCoursesParams>,
  AppState(state): AppState<State>,
  filter: Json<GetCoursesBody>,
) -> Result<impl IntoResponse> {
  Ok(Json(
    state
      .db
      .courses(
        params.limit,
        params.offset,
        filter.0.codes,
        filter.0.level,
        filter.0.name,
      )
      .await?,
  ))
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
