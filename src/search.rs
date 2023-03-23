use super::*;

#[derive(Deserialize)]
pub(crate) struct SearchParams {
  pub(crate) query: String,
}

pub(crate) async fn search(
  Query(params): Query<SearchParams>,
  AppState(state): AppState<State>,
) -> Result<impl IntoResponse> {
  Ok(Json(state.db.search(&params.query).await?))
}
