use super::*;

struct MicrosoftOAuthSecurity;

impl Modify for MicrosoftOAuthSecurity {
  fn modify(&self, openapi: &mut utoipa::openapi::OpenApi) {
    let components = openapi.components.get_or_insert_with(Components::default);

    if components.security_schemes.contains_key("microsoftOAuth") {
      return;
    }

    components.add_security_scheme(
      "microsoftOAuth",
      SecurityScheme::OAuth2(OAuth2::new([Flow::AuthorizationCode(
        AuthorizationCode::new(
          "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
          "https://login.microsoftonline.com/common/oauth2/v2.0/token",
          Scopes::from_iter([
            ("openid", "Authenticate with Microsoft."),
            (
              "User.Read",
              "Read basic Microsoft user profile information.",
            ),
          ]),
        ),
      )])),
    );
  }
}

#[derive(OpenApi)]
#[openapi(
  info(
    title = "mcgill.courses",
    description = "A course search and review platform for McGill University."
  ),
  servers(
    (url = "/api")
  ),
  modifiers(&MicrosoftOAuthSecurity),
  paths(
    courses::get_courses,
    courses::get_course_by_id,
    notifications::get_notifications,
    notifications::update_notification,
    notifications::delete_notification,
    reviews::get_reviews,
    reviews::get_review,
    reviews::add_review,
    reviews::update_review,
    reviews::delete_review,
    subscriptions::get_subscription,
    subscriptions::add_subscription,
    subscriptions::delete_subscription,
    search::search
  ),
  components(
    schemas(
      courses::GetCourseByIdParams,
      courses::GetCourseByIdPayload,
      courses::GetCoursesParams,
      courses::GetCoursesPayload,
      notifications::DeleteNotificationBody,
      notifications::UpdateNotificationBody,
      reviews::AddOrUpdateReviewBody,
      reviews::DeleteReviewBody,
      reviews::GetReviewsParams,
      reviews::GetReviewsPayload,
      search::SearchParams,
      subscriptions::AddOrDeleteSubscriptionBody,
      subscriptions::GetSubscriptionParams,
      subscriptions::SubscriptionResponse,
    )
  ),
  tags(
    (name = "courses", description = "All course related endpoints."),
    (name = "notifications", description = "All notification related endpoints."),
    (name = "reviews", description = "All review related endpoints."),
    (name = "search", description = "All search related endpoints."),
    (name = "subscriptions", description = "All subscription related endpoints."),
  ),
)]
pub(crate) struct Documentation;
