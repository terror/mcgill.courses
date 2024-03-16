import { Interaction } from './Interaction';

export type GetCourseReviewsInteractionPayload = {
  course_id: string;
  interactions: Interaction[];
};
