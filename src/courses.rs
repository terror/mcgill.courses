use super::*;

pub(crate) async fn courses(
  AppState(state): AppState<State>,
) -> Result<impl IntoResponse> {
  Ok(Json(state.db.courses().await?))
}
