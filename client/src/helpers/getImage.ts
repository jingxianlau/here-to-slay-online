import { AnyCard, CardType } from '../types';

export const getImage = (card: AnyCard) => {
  if (card) {
    if (card.type === CardType.hero) {
      return `./assets/${card.type}/${card.class}/${card.name
        .replaceAll(' ', '-')
        .toLowerCase()}.png`;
    } else {
      return `./assets/${card.type}/${card.name
        .replaceAll(' ', '-')
        .toLowerCase()}.png`;
    }
  }
};
