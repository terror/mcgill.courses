import { Review } from './Review';

export type GetReviewsPayload = {
  reviews: Review[];
  uniqueUserCount: number;
};
