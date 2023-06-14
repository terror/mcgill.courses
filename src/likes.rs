use super::*;

#[derive(Debug, Deserialize)]
pub(crate) struct GetLikesParams {
  pub(crate) course_id: String,
  pub(crate) user_id: String,
}

pub(crate) async fn get_likes(
  params: Query<GetLikesParams>,
  AppState(db): AppState<Arc<Db>>,
  _user: User,
) -> Result<impl IntoResponse> {
  Ok(Json(
    db.likes_for_review(&params.course_id, &params.user_id)
      .await?,
  ))
}

#[derive(Debug, Deserialize)]
pub(crate) struct AddOrRemoveLikeBody {
  course_id: String,
  user_id: String,
}

pub(crate) async fn add_like(
  AppState(db): AppState<Arc<Db>>,
  _user: User,
  body: Json<AddOrRemoveLikeBody>,
) -> Result<impl IntoResponse> {
  info!(
    "Adding like for review {}/{}...",
    body.course_id, body.user_id
  );

  db.add_like(Like {
    course_id: body.course_id.clone(),
    user_id: body.user_id.clone(),
  })
  .await?;

  Ok(())
}

pub(crate) async fn remove_like(
  AppState(db): AppState<Arc<Db>>,
  _user: User,
  body: Json<AddOrRemoveLikeBody>,
) -> Result<impl IntoResponse> {
  info!(
    "Removing like for review {}/{}...",
    body.course_id, body.user_id
  );

  db.remove_like(Like {
    course_id: body.course_id.clone(),
    user_id: body.user_id.clone(),
  })
  .await?;

  Ok(())
}
