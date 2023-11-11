import { ClientStateObj } from '../types';

export const dropHand = (
  showHand: ClientStateObj['showHand'],
  shownCard: ClientStateObj['shownCard']
) => {
  showHand.set(false);
  showHand.setLocked(true);
  shownCard.set(null);
  shownCard.setPos(null);
};
