import { Course } from './Course';
import { Review } from './Review';

export type GetCoursePaylod = {
  course: Course;
  reviews: Review[];
};
