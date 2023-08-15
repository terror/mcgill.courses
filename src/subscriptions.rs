use model::Subscription;

use super::*;

#[derive(Deserialize)]
pub(crate) struct AddSubscriptionBody {
  course_id: String,
}

pub(crate) async fn add_subscription(
  user: User,
  AppState(db): AppState<Arc<Db>>,
  body: Json<AddSubscriptionBody>,
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
