import { Review } from '../lib/types';

export type GetReviewsPayload = {
  reviews: Review[];
  uniqueUserCount?: number;
};
