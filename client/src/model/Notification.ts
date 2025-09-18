import type { Review } from '../lib/types';

export type Notification = {
  review: Review;
  seen: boolean;
  userId: string;
};
