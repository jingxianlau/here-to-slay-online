import { ClientStateObj } from '../types';

export const dropHand = (
  showHand: ClientStateObj['showHand'],
  shownCard: ClientStateObj['shownCard']
) => {
  showHand.set(false);
  shownCard.set(null);
  shownCard.setPos(null);
};
