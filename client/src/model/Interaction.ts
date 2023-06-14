export enum InteractionKind {
  Like = 'like',
  Dislike = 'dislike',
}

export type Interaction = {
  kind: InteractionKind;
  courseId: string;
  userId: string;
  referrer: string;
};
