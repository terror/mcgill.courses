use super::*;

#[derive(Deserialize)]
pub(crate) struct GetCoursesParams {
  limit: Option<i64>,
  offset: Option<u64>,
}

#[derive(Debug, Deserialize)]
pub(crate) struct GetCoursesBody {
  subjects: Option<Vec<String>>,
  levels: Option<Vec<String>>,
  terms: Option<Vec<String>>,
  min_reviews: Option<u64>,
}

pub(crate) async fn get_courses(
  Query(params): Query<GetCoursesParams>,
  AppState(state): AppState<State>,
  filter: Json<GetCoursesBody>,
) -> Result<impl IntoResponse> {
  info!("{:?}", filter);

  Ok(Json(
    state
      .db
      .courses(
        params.limit,
        params.offset,
        filter.0.subjects,
        filter.0.levels,
        filter.0.terms,
        filter.0.min_reviews,
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
