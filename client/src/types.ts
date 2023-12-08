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
  item?: ItemCard;
  freeUse: boolean;
  abilityUsed: boolean;
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
  heroId?: string;
  heroPlayer?: number;
  category: 'cursed' | 'blessed' | HeroClass;
}
export interface MagicCard extends Card {
  type: CardType.magic;
}
export interface MonsterCard extends Card {
  type: CardType.large;
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
      card: HeroCard | ItemCard | MagicCard | MonsterCard;
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
      | 'end-turn-discard'
      | 'draw'
      | 'play'
      | 'choose-hero'
      | 'attack-roll'
      | 'challenge'
      | 'challenge-roll'
      | 'use-effect-roll'
      | 'use-effect'
      | 'modify'
      | 'end-game';

    /* ONLY FOR 'end-turn-discard' PHASE */
    toDiscard: number;
    /* ONLY FOR 'end-turn-discard' PHASE */

    effect: {
      action:
        | 'none'
        | 'draw'
        | 'play'
        | 'reveal'
        | 'choose-boards'
        | 'choose-own-board'
        | 'choose-other-boards'
        | 'choose-player'
        | 'choose-hand'
        | 'choose-other-hand-hide'
        | 'choose-other-hand-show'
        | 'choose-discard';
      players: number[]; // active players who can choose
      val: number; // num of items to choose
      step: number; // to access functions in ability array
      card: HeroCard | MagicCard | MonsterCard; // card in use
      choice: AnyCard[] | number[] | null; // player's chosen option(s) (to display)
      active: {
        num: number;
        card: AnyCard;
      };
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

  chosenCard: {
    val: AnyCard | null;
    set: React.Dispatch<React.SetStateAction<AnyCard | null>>;
    show: boolean;
    setShow: React.Dispatch<React.SetStateAction<boolean>>;
    customText: string;
    setCustomText: React.Dispatch<React.SetStateAction<string>>;
    customCenter: string;
    setCustomCenter: React.Dispatch<React.SetStateAction<string>>;
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
    pos: 'left' | 'right' | 'top' | 'center' | null;
    setPos: React.Dispatch<
      React.SetStateAction<'left' | 'right' | 'top' | 'center' | null>
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

export const monsterRequirements: {
  [key: string]: { req: number; hero: HeroClass | 'hero' }[];
} = {
  'abyss-queen': [{ req: 2, hero: 'hero' }],
  'anuran-cauldron': [{ req: 3, hero: 'hero' }],
  'arctic-aries': [{ req: 1, hero: 'hero' }],
  bloodwing: [{ req: 2, hero: 'hero' }],
  'corrupted-sabretooth': [{ req: 3, hero: 'hero' }],
  'crowned-serpent': [{ req: 2, hero: 'hero' }],
  'dark-dragon-king': [
    { req: 1, hero: HeroClass.bard },
    { req: 1, hero: 'hero' }
  ],
  dracos: [{ req: 1, hero: 'hero' }],
  malamammoth: [
    { req: 1, hero: HeroClass.ranger },
    { req: 1, hero: 'hero' }
  ],
  'mega-slime': [{ req: 4, hero: 'hero' }],
  orthus: [
    { req: 1, hero: HeroClass.wizard },
    { req: 1, hero: 'hero' }
  ],
  'rex-major': [
    { req: 1, hero: HeroClass.guardian },
    { req: 1, hero: 'hero' }
  ],
  terratuga: [{ req: 1, hero: 'hero' }],
  'titan-wyvern': [
    { req: 1, hero: HeroClass.fighter },
    { req: 1, hero: 'hero' }
  ],
  'warworn-owlbear': [
    { req: 1, hero: HeroClass.thief },
    { req: 1, hero: 'hero' }
  ]
};

export const rollRequirements: {
  [key: string]: { pass: number; fail?: number };
} = {
  // HEROES
  // bard
  'dodgy-dealer': { pass: 9 },
  'fuzzy-cheeks': { pass: 8 },
  'greedy-cheeks': { pass: 8 },
  'lucky-bucky': { pass: 7 },
  'mellow-dee': { pass: 7 },
  'napping-nibbles': { pass: 2 },
  peanut: { pass: 7 },
  'tipsy-tootie': { pass: 6 },
  // fighter
  'bad-axe': { pass: 8 },
  'bear-claw': { pass: 7 },
  'beary-wise': { pass: 7 },
  'fury-knuckle': { pass: 5 },
  'heavy-bear': { pass: 5 },
  'pan-chucks': { pass: 8 },
  'qi-bear': { pass: 10 },
  'tough-teddy': { pass: 4 },
  // guardian
  'calming-voice': { pass: 9 },
  'guiding-light': { pass: 7 },
  'holy-curselifter': { pass: 5 },
  'iron-resolve': { pass: 8 },
  'mighty-blade': { pass: 8 },
  'radiant-horn': { pass: 6 },
  'vibrant-glow': { pass: 9 },
  'wise-shield': { pass: 6 },
  // ranger
  bullseye: { pass: 7 },
  hook: { pass: 6 },
  'lookie-rookie': { pass: 5 },
  'quick-draw': { pass: 8 },
  'serious-grey': { pass: 9 },
  'sharp-fox': { pass: 5 },
  wildshot: { pass: 8 },
  'wily-red': { pass: 10 },
  // thief
  'kit-napper': { pass: 9 },
  meowzio: { pass: 10 },
  'plundering-puma': { pass: 6 },
  shurikitty: { pass: 9 },
  'silent-shadow': { pass: 8 },
  'slippery-paws': { pass: 6 },
  'sly-pickings': { pass: 6 },
  'smooth-mimimeow': { pass: 7 },
  // wizard
  'bun-bun': { pass: 5 },
  buttons: { pass: 6 },
  fluffy: { pass: 10 },
  hopper: { pass: 7 },
  snowball: { pass: 6 },
  spooky: { pass: 10 },
  whiskers: { pass: 11 },
  wiggles: { pass: 10 },

  // MONSTERS
  'abyss-queen': { pass: 8, fail: -5 },
  'anuran-cauldron': { pass: 7, fail: -6 },
  'arctic-aries': { pass: 10, fail: -6 },
  bloodwing: { pass: 9, fail: -6 },
  'corrupted-sabretooth': { pass: 9, fail: -6 },
  'crowned-serpent': { pass: 10, fail: -7 },
  'dark-dragon-king': { pass: 8, fail: -7 },
  dracos: { pass: 8, fail: -5 },
  malamammoth: { pass: 8, fail: -4 },
  'mega-slime': { pass: 8, fail: -7 },
  orthus: { pass: 8, fail: -4 },
  'rex-major': { pass: 8, fail: -4 },
  terratuga: { pass: 11, fail: -7 },
  'titan-wyvern': { pass: 8, fail: -4 },
  'warworn-owlbear': { pass: 8, fail: -4 }
};
