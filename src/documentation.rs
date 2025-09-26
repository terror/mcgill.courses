use super::*;

#[derive(OpenApi)]
#[openapi(
  info(
    title = "mcgill.courses",
    description = "A course search and review platform for McGill University."
  ),
  paths(
    courses::get_courses,
    courses::get_course_by_id
  ),
  components(
    schemas(
      courses::GetCourseByIdParams,
      courses::GetCourseByIdPayload,
      courses::GetCoursesParams,
      courses::GetCoursesPayload
    )
  ),
  tags(
    (name = "courses", description = "All course related endpoints"),
  )
)]
pub struct Documentation;
