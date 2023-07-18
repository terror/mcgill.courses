import { Course } from './Course';
import { Review } from './Review';

export type GetCourseWithReviewsPayload = {
  course: Course;
  reviews: Review[];
};
