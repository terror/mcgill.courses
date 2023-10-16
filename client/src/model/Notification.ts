import type { Review } from './Review';

export type Notification = {
  review: Review;
  seen: boolean;
  userId: string;
};
