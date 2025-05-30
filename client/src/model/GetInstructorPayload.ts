import type { Instructor } from '../lib/types';
import type { Review } from './Review';

export type GetInstructorPayload = {
  instructor?: Instructor;
  reviews: Review[];
};
