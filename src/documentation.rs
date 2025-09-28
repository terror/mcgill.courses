use super::*;

#[derive(OpenApi)]
#[openapi(
  info(
    title = "mcgill.courses",
    description = "A course search and review platform for McGill University."
  ),
  servers(
    (url = "/api")
  ),
  paths(
    courses::get_courses,
    courses::get_course_by_id,
    reviews::get_reviews,
    reviews::get_review,
    reviews::add_review,
    reviews::update_review,
    reviews::delete_review
  ),
  components(
    schemas(
      courses::GetCourseByIdParams,
      courses::GetCourseByIdPayload,
      courses::GetCoursesParams,
      courses::GetCoursesPayload,
      reviews::GetReviewsParams,
      reviews::GetReviewsPayload,
      reviews::AddOrUpdateReviewBody,
      reviews::DeleteReviewBody
    )
  ),
  tags(
    (name = "courses", description = "All course related endpoints."),
    (name = "reviews", description = "All review related endpoints."),
  )
)]
pub(crate) struct Documentation;
