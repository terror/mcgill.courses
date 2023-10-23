use super::*;

#[derive(Deserialize)]
pub(crate) struct GetCoursesParams {
  limit: Option<i64>,
  offset: Option<u64>,
}

pub(crate) async fn get_courses(
  Query(params): Query<GetCoursesParams>,
  AppState(state): AppState<State>,
  filter: Json<CourseFilter>,
) -> Result<impl IntoResponse> {
  Ok(Json(
    state
      .db
      .courses(params.limit, params.offset, Some(filter.0))
      .await?,
  ))
}

#[derive(Debug, Deserialize)]
pub(crate) struct GetCourseParams {
  with_reviews: Option<bool>,
}

pub(crate) async fn get_course_by_id(
  Path(id): Path<String>,
  Query(params): Query<GetCourseParams>,
  AppState(state): AppState<State>,
) -> Result<impl IntoResponse> {
  Ok(match state.db.find_course_by_id(&id).await? {
    Some(course) => {
      let mut reviews = params
        .with_reviews
        .unwrap_or(false)
        .then_some(state.db.find_reviews_by_course_id(&id).await?);

      if let Some(ref mut reviews) = reviews {
        reviews.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));

        return Ok((
          StatusCode::OK,
          Json(Some(json!({ "course": course, "reviews": reviews }))),
        ));
      }

      (StatusCode::OK, Json(Some(json!(course))))
    }
    None => (StatusCode::NOT_FOUND, Json(None)),
  })
}
