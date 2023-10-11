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
    discardPile: AnyCard[];
    monsterPile: AnyCard[];
    playerIds: string[];
  };
  players: { hand: AnyCard[] }[];

  // PUBLIC
  dice: {
    main: { roll: [number, number]; modifier: number };

    // for challenging
    defend: { roll: [number, number]; modifer: number } | null;
  };
  board: {
    // for win condition (6 diff classes)
    classes: HeroClass[];

    // players' public board
    heroCards: HeroCard[];
    largeCards: LargeCard[];
  }[];
  mainDeck: {
    monsters: [MonsterCard, MonsterCard, MonsterCard];

    // window for challenging
    preparedCard?: {
      card: HeroCard | MagicCard | ItemCard;
      successful: null | boolean;
    } | null;
  };

  // MATCH VARIABLES
  match: {
    gameStarted: boolean;
    players: string[];
    player: number;
    turnsLeft: 1 | 2 | 3;
    phase: 'draw' | 'play' | 'attack' | 'challenge';
    isRolling: boolean;

    // Match Start
    isReady: boolean[];
  };
}

export interface privateState {
  // PRIVATE
  secret: {
    deck: AnyCard[] | null;
    leaderPile: LeaderCard[] | null;
    discardPile: AnyCard[] | null;
    monsterPile: AnyCard[] | null;
    playerIds: string[] | null;
  } | null;
  players: ({ hand: AnyCard[] } | null)[];

  // PUBLIC
  dice: {
    main: { roll: [number, number]; modifier: number };

    // for challenging
    defend: { roll: [number, number]; modifer: number } | null;
  };
  board: {
    // for win condition (6 diff classes)
    classes: HeroClass[];

    // players' public board
    heroCards: HeroCard[];
    largeCards: LargeCard[];
  }[];
  mainDeck: {
    monsters: [MonsterCard, MonsterCard, MonsterCard];

    // window for challenging
    preparedCard?: {
      card: HeroCard | MagicCard | ItemCard;
      successful: null | boolean;
    } | null;
  };

  // MATCH VARIABLES
  match: {
    gameStarted: boolean;
    players: string[];
    player: number;
    turnsLeft: 1 | 2 | 3;
    phase: 'draw' | 'play' | 'attack' | 'challenge';
    isRolling: boolean;

    // Match Start
    isReady: boolean[];
  };
}
