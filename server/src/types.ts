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
  freeUse: boolean;
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

export interface Room {
  numPlayers: number;
  state: GameState;
  private: boolean;
}

export const allCards = [
  CardType.modifier,
  CardType.challenge,
  CardType.hero,
  CardType.magic,
  CardType.item
];

export interface GameState {
  // PRIVATE
  secret: {
    deck: AnyCard[];
    leaderPile: LeaderCard[];
    monsterPile: MonsterCard[];
    playerIds: string[];
    playerSocketIds: string[];
  };
  players: { hand: AnyCard[]; numCards: number }[];

  // PUBLIC
  dice: {
    main: {
      roll: [number, number];
      modifier: ModifierCard[];
      modValues: number[];
      total: number;
    };

    // for challenging
    defend: {
      roll: [number, number];
      modifier: ModifierCard[];
      modValues: number[];
      total: number;
    } | null;
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
    discardPile: AnyCard[];

    // window for challenging
    preparedCard?: {
      card: HeroCard | ItemCard | MagicCard;
      successful: null | boolean;
    } | null;
    attackedMonster?: {
      card: MonsterCard;
      successful: null | boolean;
    } | null;
  };

  // MATCH VARIABLES
  match: {
    gameStarted: boolean;
    players: string[];
    isReady: (boolean | null)[];
    startRolls: { maxVal: number; inList: number[]; rolls: number[] };
  };
  turn: {
    player: number;
    challenger?: number;
    movesLeft: 0 | 1 | 2 | 3;
    phase:
      | 'start-roll'
      | 'draw'
      | 'play'
      | 'attack'
      | 'challenge'
      | 'challenge-roll'
      | 'modify'
      | 'use-effect';
    effect: {
      action:
        | 'none'
        | 'play'
        | 'choose-boards'
        | 'choose-own-board'
        | 'choose-other-boards'
        | 'choose-player'
        | 'choose-hand'
        | 'choose-other-hand'
        | 'choose-discard';
      players: number[];
      val: number;
      step: number;
      card: HeroCard | MagicCard | MonsterCard;
      allowedCards?: CardType[];
    } | null;
    phaseChanged: boolean;
    isRolling: boolean;
  };
}

export interface privateState {
  // PRIVATE
  secret: {
    deck: AnyCard[] | null;
    leaderPile: LeaderCard[] | null;
    monsterPile: AnyCard[] | null;
  } | null;
  players: { hand: AnyCard[]; numCards: number }[];

  // PUBLIC
  dice: {
    main: {
      roll: [number, number];
      modifier: ModifierCard[];
      modValues: number[];
      total: number;
    };

    // for challenging
    defend: {
      roll: [number, number];
      modifier: ModifierCard[];
      modValues: number[];
      total: number;
    } | null;
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
    discardPile: AnyCard[];

    // window for challenging
    preparedCard?: {
      card: HeroCard | ItemCard | MagicCard;
      successful: null | boolean;
    } | null;
    attackedMonster?: {
      card: MonsterCard;
      successful: null | boolean;
    } | null;
  };

  // MATCH VARIABLES
  match: {
    gameStarted: boolean;
    players: string[];
    isReady: (boolean | null)[];
    startRolls: { maxVal: number; inList: number[]; rolls: number[] };
  };
  turn: {
    player: number;
    challenger?: number;
    movesLeft: 1 | 2 | 3;
    phase:
      | 'start-roll'
      | 'draw'
      | 'play'
      | 'attack'
      | 'challenge'
      | 'challenge-roll'
      | 'modify'
      | 'use-effect';
    effect: {
      action:
        | 'none'
        | 'play'
        | 'choose-boards'
        | 'choose-own-board'
        | 'choose-other-boards'
        | 'choose-player'
        | 'choose-hand'
        | 'choose-other-hand'
        | 'choose-discard';
      players: number[];
      val: number;
      step: number;
      card: HeroCard | MagicCard | MonsterCard;
      allowedCards?: CardType[];
    } | null;
    phaseChanged: boolean;
    isRolling: boolean;
  };
  playerNum: number;
}
