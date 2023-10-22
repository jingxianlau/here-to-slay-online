import { CardType, HeroClass } from '../types';

export const getImage = (
  name: string,
  type: CardType,
  heroClass?: HeroClass
) => {
  if (heroClass) {
    return `./assets/${type}/${heroClass}/${name
      .replaceAll(' ', '-')
      .toLowerCase()}.png`;
  } else {
    return `./assets/${type}/${name.replaceAll(' ', '-').toLowerCase()}.png`;
  }
};
