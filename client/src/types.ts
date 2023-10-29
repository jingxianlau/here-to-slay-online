import { Socket } from 'socket.io-client';

export interface Credentials {
  roomId: string;
  userId: string;
}

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
  id?: string;
}
export interface HeroCard extends Card {
  type: CardType.hero;
  class: HeroClass;
  items?: ItemCard[];
}
export interface ChallengeCard extends Card {
  type: CardType.challenge;
}
export interface ModifierCard extends Card {
  type: CardType.modifier;
  modifier: [number, number] | [number];
  diceId?: 1 | 2;
}
export interface ItemCard extends Card {
  type: CardType.item;
  heroId?: number;
}
export interface MagicCard extends Card {
  type: CardType.magic;
}
export interface MonsterCard extends Card {
  type: CardType.large;
}
export interface LeaderCard extends MonsterCard {
  type: CardType.large;
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
    deck: AnyCard[] | null;
    leaderPile: LeaderCard[] | null;
    discardPile: AnyCard[] | null;
    monsterPile: AnyCard[] | null;
  } | null;
  players: ({ hand: AnyCard[] } | null)[];

  // PUBLIC
  dice: {
    main: {
      roll: [number, number];
      modifier: [number, number][];
      total: number;
    };

    // for challenging
    defend: {
      roll: [number, number];
      modifier: [number, number][];
      total: number;
    } | null;
  };
  board: {
    // for win condition (6 diff classes)
    classes: {
      FIGHTER: number;
      BARD: number;
      GUARDIAN: number;
      RANGER: number;
      THIEF: number;
      WIZARD: number;
    };

    // players' public board
    heroCards: HeroCard[];
    largeCards: LargeCard[];
  }[];
  mainDeck: {
    monsters: [MonsterCard, MonsterCard, MonsterCard];
    discardTop: AnyCard | null;

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
    isReady: boolean[];
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
      | 'modify';
    isRolling: boolean;
  };
}

export interface CardContextObj {
  shownCard: AnyCard | null;
  setShownCard: React.Dispatch<React.SetStateAction<AnyCard | null>>;
  pos: 'left' | 'right' | 'top' | null;
  setPos: React.Dispatch<React.SetStateAction<'left' | 'right' | 'top' | null>>;
}

export interface SocketContextObj {
  socket: Socket | null;
  setSocket: React.Dispatch<React.SetStateAction<Socket | null>>;
}
