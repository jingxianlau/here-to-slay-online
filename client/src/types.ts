import Timer from 'easytimer.js';

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
  item = 'item',
  help = 'help'
}
export const allCards = [
  CardType.modifier,
  CardType.challenge,
  CardType.hero,
  CardType.magic,
  CardType.item,
  CardType.help
];

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
  freeUse: boolean;
}
export interface ChallengeCard extends Card {
  type: CardType.challenge;
}
export interface ModifierCard extends Card {
  type: CardType.modifier;
  modifier: [number, number] | [number];
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
    isReady: boolean[];
    startRolls: { maxVal: number; inList: number[]; rolls: number[] };
  };
  turn: {
    player: number;
    challenger?: number;
    movesLeft: 0 | 1 | 2 | 3;
    timeElapsed: number;
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
      players: number[]; // active players who can choose
      val: number; // num of items to choose
      step: number; // to access functions in ability array
      card: HeroCard | MagicCard | MonsterCard; // card in use
      choice: AnyCard[] | number[] | null; // player's chosen option(s) (to display)
      purpose: string; // message (e.g. destroy, swap deck etc.)
      allowedCards?: CardType[];
    } | null;
    phaseChanged: boolean;
    isRolling: boolean;
    pause: boolean;
  };
  playerNum: number;
}

export interface ClientStateObj {
  // player state
  credentials: {
    roomId: string;
    userId: string;
  };
  setCredentials: React.Dispatch<
    React.SetStateAction<{
      roomId: string;
      userId: string;
    }>
  >;

  // playerNum: { val: number; set: React.Dispatch<React.SetStateAction<number>> };

  // gameplay state
  state: {
    val: GameState;
    set: React.Dispatch<React.SetStateAction<GameState>>;
  };

  allowedCards: {
    val: CardType[];
    set: React.Dispatch<React.SetStateAction<CardType[]>>;
  };

  showRoll: {
    val: boolean;
    set: React.Dispatch<React.SetStateAction<boolean>>;
  };
  hasRolled: {
    val: boolean;
    set: React.Dispatch<React.SetStateAction<boolean>>;
  };

  showPopup: {
    val: boolean;
    set: React.Dispatch<React.SetStateAction<boolean>>;
  };

  showHand: {
    val: boolean;
    set: React.Dispatch<React.SetStateAction<boolean>>;
    locked: boolean;
    setLocked: React.Dispatch<React.SetStateAction<boolean>>;
  };

  shownCard: {
    val: AnyCard | null;
    set: React.Dispatch<React.SetStateAction<AnyCard | null>>;
    pos: 'left' | 'right' | 'top' | null;
    setPos: React.Dispatch<
      React.SetStateAction<'left' | 'right' | 'top' | null>
    >;
    locked: boolean;
    setLocked: React.Dispatch<React.SetStateAction<boolean>>;
  };

  // timer: {
  //   settings: Timer;
  //   maxTime: { val: number; set: React.Dispatch<React.SetStateAction<number>> };
  //   setTargetAchieved: (func: () => void) => void;
  // };

  showHelperText: {
    val: boolean;
    set: React.Dispatch<React.SetStateAction<boolean>>;
    text: string;
    setText: React.Dispatch<React.SetStateAction<string>>;
    showText: boolean;
    setShowText: React.Dispatch<React.SetStateAction<boolean>>;
  };
}
