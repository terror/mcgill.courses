import type { Review } from '../lib/types';
import type { Course } from './Course';

export type GetCourseWithReviewsPayload = {
  course: Course;
  reviews: Review[];
};
