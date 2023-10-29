import {
  HeroCard,
  LeaderCard,
  ItemCard,
  ModifierCard,
  MagicCard,
  ChallengeCard,
  MonsterCard,
  CardType,
  HeroClass,
  AnyCard,
  GameState
} from './types';
import { v4 as uuid } from 'uuid';

// ALL CARDS (BASE GAME)
const leaderCards: LeaderCard[] = [
  {
    name: 'The Charismatic Song',
    class: HeroClass.bard,
    type: CardType.large,
    id: uuid()
  },
  {
    name: 'The Cloaked Sage',
    class: HeroClass.wizard,
    type: CardType.large,
    id: uuid()
  },
  {
    name: 'The Divine Arrow',
    class: HeroClass.ranger,
    type: CardType.large,
    id: uuid()
  },
  {
    name: 'The Fist of Reason',
    class: HeroClass.fighter,
    type: CardType.large,
    id: uuid()
  },
  {
    name: 'The Protecting Horn',
    class: HeroClass.guardian,
    type: CardType.large,
    id: uuid()
  },
  {
    name: 'The Shadow Claw',
    class: HeroClass.thief,
    type: CardType.large,
    id: uuid()
  }
];

const monsterCards: MonsterCard[] = [
  {
    name: 'Anuran Cauldron',
    type: CardType.large,
    id: uuid()
  },
  {
    name: 'Arctic Aries',
    type: CardType.large,
    id: uuid()
  },
  {
    name: 'Bloodwing',
    type: CardType.large,
    id: uuid()
  },
  {
    name: 'Orthus',
    type: CardType.large,
    id: uuid()
  },
  {
    name: 'Corrupted Sabretooth',
    type: CardType.large,
    id: uuid()
  },
  {
    name: 'Crowned Serpent',
    type: CardType.large,
    id: uuid()
  },
  {
    name: 'Abyss Queen',
    type: CardType.large,
    id: uuid()
  },
  {
    name: 'Dracos',
    type: CardType.large,
    id: uuid()
  },
  {
    name: 'Dark Dragon King',
    type: CardType.large,
    id: uuid()
  },
  {
    name: 'Malamammoth',
    type: CardType.large,
    id: uuid()
  },
  {
    name: 'Rex Major',
    type: CardType.large,
    id: uuid()
  },
  {
    name: 'Terratuga',
    type: CardType.large,
    id: uuid()
  },
  {
    name: 'Mega Slime',
    type: CardType.large,
    id: uuid()
  },
  {
    name: 'Titan Wyvern',
    type: CardType.large,
    id: uuid()
  },
  {
    name: 'Warworn Owlbear',
    type: CardType.large,
    id: uuid()
  }
];

const heroCards: HeroCard[] = [
  // Bards
  {
    name: 'Dodgy Dealer',
    class: HeroClass.bard,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Fuzzy Cheeks',
    class: HeroClass.bard,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Greedy Cheeks',
    class: HeroClass.bard,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Lucky Bucky',
    class: HeroClass.bard,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Mellow Dee',
    class: HeroClass.bard,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Napping Nibbles',
    class: HeroClass.bard,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Peanut',
    class: HeroClass.bard,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Tipsy Tootie',
    class: HeroClass.bard,
    type: CardType.hero,
    id: uuid()
  },
  // fighters
  {
    name: 'Bad Axe',
    class: HeroClass.fighter,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Bear Claw',
    class: HeroClass.fighter,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Beary Wise',
    class: HeroClass.fighter,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Fury Knuckle',
    class: HeroClass.fighter,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Heavy Bear',
    class: HeroClass.fighter,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Pan Chucks',
    class: HeroClass.fighter,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Qi Bear',
    class: HeroClass.fighter,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Tough Teddy',
    class: HeroClass.fighter,
    type: CardType.hero,
    id: uuid()
  },
  // guardian
  {
    name: 'Calming Voice',
    class: HeroClass.guardian,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Guiding Light',
    class: HeroClass.guardian,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Holy Curselifter',
    class: HeroClass.guardian,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Iron Resolve',
    class: HeroClass.guardian,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Mighty Blade',
    class: HeroClass.guardian,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Radiant Horn',
    class: HeroClass.guardian,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Vibrant Glow',
    class: HeroClass.guardian,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Wise Shield',
    class: HeroClass.guardian,
    type: CardType.hero,
    id: uuid()
  },
  // rangers
  {
    name: 'Bullseye',
    class: HeroClass.ranger,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Hook',
    class: HeroClass.ranger,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Lookie Rookie',
    class: HeroClass.ranger,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Quick Draw',
    class: HeroClass.ranger,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Serious Grey',
    class: HeroClass.ranger,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Sharp Fox',
    class: HeroClass.ranger,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Wildshot',
    class: HeroClass.ranger,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Wily Red',
    class: HeroClass.ranger,
    type: CardType.hero,
    id: uuid()
  },
  // Thieves
  {
    name: 'Kit Napper',
    class: HeroClass.thief,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Meowzio',
    class: HeroClass.thief,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Plundering Puma',
    class: HeroClass.thief,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Shurikitty',
    class: HeroClass.thief,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Silent Shadow',
    class: HeroClass.thief,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Slippery Paws',
    class: HeroClass.thief,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Sly Pickings',
    class: HeroClass.thief,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Smooth Mimimeow',
    class: HeroClass.thief,
    type: CardType.hero,
    id: uuid()
  },
  // wizard
  {
    name: 'Bun Bun',
    class: HeroClass.wizard,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Buttons',
    class: HeroClass.wizard,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Fluffy',
    class: HeroClass.wizard,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Hopper',
    class: HeroClass.wizard,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Snowball',
    class: HeroClass.wizard,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Spooky',
    class: HeroClass.wizard,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Whiskers',
    class: HeroClass.wizard,
    type: CardType.hero,
    id: uuid()
  },
  {
    name: 'Wiggles',
    class: HeroClass.wizard,
    type: CardType.hero,
    id: uuid()
  }
];

const itemCards: ItemCard[] = [
  {
    name: 'Bard Mask',
    type: CardType.item,
    id: uuid()
  },
  {
    name: 'Decoy Doll',
    type: CardType.item,
    id: uuid()
  },
  {
    name: 'Fighter Mask',
    type: CardType.item,
    id: uuid()
  },
  {
    name: 'Guardian Mask',
    type: CardType.item,
    id: uuid()
  },
  {
    name: 'Particularly Rusty Coin',
    type: CardType.item,
    id: uuid()
  },
  {
    name: 'Particularly Rusty Coin',
    type: CardType.item,
    id: uuid()
  },
  {
    name: 'Ranger Mask',
    type: CardType.item,
    id: uuid()
  },
  {
    name: 'Really Big Ring',
    type: CardType.item,
    id: uuid()
  },
  {
    name: 'Really Big Ring',
    type: CardType.item,
    id: uuid()
  },
  {
    name: 'Thief Mask',
    type: CardType.item,
    id: uuid()
  },
  {
    name: 'Wizard Mask',
    type: CardType.item,
    id: uuid()
  },
  {
    name: 'Suspiciously Shiny Coin',
    type: CardType.item,
    id: uuid()
  },
  {
    name: "Curse of the Snake's Eyes",
    type: CardType.item,
    id: uuid()
  },
  {
    name: "Curse of the Snake's Eyes",
    type: CardType.item,
    id: uuid()
  },
  {
    name: 'Sealing Key',
    type: CardType.item,
    id: uuid()
  }
];

const modifierCards: ModifierCard[] = [
  {
    name: '1-3',
    modifier: [1, -3],
    type: CardType.modifier,
    id: uuid()
  },
  {
    name: '1-3',
    modifier: [1, -3],
    type: CardType.modifier,
    id: uuid()
  },
  {
    name: '1-3',
    modifier: [1, -3],
    type: CardType.modifier,
    id: uuid()
  },
  {
    name: '1-3',
    modifier: [1, -3],
    type: CardType.modifier,
    id: uuid()
  },
  {
    name: '2-2',
    modifier: [2, -2],
    type: CardType.modifier,
    id: uuid()
  },
  {
    name: '2-2',
    modifier: [2, -2],
    type: CardType.modifier,
    id: uuid()
  },
  {
    name: '2-2',
    modifier: [2, -2],
    type: CardType.modifier,
    id: uuid()
  },
  {
    name: '2-2',
    modifier: [2, -2],
    type: CardType.modifier,
    id: uuid()
  },
  {
    name: '2-2',
    modifier: [2, -2],
    type: CardType.modifier,
    id: uuid()
  },
  {
    name: '2-2',
    modifier: [2, -2],
    type: CardType.modifier,
    id: uuid()
  },
  {
    name: '2-2',
    modifier: [2, -2],
    type: CardType.modifier,
    id: uuid()
  },
  {
    name: '2-2',
    modifier: [2, -2],
    type: CardType.modifier,
    id: uuid()
  },
  {
    name: '2-2',
    modifier: [2, -2],
    type: CardType.modifier,
    id: uuid()
  },
  {
    name: '3-1',
    modifier: [3, -1],
    type: CardType.modifier,
    id: uuid()
  },
  {
    name: '3-1',
    modifier: [3, -1],
    type: CardType.modifier,
    id: uuid()
  },
  {
    name: '3-1',
    modifier: [3, -1],
    type: CardType.modifier,
    id: uuid()
  },
  {
    name: '3-1',
    modifier: [3, -1],
    type: CardType.modifier,
    id: uuid()
  },
  {
    name: '4-0',
    modifier: [4],
    type: CardType.modifier,
    id: uuid()
  },
  {
    name: '4-0',
    modifier: [4],
    type: CardType.modifier,
    id: uuid()
  },
  {
    name: '4-0',
    modifier: [4],
    type: CardType.modifier,
    id: uuid()
  },
  {
    name: '4-0',
    modifier: [4],
    type: CardType.modifier,
    id: uuid()
  },
  {
    name: '0-4',
    modifier: [-4],
    type: CardType.modifier,
    id: uuid()
  },
  {
    name: '0-4',
    modifier: [-4],
    type: CardType.modifier,
    id: uuid()
  },
  {
    name: '0-4',
    modifier: [-4],
    type: CardType.modifier,
    id: uuid()
  },
  {
    name: '0-4',
    modifier: [-4],
    type: CardType.modifier,
    id: uuid()
  }
];

const challengeCard: ChallengeCard[] = [
  {
    name: 'challenge',
    type: CardType.challenge,
    id: uuid()
  },
  {
    name: 'challenge',
    type: CardType.challenge,
    id: uuid()
  },
  {
    name: 'challenge',
    type: CardType.challenge,
    id: uuid()
  },
  {
    name: 'challenge',
    type: CardType.challenge,
    id: uuid()
  },
  {
    name: 'challenge',
    type: CardType.challenge,
    id: uuid()
  },
  {
    name: 'challenge',
    type: CardType.challenge,
    id: uuid()
  },
  {
    name: 'challenge',
    type: CardType.challenge,
    id: uuid()
  },
  {
    name: 'challenge',
    type: CardType.challenge,
    id: uuid()
  },
  {
    name: 'challenge',
    type: CardType.challenge,
    id: uuid()
  },
  {
    name: 'challenge',
    type: CardType.challenge,
    id: uuid()
  },
  {
    name: 'challenge',
    type: CardType.challenge,
    id: uuid()
  },
  {
    name: 'challenge',
    type: CardType.challenge,
    id: uuid()
  },
  {
    name: 'challenge',
    type: CardType.challenge,
    id: uuid()
  },
  {
    name: 'challenge',
    type: CardType.challenge,
    id: uuid()
  }
];

const magicCards: MagicCard[] = [
  {
    name: 'Call to the Fallen',
    type: CardType.magic,
    id: uuid()
  },
  {
    name: 'Critical Boost',
    type: CardType.magic,
    id: uuid()
  },
  {
    name: 'Destructive Spell',
    type: CardType.magic,
    id: uuid()
  },
  {
    name: 'Enchanted Spell',
    type: CardType.magic,
    id: uuid()
  },
  {
    name: 'Entangling Trap',
    type: CardType.magic,
    id: uuid()
  },
  {
    name: 'Critical Boost',
    type: CardType.magic,
    id: uuid()
  },
  {
    name: 'Destructive Spell',
    type: CardType.magic,
    id: uuid()
  },
  {
    name: 'Enchanted Spell',
    type: CardType.magic,
    id: uuid()
  },
  {
    name: 'Entangling Trap',
    type: CardType.magic,
    id: uuid()
  },
  {
    name: 'Forced Exchange',
    type: CardType.magic,
    id: uuid()
  },
  {
    name: 'Forceful Winds',
    type: CardType.magic,
    id: uuid()
  },
  {
    name: 'Winds of Change',
    type: CardType.magic,
    id: uuid()
  },
  {
    name: 'Winds of Change',
    type: CardType.magic,
    id: uuid()
  }
];

export const deck: AnyCard[] = [
  ...heroCards,
  ...itemCards,
  ...magicCards,
  ...modifierCards,
  ...challengeCard
];

export const leaderPile: LeaderCard[] = [...leaderCards];

export const monsterPile: MonsterCard[] = [...monsterCards];

export const initialState: GameState = {
  // PRIVATE
  secret: {
    deck: deck,
    leaderPile: leaderPile,
    discardPile: [],
    monsterPile: monsterPile,
    playerIds: [],
    playerSocketIds: []
  },
  players: [],

  // PUBLIC
  dice: {
    main: { roll: [1, 1], modifier: [], total: 0 },
    defend: null
  },
  board: [],
  mainDeck: {
    monsters: [monsterPile[0], monsterPile[0], monsterPile[0]],
    discardTop: null,
    preparedCard: null,
    attackedMonster: null
  },

  // MATCH VARIABLES
  match: {
    gameStarted: false,
    players: [],
    isReady: [],
    startRolls: { maxVal: 0, inList: [], rolls: [] }
  },
  turn: {
    player: 0,
    movesLeft: 3,
    phase: 'start-roll',
    isRolling: false
  }
};