use super::*;

#[derive(Deserialize, ToSchema)]
pub(crate) struct SearchParams {
  /// Search query string to match against courses and instructors.
  pub(crate) query: String,
}

#[utoipa::path(
  get,
  path = "/search",
  description = "Search for courses and instructors matching a query.",
  params(("query" = String, Query, description = "The search query string.")),
  responses(
    (status = StatusCode::OK, description = "Search results for courses and instructors.", body = SearchResults),
    (status = StatusCode::INTERNAL_SERVER_ERROR, description = "Internal server error.", body = String)
  )
)]
pub(crate) async fn search(
  Query(params): Query<SearchParams>,
  AppState(state): AppState<State>,
) -> Result<impl IntoResponse> {
  Ok(Json(state.db.search(&params.query).await?))
}
