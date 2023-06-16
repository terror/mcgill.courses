export type InteractionKind = 'like' | 'dislike';

export type Interaction = {
  kind: InteractionKind;
  courseId: string;
  userId: string;
  referrer: string;
};
