use super::*;

#[derive(Deserialize, ToSchema)]
pub(crate) struct GetCoursesParams {
  /// Maximum number of courses to return.
  limit: Option<i64>,
  /// Number of courses to skip.
  offset: Option<u64>,
  /// Whether to include the total course count in the response.
  with_course_count: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub(crate) struct GetCoursesPayload {
  /// List of courses matching the query.
  pub(crate) courses: Vec<Course>,
  /// Total number of courses available (if requested).
  pub(crate) course_count: Option<u64>,
}

#[utoipa::path(
  post,
  path = "/courses",
  responses(
    (status = 200, description = "Get information about many courses", body = GetCoursesPayload)
  )
)]
pub(crate) async fn get_courses(
  Query(params): Query<GetCoursesParams>,
  AppState(db): AppState<Arc<Db>>,
  Json(filter): Json<CourseFilter>,
) -> Result<impl IntoResponse> {
  Ok(Json(GetCoursesPayload {
    courses: db
      .courses(params.limit, params.offset, Some(filter))
      .await?,
    course_count: if params.with_course_count.unwrap_or(false) {
      Some(db.course_count().await?)
    } else {
      None
    },
  }))
}

#[derive(Debug, Deserialize, ToSchema)]
pub(crate) struct GetCourseByIdParams {
  /// Whether to include reviews in the response.
  with_reviews: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub(crate) struct GetCourseByIdPayload {
  /// The course information.
  pub(crate) course: Course,
  /// Reviews for the course (sorted by timestamp, newest first)
  pub(crate) reviews: Vec<Review>,
}

#[utoipa::path(
  get,
  path = "/courses/{id}",
  responses(
    (status = 200, description = "Get information about a specific course", body = GetCourseByIdPayload)
  )
)]
pub(crate) async fn get_course_by_id(
  Path(id): Path<String>,
  Query(params): Query<GetCourseByIdParams>,
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
          Json(Some(GetCourseByIdPayload {
            course,
            reviews: reviews.to_vec(),
          })),
        ));
      }

      (
        StatusCode::OK,
        Json(Some(GetCourseByIdPayload {
          course,
          reviews: vec![],
        })),
      )
    }
    None => (StatusCode::NOT_FOUND, Json(None)),
  })
}
