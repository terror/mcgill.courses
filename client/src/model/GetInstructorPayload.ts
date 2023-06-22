import { Instructor } from './Instructor';
import { Review } from './Review';

export type GetInstructorPayload = {
  instructor: Instructor;
  reviews: Review[];
};
