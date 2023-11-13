import type { InteractionKind } from './Interaction';

export type GetInteractionsPayload = {
  kind?: InteractionKind;
  likes: number;
};
