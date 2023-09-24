use super::*;

#[derive(Deserialize)]
pub(crate) struct GetSubscriptionParams {
  course_id: Option<String>,
}

pub(crate) async fn get_subscription(
  user: User,
  AppState(db): AppState<Arc<Db>>,
  params: Query<GetSubscriptionParams>,
) -> Result<impl IntoResponse> {
  Ok(Json(match &params.course_id {
    Some(course_id) => {
      json!(db.get_subscription(&user.id(), course_id).await?)
    }
    None => json!(db.get_subscriptions(&user.id()).await?),
  }))
}

#[derive(Deserialize)]
pub(crate) struct AddOrDeleteSubscriptionBody {
  course_id: String,
}

pub(crate) async fn add_subscription(
  user: User,
  AppState(db): AppState<Arc<Db>>,
  body: Json<AddOrDeleteSubscriptionBody>,
) -> Result<impl IntoResponse> {
  let user_id = user.id();

  info!(
    "Adding subscription for user {} to course {}",
    &user_id, body.course_id
  );

  Ok(Json(
    db.add_subscription(Subscription {
      user_id,
      course_id: body.course_id.clone(),
    })
    .await?,
  ))
}

pub(crate) async fn remove_subscription(
  user: User,
  AppState(db): AppState<Arc<Db>>,
  body: Json<AddOrDeleteSubscriptionBody>,
) -> Result<impl IntoResponse> {
  let user_id = user.id();

  info!(
    "Removing subscription for user {} to course {}",
    &user_id, body.course_id
  );

  Ok(Json(
    db.remove_subscription(Subscription {
      user_id,
      course_id: body.course_id.clone(),
    })
    .await?,
  ))
}
