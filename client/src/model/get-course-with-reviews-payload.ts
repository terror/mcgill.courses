import type { Review } from '../lib/types';
import type { Course } from './course';

export type GetCourseWithReviewsPayload = {
  course: Course;
  reviews: Review[];
};
