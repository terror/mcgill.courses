use super::*;

#[derive(Debug, Deserialize)]
pub(crate) struct GetUserInteractionParams {
  pub(crate) course_id: String,
  pub(crate) user_id: String,
  pub(crate) referrer: String,
}

#[derive(Debug, Deserialize, Serialize, PartialEq)]
pub(crate) struct GetUserInteractionPayload {
  pub(crate) kind: Option<InteractionKind>,
}

pub(crate) async fn get_user_interaction(
  params: Query<GetUserInteractionParams>,
  AppState(db): AppState<Arc<Db>>,
) -> Result<impl IntoResponse> {
  let kind = db
    .user_interaction_for_review(
      &params.course_id,
      &params.user_id,
      &params.referrer,
    )
    .await?;

  Ok(Json(GetUserInteractionPayload { kind }))
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
pub(crate) struct DeleteInteractionBody {
  course_id: String,
  user_id: String,
  referrer: String,
}

pub(crate) async fn delete_interaction(
  AppState(db): AppState<Arc<Db>>,
  _user: User,
  body: Json<DeleteInteractionBody>,
) -> Result<impl IntoResponse> {
  info!(
    "Removing interaction for review {}/{}...",
    body.course_id, body.user_id
  );

  db.delete_interaction(&body.course_id, &body.user_id, &body.referrer)
    .await?;

  Ok(())
}
