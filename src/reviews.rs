use super::*;

#[derive(Debug, Deserialize)]
pub(crate) struct GetReviewsParams {
  pub(crate) course_id: Option<String>,
  pub(crate) user_id: Option<String>,
}

pub(crate) async fn get_reviews(
  params: Query<GetReviewsParams>,
  AppState(state): AppState<State>,
) -> Result<impl IntoResponse> {
  let mut reviews = vec![];

  if let Some(course_id) = &params.course_id {
    reviews.extend(state.db.find_reviews_by_course_id(course_id).await?)
  }

  if let Some(user_id) = &params.user_id {
    reviews.extend(state.db.find_reviews_by_user_id(user_id).await?)
  }

  Ok(Json(reviews.into_iter().collect::<HashSet<Review>>()))
}

#[derive(Debug, Deserialize)]
pub(crate) struct ReviewBody {
  pub(crate) content: String,
  pub(crate) course_id: String,
}

pub(crate) async fn add_review(
  AppState(state): AppState<State>,
  user: User,
  body: Json<ReviewBody>,
) -> Result<impl IntoResponse> {
  let ReviewBody { content, course_id } = body.0;

  log::trace!("Adding review to database...");

  state
    .db
    .add_review(Review {
      content,
      course_id,
      user_id: user.id(),
    })
    .await?;

  Ok(())
}

pub(crate) async fn update_review(
  AppState(state): AppState<State>,
  user: User,
  body: Json<ReviewBody>,
) -> Result<impl IntoResponse> {
  let ReviewBody { content, course_id } = body.0;

  log::trace!("Updating review...");

  state
    .db
    .update_review(Review {
      content,
      course_id,
      user_id: user.id(),
    })
    .await?;

  Ok(())
}

pub(crate) async fn delete_review(
  AppState(state): AppState<State>,
  user: User,
  body: Json<ReviewBody>,
) -> Result<impl IntoResponse> {
  let ReviewBody { content, course_id } = body.0;

  log::trace!("Deleting review from database...");

  state
    .db
    .delete_review(Review {
      content,
      course_id,
      user_id: user.id(),
    })
    .await?;

  Ok(())
}
