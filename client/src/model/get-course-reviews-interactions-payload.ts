import { Interaction } from '../lib/types';

export type GetCourseReviewsInteractionPayload = {
  course_id: string;
  interactions: Interaction[];
};
