import { ClientStateObj } from '../types';

export const popupHand = (
  showHand: ClientStateObj['showHand'],
  time = 1200
) => {
  showHand.set(true);
  setTimeout(() => {
    showHand.set(false);
  }, time);
};
