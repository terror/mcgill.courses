use super::*;

#[derive(Debug, Deserialize)]
pub(crate) struct GetInteractionsParams {
  pub(crate) course_id: String,
  pub(crate) user_id: String,
}

pub(crate) async fn get_interactions(
  params: Query<GetInteractionsParams>,
  AppState(db): AppState<Arc<Db>>,
  _user: User,
) -> Result<impl IntoResponse> {
  Ok(Json(
    db.interactions_for_review(&params.course_id, &params.user_id)
      .await?,
  ))
}

#[derive(Debug, Deserialize)]
pub(crate) struct AddInteractionBody {
  kind: InteractionKind,
  course_id: String,
  user_id: String,
  referrer: String,
}

pub(crate) async fn add_interaction(
  AppState(db): AppState<Arc<Db>>,
  _user: User,
  body: Json<AddInteractionBody>,
) -> Result<impl IntoResponse> {
  info!(
    "Adding interaction for review {}/{}...",
    body.course_id, body.user_id
  );

  db.add_interaction(Interaction {
    kind: body.kind.clone(),
    course_id: body.course_id.clone(),
    user_id: body.user_id.clone(),
    referrer: body.referrer.clone(),
  })
  .await?;

  Ok(())
}

#[derive(Debug, Deserialize)]
pub(crate) struct RemoveInteractionBody {
  course_id: String,
  user_id: String,
  referrer: String,
}

pub(crate) async fn remove_interaction(
  AppState(db): AppState<Arc<Db>>,
  _user: User,
  body: Json<RemoveInteractionBody>,
) -> Result<impl IntoResponse> {
  info!(
    "Removing interaction for review {}/{}...",
    body.course_id, body.user_id
  );

  db.remove_interaction(&body.course_id, &body.user_id, &body.referrer)
    .await?;

  Ok(())
}
