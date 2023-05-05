use super::*;

#[derive(Debug, Deserialize)]
pub(crate) struct GetReviewsParams {
  pub(crate) course_id: Option<String>,
  pub(crate) user_id: Option<String>,
}

pub(crate) async fn get_reviews(
  params: Query<GetReviewsParams>,
  AppState(db): AppState<Arc<Db>>,
) -> Result<impl IntoResponse> {
  let mut reviews = vec![];

  if let Some(course_id) = &params.course_id {
    reviews.extend(db.find_reviews_by_course_id(course_id).await?)
  }

  if let Some(user_id) = &params.user_id {
    reviews.extend(db.find_reviews_by_user_id(user_id).await?)
  }

  Ok(Json(reviews.into_iter().collect::<HashSet<Review>>()))
}

pub(crate) async fn get_review(
  user: User,
  Path(id): Path<String>,
  AppState(db): AppState<Arc<Db>>,
) -> Result<impl IntoResponse> {
  Ok(Json(db.find_review(&id, &user.id()).await?))
}

#[derive(Debug, Deserialize)]
pub(crate) struct AddOrUpdateReviewBody {
  pub(crate) content: String,
  pub(crate) course_id: String,
  pub(crate) instructor: String,
  pub(crate) rating: u32,
}

pub(crate) async fn add_review(
  AppState(db): AppState<Arc<Db>>,
  user: User,
  body: Json<AddOrUpdateReviewBody>,
) -> Result<impl IntoResponse> {
  let AddOrUpdateReviewBody {
    content,
    course_id,
    instructor,
    rating,
  } = body.0;

  log::trace!("Adding review to database...");

  db.add_review(Review {
    content,
    course_id,
    instructor,
    rating,
    timestamp: Utc::now().into(),
    user_id: user.id(),
  })
  .await?;

  Ok(())
}

pub(crate) async fn update_review(
  AppState(db): AppState<Arc<Db>>,
  user: User,
  body: Json<AddOrUpdateReviewBody>,
) -> Result<impl IntoResponse> {
  let AddOrUpdateReviewBody {
    content,
    course_id,
    instructor,
    rating,
  } = body.0;

  log::trace!("Updating review...");

  db.update_review(Review {
    content,
    course_id,
    instructor,
    rating,
    timestamp: Utc::now().into(),
    user_id: user.id(),
  })
  .await?;

  Ok(())
}

#[derive(Debug, Deserialize)]
pub(crate) struct DeleteReviewBody {
  course_id: String,
}

pub(crate) async fn delete_review(
  AppState(db): AppState<Arc<Db>>,
  user: User,
  body: Json<DeleteReviewBody>,
) -> Result<impl IntoResponse> {
  log::trace!("Deleting review from the database...");

  db.delete_review(&body.course_id, &user.id()).await?;

  Ok(())
}
