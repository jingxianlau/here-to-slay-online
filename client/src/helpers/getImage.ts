import { AnyCard, CardType } from '../types';

export const shortenName = (card: AnyCard) =>
  card.name.replaceAll(' ', '-').toLowerCase();

export const getImage = (card: AnyCard) => {
  if (card) {
    if (card.type === CardType.hero) {
      return `https://jingxianlau.github.io/here-to-slay/assets/${card.type}/${
        card.class
      }/${shortenName(card)}.png`;
    } else {
      return `https://jingxianlau.github.io/here-to-slay/assets/${
        card.type
      }/${shortenName(card)}.png`;
    }
  }
};
