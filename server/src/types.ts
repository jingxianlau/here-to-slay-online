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
  item?: ItemCard;
  id: string;
  freeUse: boolean;
  abilityUsed: boolean;
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

interface State {
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
    heroCards: [
      HeroCard | null,
      HeroCard | null,
      HeroCard | null,
      HeroCard | null,
      HeroCard | null
    ];
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
        | 'none' // DONE
        | 'draw' // DONE
        | 'choose-two' // DONE
        | 'reveal' // DONE
        | 'choose-boards' // DONE
        | 'choose-own-board' // DONE
        | 'choose-other-boards' // DONE
        | 'choose-player' // DONE
        | 'choose-hand' // DONE
        | 'choose-other-hand-hide' // DONE
        | 'choose-other-hand-show' // DONE
        | 'choose-discard'
        | 'choose-cards'; // DONE
      actionChanged: boolean;
      players: number[]; // active players who can choose
      val: { min: number; max: number; curr: number }; // num of items to choose
      goNext: boolean;
      step: number; // to access functions in ability array
      card: HeroCard | MagicCard | MonsterCard; // card in use
      choice: AnyCard[] | number[] | null; // player's chosen option(s) (to display)
      active?: {
        num?: number[];
        card?: AnyCard[];
      };
      activeNumVisible: boolean[];
      activeCardVisible: boolean[];
      purpose: string; // message (e.g. destroy, swap deck etc.)
      allowedCards?: CardType[];
    } | null;
    cachedEvent: {
      phase:
        | 'end-turn-discard'
        | 'draw'
        | 'play'
        | 'choose-hero'
        | 'attack-roll'
        | 'challenge'
        | 'challenge-roll'
        | 'use-effect-roll'
        | 'use-effect'
        | 'modify';
      effect: {
        action:
          | 'none' // DONE
          | 'draw' // DONE
          | 'choose-two' // DONE
          | 'reveal' // DONE
          | 'choose-boards' // DONE
          | 'choose-own-board' // DONE
          | 'choose-other-boards' // DONE
          | 'choose-player' // DONE
          | 'choose-hand' // DONE
          | 'choose-other-hand-hide' // DONE
          | 'choose-other-hand-show' // DONE
          | 'choose-discard'
          | 'choose-cards'; // DONE
        actionChanged: boolean;
        players: number[]; // active players who can choose
        val: { min: number; max: number; curr: number }; // num of items to choose
        goNext: boolean;
        step: number; // to access functions in ability array
        card: HeroCard | MagicCard | MonsterCard; // card in use
        choice: AnyCard[] | number[] | null; // player's chosen option(s) (to display)
        active?: {
          num?: number[];
          card?: AnyCard[];
        };
        activeNumVisible: boolean[];
        activeCardVisible: boolean[];
        purpose: string; // message (e.g. destroy, swap deck etc.)
        allowedCards?: CardType[];
      } | null;
    }[];
    phaseChanged: boolean;
    isRolling: boolean;
    pause: boolean;
  };
}

export interface GameState extends State {
  // PRIVATE
  secret: {
    deck: AnyCard[];
    leaderPile: LeaderCard[];
    monsterPile: MonsterCard[];
    playerIds: string[];
    playerSocketIds: string[];
  };
}

export interface privateState extends State {
  playerNum: number;
}
