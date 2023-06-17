use super::*;

#[derive(Debug, Deserialize)]
pub(crate) struct GetInteractionsParams {
  pub(crate) course_id: String,
  pub(crate) user_id: String,
  pub(crate) referrer: Option<String>,
}

#[derive(Debug, Deserialize, Serialize, PartialEq)]
pub(crate) struct GetInteractionsPayload {
  pub(crate) kind: Option<InteractionKind>,
  pub(crate) likes: i64,
}

pub(crate) async fn get_interactions(
  params: Query<GetInteractionsParams>,
  AppState(db): AppState<Arc<Db>>,
) -> Result<impl IntoResponse> {
  let interactions = db
    .interactions_for_review(&params.course_id, &params.user_id)
    .await?;

  let likes = interactions
    .iter()
    .filter(|i| i.kind == InteractionKind::Like)
    .count() as i64;

  let dislikes = interactions
    .iter()
    .filter(|i| i.kind == InteractionKind::Dislike)
    .count() as i64;

  let kind = match params.referrer.clone() {
    Some(referrer) => interactions
      .into_iter()
      .find(|i| i.referrer == referrer)
      .map(|i| i.kind),
    None => None,
  };

  Ok(Json(GetInteractionsPayload {
    kind,
    likes: likes - dislikes,
  }))
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
