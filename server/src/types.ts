export enum HeroClass {
  Fighter = 'FIGHTER',
  Bard = 'BARD',
  Guardian = 'GUARDIAN',
  Ranger = 'RANGER',
  Thief = 'THIEF',
  Wizard = 'WIZARD'
}

export enum CardType {
  Modifier = 'MODIFIER',
  Challenge = 'CHALLENGE',
  Hero = 'HERO',
  Large = 'LARGE',
  Magic = 'MAGIC',
  Item = 'ITEM'
}

interface Card {
  player?: number;
  name: string;
  type: CardType;
  id?: string;
}
export interface HeroCard extends Card {
  type: CardType.Hero;
  class: HeroClass;
  items?: ItemCard[];
}
export interface ChallengeCard extends Card {
  type: CardType.Challenge;
}
export interface ModifierCard extends Card {
  type: CardType.Modifier;
  modifier: [number, number] | [number];
  diceId?: 1 | 2;
}
export interface ItemCard extends Card {
  type: CardType.Item;
  heroId?: number;
}
export interface MagicCard extends Card {
  type: CardType.Magic;
}
export interface MonsterCard extends Card {
  type: CardType.Large;
}
export interface LeaderCard extends MonsterCard {
  type: CardType.Large;
  class: HeroClass;
}
export type AnyCard =
  | HeroCard
  | ChallengeCard
  | ModifierCard
  | ItemCard
  | MagicCard
  | MonsterCard
  | LeaderCard;

export type LargeCard = LeaderCard | MonsterCard;

export interface GameState {
  // PRIVATE
  secret: {
    deck: AnyCard[];
    leaderPile: LeaderCard[];
  };
  players: {
    // private hand of each player
    [key: number]: { hand: AnyCard[] };
  };

  // PUBLIC
  dice: {
    main: {
      1: { roll: [number, number] };
      2: { roll: [number, number] };
      modifer: number;
    };

    // for challenging
    defend: {
      1: { roll: [number, number] };
      2: { roll: [number, number] };
      modifer: number;
    } | null;
  };
  board: {
    [key: number]: {
      // for win condition (6 diff classes)
      classes: CardType[];

      // players' public board
      heroCards: HeroCard[];
      largeCards: LargeCard[];
    };
  };
  mainDeck: {
    discardPile: AnyCard[];
    monsterPile: AnyCard[];
    monsters: [MonsterCard, MonsterCard, MonsterCard];

    // window for challenging
    preparedCard?: {
      card: HeroCard | MagicCard | ItemCard;
      successful: null | boolean;
    };
  };
}
