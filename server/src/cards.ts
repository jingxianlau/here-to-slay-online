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
    id: uuid(),
    punishment: 'monster-sacrifice'
  },
  {
    name: 'Arctic Aries',
    type: CardType.large,
    id: uuid(),
    punishment: 'monster-sacrifice'
  },
  {
    name: 'Bloodwing',
    type: CardType.large,
    id: uuid(),
    punishment: 'monster-sacrifice'
  },
  {
    name: 'Orthus',
    type: CardType.large,
    id: uuid(),
    punishment: 'monster-discard'
  },
  {
    name: 'Corrupted Sabretooth',
    type: CardType.large,
    id: uuid(),
    punishment: 'monster-sacrifice'
  },
  {
    name: 'Crowned Serpent',
    type: CardType.large,
    id: uuid(),
    punishment: 'monster-sacrifice'
  },
  {
    name: 'Abyss Queen',
    type: CardType.large,
    id: uuid(),
    punishment: 'monster-sacrifice'
  },
  {
    name: 'Dracos',
    type: CardType.large,
    id: uuid(),
    punishment: 'monster-sacrifice'
  },
  {
    name: 'Dark Dragon King',
    type: CardType.large,
    id: uuid(),
    punishment: 'monster-discard'
  },
  {
    name: 'Malamammoth',
    type: CardType.large,
    id: uuid(),
    punishment: 'monster-discard'
  },
  {
    name: 'Rex Major',
    type: CardType.large,
    id: uuid(),
    punishment: 'monster-discard'
  },
  {
    name: 'Terratuga',
    type: CardType.large,
    id: uuid(),
    punishment: 'monster-sacrifice'
  },
  {
    name: 'Mega Slime',
    type: CardType.large,
    id: uuid(),
    punishment: 'monster-sacrifice'
  },
  {
    name: 'Titan Wyvern',
    type: CardType.large,
    id: uuid(),
    punishment: 'monster-discard'
  },
  {
    name: 'Warworn Owlbear',
    type: CardType.large,
    id: uuid(),
    punishment: 'monster-discard'
  }
];

export const heroCards: HeroCard[] = [
  // Bards
  {
    name: 'Dodgy Dealer',
    class: HeroClass.bard,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Fuzzy Cheeks',
    class: HeroClass.bard,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Greedy Cheeks',
    class: HeroClass.bard,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Lucky Bucky',
    class: HeroClass.bard,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Mellow Dee',
    class: HeroClass.bard,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Napping Nibbles',
    class: HeroClass.bard,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Peanut',
    class: HeroClass.bard,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Tipsy Tootie',
    class: HeroClass.bard,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  // fighters
  {
    name: 'Bad Axe',
    class: HeroClass.fighter,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Bear Claw',
    class: HeroClass.fighter,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Beary Wise',
    class: HeroClass.fighter,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Fury Knuckle',
    class: HeroClass.fighter,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Heavy Bear',
    class: HeroClass.fighter,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Pan Chucks',
    class: HeroClass.fighter,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Qi Bear',
    class: HeroClass.fighter,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Tough Teddy',
    class: HeroClass.fighter,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  // guardian
  {
    name: 'Calming Voice',
    class: HeroClass.guardian,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Guiding Light',
    class: HeroClass.guardian,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Holy Curselifter',
    class: HeroClass.guardian,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Iron Resolve',
    class: HeroClass.guardian,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Mighty Blade',
    class: HeroClass.guardian,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Radiant Horn',
    class: HeroClass.guardian,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Vibrant Glow',
    class: HeroClass.guardian,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Wise Shield',
    class: HeroClass.guardian,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  // rangers
  {
    name: 'Bullseye',
    class: HeroClass.ranger,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Hook',
    class: HeroClass.ranger,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Lookie Rookie',
    class: HeroClass.ranger,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Quick Draw',
    class: HeroClass.ranger,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Serious Grey',
    class: HeroClass.ranger,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Sharp Fox',
    class: HeroClass.ranger,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Wildshot',
    class: HeroClass.ranger,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Wily Red',
    class: HeroClass.ranger,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  // Thieves
  {
    name: 'Kit Napper',
    class: HeroClass.thief,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Meowzio',
    class: HeroClass.thief,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Plundering Puma',
    class: HeroClass.thief,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Shurikitty',
    class: HeroClass.thief,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Silent Shadow',
    class: HeroClass.thief,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Slippery Paws',
    class: HeroClass.thief,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Sly Pickings',
    class: HeroClass.thief,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Smooth Mimimeow',
    class: HeroClass.thief,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  // wizard
  {
    name: 'Bun Bun',
    class: HeroClass.wizard,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Buttons',
    class: HeroClass.wizard,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Fluffy',
    class: HeroClass.wizard,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Hopper',
    class: HeroClass.wizard,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Snowball',
    class: HeroClass.wizard,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Spooky',
    class: HeroClass.wizard,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Whiskers',
    class: HeroClass.wizard,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Wiggles',
    class: HeroClass.wizard,
    type: CardType.hero,
    id: uuid(),
    freeUse: false,
    abilityUsed: false
  }
];

const itemCards: ItemCard[] = [
  {
    name: 'Bard Mask',
    type: CardType.item,
    id: uuid(),
    category: HeroClass.bard
  },
  {
    name: 'Decoy Doll',
    type: CardType.item,
    id: uuid(),
    category: 'blessed'
  },
  {
    name: 'Fighter Mask',
    type: CardType.item,
    id: uuid(),
    category: HeroClass.fighter
  },
  {
    name: 'Guardian Mask',
    type: CardType.item,
    id: uuid(),
    category: HeroClass.guardian
  },
  {
    name: 'Particularly Rusty Coin',
    type: CardType.item,
    id: uuid(),
    category: 'blessed'
  },
  {
    name: 'Particularly Rusty Coin',
    type: CardType.item,
    id: uuid(),
    category: 'blessed'
  },
  {
    name: 'Ranger Mask',
    type: CardType.item,
    id: uuid(),
    category: HeroClass.ranger
  },
  {
    name: 'Really Big Ring',
    type: CardType.item,
    id: uuid(),
    category: 'blessed'
  },
  {
    name: 'Really Big Ring',
    type: CardType.item,
    id: uuid(),
    category: 'blessed'
  },
  {
    name: 'Thief Mask',
    type: CardType.item,
    id: uuid(),
    category: HeroClass.thief
  },
  {
    name: 'Wizard Mask',
    type: CardType.item,
    id: uuid(),
    category: HeroClass.wizard
  },
  {
    name: 'Suspiciously Shiny Coin',
    type: CardType.item,
    id: uuid(),
    category: 'cursed'
  },
  {
    name: "Curse of the Snake's Eyes",
    type: CardType.item,
    id: uuid(),
    category: 'cursed'
  },
  {
    name: "Curse of the Snake's Eyes",
    type: CardType.item,
    id: uuid(),
    category: 'cursed'
  },
  {
    name: 'Sealing Key',
    type: CardType.item,
    id: uuid(),
    category: 'cursed'
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

export const magicCards: MagicCard[] = [
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
    monsterPile: monsterPile,
    playerIds: [],
    playerSocketIds: []
  },
  players: [],

  // PUBLIC
  dice: {
    main: { roll: [1, 1], modifier: [], modValues: [], total: 0 },
    defend: null
  },
  board: [],
  mainDeck: {
    monsters: [monsterPile[0], monsterPile[0], monsterPile[0]],
    discardPile: [],
    preparedCard: null
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
    cachedEvent: [],
    toDiscard: 0,
    effect: null,
    phaseChanged: false,
    isRolling: false,
    pause: false
  }
};
