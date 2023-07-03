use super::*;

#[derive(Deserialize)]
pub(crate) struct GetCoursesParams {
  limit: Option<i64>,
  offset: Option<u64>,
}

#[derive(Deserialize)]
pub(crate) struct GetCoursesBody {
  subjects: Option<Vec<String>>,
  levels: Option<Vec<String>>,
  terms: Option<Vec<String>>,
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
        filter.0.subjects,
        filter.0.levels,
        filter.0.terms,
      )
      .await?,
  ))
}

#[derive(Debug, Deserialize, Serialize)]
pub(crate) struct GetCoursePayload {
  pub(crate) course: Course,
  pub(crate) reviews: Vec<Review>,
}

pub(crate) async fn get_course_by_id(
  Path(id): Path<String>,
  AppState(state): AppState<State>,
) -> Result<impl IntoResponse> {
  Ok(match state.db.find_course_by_id(&id).await? {
    Some(course) => {
      let mut reviews = state.db.find_reviews_by_course_id(&id).await?;

      reviews.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));

      (
        StatusCode::OK,
        Json(Some(GetCoursePayload { course, reviews })),
      )
    }
    None => (StatusCode::NOT_FOUND, Json(None)),
  })
}
