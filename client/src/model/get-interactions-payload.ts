import { InteractionKind } from '../lib/types';

export type GetInteractionsPayload = {
  kind?: InteractionKind;
  likes: number;
};
