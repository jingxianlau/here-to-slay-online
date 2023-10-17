export enum HeroClass {
  fighter = 'fighter',
  bard = 'bard',
  guardian = 'guardian',
  ranger = 'ranger',
  thief = 'thief',
  wizard = 'wizard'
}

export enum CardType {
  modifier = 'modifier',
  challenge = 'challenge',
  hero = 'hero',
  large = 'large',
  magic = 'magic',
  item = 'item'
}

interface Card {
  player?: number;
  name: string;
  type: CardType;
  id: string;
}
export interface HeroCard extends Card {
  type: CardType.hero;
  class: HeroClass;
  items?: ItemCard[];
  id: string;
}
export interface ChallengeCard extends Card {
  type: CardType.challenge;
  id: string;
}
export interface ModifierCard extends Card {
  type: CardType.modifier;
  modifier: [number, number] | [number];
  diceId?: 1 | 2;
  id: string;
}
export interface ItemCard extends Card {
  type: CardType.item;
  heroId?: number;
  id: string;
}
export interface MagicCard extends Card {
  type: CardType.magic;
  id: string;
}
export interface MonsterCard extends Card {
  type: CardType.large;
  id: string;
}
export interface LeaderCard extends MonsterCard {
  type: CardType.large;
  class: HeroClass;
  id: string;
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

export interface Room {
  numPlayers: number;
  state: GameState;
  private: boolean;
}

export interface GameState {
  // PRIVATE
  secret: {
    deck: AnyCard[];
    leaderPile: LeaderCard[];
    discardPile: AnyCard[];
    monsterPile: MonsterCard[];
    playerIds: string[];
    playerSocketIds: string[];
  };
  players: { hand: AnyCard[] }[];

  // PUBLIC
  dice: {
    main: { roll: [number, number]; modifier: number; total: number };

    // for challenging
    defend: { roll: [number, number]; modifer: number; total: number } | null;
  };
  board: {
    // for win condition (6 diff classes)
    classes: {
      fighter: number;
      bard: number;
      guardian: number;
      ranger: number;
      thief: number;
      wizard: number;
    };

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
    isReady: boolean[];
    startRolls: { maxVal: number; inList: number[]; rolls: number[] };
  };
  turn: {
    player: number;
    movesLeft: 1 | 2 | 3;
    phase: 'start-roll' | 'draw' | 'play' | 'attack' | 'challenge';
    isRolling: boolean;
  };
}

export interface privateState {
  // PRIVATE
  secret: {
    deck: AnyCard[] | null;
    leaderPile: LeaderCard[] | null;
    discardPile: AnyCard[] | null;
    monsterPile: AnyCard[] | null;
  } | null;
  players: ({ hand: AnyCard[] } | null)[];

  // PUBLIC
  dice: {
    main: { roll: [number, number]; modifier: number; total: number };

    // for challenging
    defend: { roll: [number, number]; modifer: number; total: number } | null;
  };
  board: {
    // for win condition (6 diff classes)
    classes: {
      fighter: number;
      bard: number;
      guardian: number;
      ranger: number;
      thief: number;
      wizard: number;
    };

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
    isReady: boolean[];
    startRolls: { maxVal: number; inList: number[]; rolls: number[] };
  };
  turn: {
    player: number;
    movesLeft: 1 | 2 | 3;
    phase: 'start-roll' | 'draw' | 'play' | 'attack' | 'challenge';
    isRolling: boolean;
  };
}
