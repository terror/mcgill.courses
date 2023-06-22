use super::*;

#[derive(Debug, Deserialize, Serialize)]
pub(crate) struct GetInstructorPayload {
  pub(crate) instructor: Instructor,
  pub(crate) reviews: Vec<Review>,
}

pub(crate) async fn get_instructor(
  Path(name): Path<String>,
  AppState(db): AppState<Arc<Db>>,
) -> Result<impl IntoResponse> {
  info!("Fetching instructor for name: {}", name);

  let instructor = db.find_instructor_by_name(&name).await?;

  if let Some(instructor) = instructor {
    return Ok((
      StatusCode::OK,
      Json(Some(GetInstructorPayload {
        instructor,
        reviews: db.find_reviews_by_instructor_name(&name).await?,
      })),
    ));
  }

  Ok((StatusCode::NOT_FOUND, Json(None)))
}
