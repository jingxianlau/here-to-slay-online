import { AnyCard, CardType } from '../types';

export const shortenName = (card: AnyCard) =>
  card.name.replaceAll(' ', '-').toLowerCase();

export const getImage = (card: AnyCard) => {
  if (card) {
    if (card.type === CardType.hero) {
      return `./assets/${card.type}/${card.class}/${shortenName(card)}.png`;
    } else {
      return `./assets/${card.type}/${shortenName(card)}.png`;
    }
  }
};
