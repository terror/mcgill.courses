import type { Instructor } from './Instructor';
import type { Review } from './Review';

export type GetInstructorPayload = {
  instructor?: Instructor;
  reviews: Review[];
};
