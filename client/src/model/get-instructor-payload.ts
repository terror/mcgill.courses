import type { Instructor } from '../lib/types';
import type { Review } from '../lib/types';

export type GetInstructorPayload = {
  instructor?: Instructor;
  reviews: Review[];
};
