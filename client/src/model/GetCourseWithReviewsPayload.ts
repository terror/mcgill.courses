import type { Course } from './Course';
import type { Review } from './Review';

export type GetCourseWithReviewsPayload = {
  course: Course;
  reviews: Review[];
};
