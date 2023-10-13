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
} from '../types';
import { v4 as uuid } from 'uuid';

// ALL CARDS (BASE GAME)
const leaderCards: LeaderCard[] = [
  {
    name: 'The Charismatic Song',
    class: HeroClass.Bard,
    type: CardType.Large,
    id: uuid()
  },
  {
    name: 'The Cloaked Sage',
    class: HeroClass.Wizard,
    type: CardType.Large,
    id: uuid()
  },
  {
    name: 'The Divine Arrow',
    class: HeroClass.Ranger,
    type: CardType.Large,
    id: uuid()
  },
  {
    name: 'The Fist of Reason',
    class: HeroClass.Fighter,
    type: CardType.Large,
    id: uuid()
  },
  {
    name: 'The Protecting Horn',
    class: HeroClass.Guardian,
    type: CardType.Large,
    id: uuid()
  },
  {
    name: 'The Shadow Claw',
    class: HeroClass.Thief,
    type: CardType.Large,
    id: uuid()
  }
];

const monsterCards: MonsterCard[] = [
  {
    name: 'Anuran Cauldron',
    type: CardType.Large,
    id: uuid()
  },
  {
    name: 'Artic Aries',
    type: CardType.Large,
    id: uuid()
  },
  {
    name: 'Bloodwing',
    type: CardType.Large,
    id: uuid()
  },
  {
    name: 'Orthus',
    type: CardType.Large,
    id: uuid()
  },
  {
    name: 'Corrupted Sabretooth',
    type: CardType.Large,
    id: uuid()
  },
  {
    name: 'Crowned Serpent',
    type: CardType.Large,
    id: uuid()
  },
  {
    name: 'Abyss Queen',
    type: CardType.Large,
    id: uuid()
  },
  {
    name: 'Dracos',
    type: CardType.Large,
    id: uuid()
  },
  {
    name: 'Dark Dragon King',
    type: CardType.Large,
    id: uuid()
  },
  {
    name: 'Malamammoth',
    type: CardType.Large,
    id: uuid()
  },
  {
    name: 'Rex Major',
    type: CardType.Large,
    id: uuid()
  },
  {
    name: 'Terratuga',
    type: CardType.Large,
    id: uuid()
  },
  {
    name: 'Mega Slime',
    type: CardType.Large,
    id: uuid()
  },
  {
    name: 'Titan Wyvern',
    type: CardType.Large,
    id: uuid()
  },
  {
    name: 'Warworn Owlbear',
    type: CardType.Large,
    id: uuid()
  }
];

const heroCards: HeroCard[] = [
  // Bards
  {
    name: 'Dodgy Dealer',
    class: HeroClass.Bard,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Fuzzy Cheeks',
    class: HeroClass.Bard,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Greedy Cheeks',
    class: HeroClass.Bard,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Lucky Buddy',
    class: HeroClass.Bard,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Mellow Dee',
    class: HeroClass.Bard,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Napping Nibbles',
    class: HeroClass.Bard,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Peanut',
    class: HeroClass.Bard,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Tipsy Tootie',
    class: HeroClass.Bard,
    type: CardType.Hero,
    id: uuid()
  },
  // Fighters
  {
    name: 'Bad Axe',
    class: HeroClass.Fighter,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Bear Claw',
    class: HeroClass.Fighter,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Beary Wise',
    class: HeroClass.Fighter,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Fury Knuckle',
    class: HeroClass.Fighter,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Heavy Bear',
    class: HeroClass.Fighter,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Pan Chucks',
    class: HeroClass.Fighter,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Qi Bear',
    class: HeroClass.Fighter,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Tough Teddy',
    class: HeroClass.Fighter,
    type: CardType.Hero,
    id: uuid()
  },
  // Guardian
  {
    name: 'Calming Voice',
    class: HeroClass.Guardian,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Guiding Light',
    class: HeroClass.Guardian,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Holy Curselifter',
    class: HeroClass.Guardian,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Iron Resolve',
    class: HeroClass.Guardian,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Might Blade',
    class: HeroClass.Guardian,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Radiant Horn',
    class: HeroClass.Guardian,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Vibrant Glow',
    class: HeroClass.Guardian,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Wise Shield',
    class: HeroClass.Guardian,
    type: CardType.Hero,
    id: uuid()
  },
  // Rangers
  {
    name: 'Bullseye',
    class: HeroClass.Ranger,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Hook',
    class: HeroClass.Ranger,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Lookie Rookie',
    class: HeroClass.Ranger,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Quick Draw',
    class: HeroClass.Ranger,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Serious Grey',
    class: HeroClass.Ranger,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Sharp Fox',
    class: HeroClass.Ranger,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Wildshot',
    class: HeroClass.Ranger,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Wily Red',
    class: HeroClass.Ranger,
    type: CardType.Hero,
    id: uuid()
  },
  // Thieves
  {
    name: 'Kit Napper',
    class: HeroClass.Thief,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Meowzio',
    class: HeroClass.Thief,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Plundering Puma',
    class: HeroClass.Thief,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Shuri Kitty',
    class: HeroClass.Thief,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Silent Shadow',
    class: HeroClass.Thief,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Slippery Paws',
    class: HeroClass.Thief,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Sly Pickings',
    class: HeroClass.Thief,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Smooth Mimimeow',
    class: HeroClass.Thief,
    type: CardType.Hero,
    id: uuid()
  },
  // Wizard
  {
    name: 'Bun Bun',
    class: HeroClass.Wizard,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Buttons',
    class: HeroClass.Wizard,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Fluffy',
    class: HeroClass.Wizard,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Hopper',
    class: HeroClass.Wizard,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Snowball',
    class: HeroClass.Wizard,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Spooky',
    class: HeroClass.Wizard,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Whiskers',
    class: HeroClass.Wizard,
    type: CardType.Hero,
    id: uuid()
  },
  {
    name: 'Wiggles',
    class: HeroClass.Wizard,
    type: CardType.Hero,
    id: uuid()
  }
];

const itemCards: ItemCard[] = [
  {
    name: 'Bard Mask',
    type: CardType.Item,
    id: uuid()
  },
  {
    name: 'Decoy Doll',
    type: CardType.Item,
    id: uuid()
  },
  {
    name: 'Fighter Mask',
    type: CardType.Item,
    id: uuid()
  },
  {
    name: 'Guardian Mask',
    type: CardType.Item,
    id: uuid()
  },
  {
    name: 'Particularly Rusty Coin',
    type: CardType.Item,
    id: uuid()
  },
  {
    name: 'Particularly Rusty Coin',
    type: CardType.Item,
    id: uuid()
  },
  {
    name: 'Ranger Mask',
    type: CardType.Item,
    id: uuid()
  },
  {
    name: 'Really Big Ring',
    type: CardType.Item,
    id: uuid()
  },
  {
    name: 'Really Big Ring',
    type: CardType.Item,
    id: uuid()
  },
  {
    name: 'Thief Mask',
    type: CardType.Item,
    id: uuid()
  },
  {
    name: 'Wizard Mask',
    type: CardType.Item,
    id: uuid()
  },
  {
    name: 'Suspiciously Shiny Coin',
    type: CardType.Item,
    id: uuid()
  },
  {
    name: "Curse of the Snake's Eye",
    type: CardType.Item,
    id: uuid()
  },
  {
    name: "Curse of the Snake's Eye",
    type: CardType.Item,
    id: uuid()
  },
  {
    name: 'Sealing Key',
    type: CardType.Item,
    id: uuid()
  }
];

const modifierCards: ModifierCard[] = [
  {
    name: 'modifier',
    modifier: [+1, -3],
    type: CardType.Modifier,
    id: uuid()
  },
  {
    name: 'modifier',
    modifier: [+1, -3],
    type: CardType.Modifier,
    id: uuid()
  },
  {
    name: 'modifier',
    modifier: [+1, -3],
    type: CardType.Modifier,
    id: uuid()
  },
  {
    name: 'modifier',
    modifier: [+1, -3],
    type: CardType.Modifier,
    id: uuid()
  },
  {
    name: 'modifier',
    modifier: [2, -2],
    type: CardType.Modifier,
    id: uuid()
  },
  {
    name: 'modifier',
    modifier: [2, -2],
    type: CardType.Modifier,
    id: uuid()
  },
  {
    name: 'modifier',
    modifier: [2, -2],
    type: CardType.Modifier,
    id: uuid()
  },
  {
    name: 'modifier',
    modifier: [2, -2],
    type: CardType.Modifier,
    id: uuid()
  },
  {
    name: 'modifier',
    modifier: [2, -2],
    type: CardType.Modifier,
    id: uuid()
  },
  {
    name: 'modifier',
    modifier: [2, -2],
    type: CardType.Modifier,
    id: uuid()
  },
  {
    name: 'modifier',
    modifier: [2, -2],
    type: CardType.Modifier,
    id: uuid()
  },
  {
    name: 'modifier',
    modifier: [2, -2],
    type: CardType.Modifier,
    id: uuid()
  },
  {
    name: 'modifier',
    modifier: [2, -2],
    type: CardType.Modifier,
    id: uuid()
  },
  {
    name: 'modifier',
    modifier: [3, -1],
    type: CardType.Modifier,
    id: uuid()
  },
  {
    name: 'modifier',
    modifier: [3, -1],
    type: CardType.Modifier,
    id: uuid()
  },
  {
    name: 'modifier',
    modifier: [3, -1],
    type: CardType.Modifier,
    id: uuid()
  },
  {
    name: 'modifier',
    modifier: [3, -1],
    type: CardType.Modifier,
    id: uuid()
  },
  {
    name: 'modifier',
    modifier: [4],
    type: CardType.Modifier,
    id: uuid()
  },
  {
    name: 'modifier',
    modifier: [4],
    type: CardType.Modifier,
    id: uuid()
  },
  {
    name: 'modifier',
    modifier: [4],
    type: CardType.Modifier,
    id: uuid()
  },
  {
    name: 'modifier',
    modifier: [4],
    type: CardType.Modifier,
    id: uuid()
  },
  {
    name: 'modifier',
    modifier: [-4],
    type: CardType.Modifier,
    id: uuid()
  },
  {
    name: 'modifier',
    modifier: [-4],
    type: CardType.Modifier,
    id: uuid()
  },
  {
    name: 'modifier',
    modifier: [-4],
    type: CardType.Modifier,
    id: uuid()
  },
  {
    name: 'modifier',
    modifier: [-4],
    type: CardType.Modifier,
    id: uuid()
  }
];

const challengeCard: ChallengeCard[] = [
  {
    name: 'challenge',
    type: CardType.Challenge,
    id: uuid()
  },
  {
    name: 'challenge',
    type: CardType.Challenge,
    id: uuid()
  },
  {
    name: 'challenge',
    type: CardType.Challenge,
    id: uuid()
  },
  {
    name: 'challenge',
    type: CardType.Challenge,
    id: uuid()
  },
  {
    name: 'challenge',
    type: CardType.Challenge,
    id: uuid()
  },
  {
    name: 'challenge',
    type: CardType.Challenge,
    id: uuid()
  },
  {
    name: 'challenge',
    type: CardType.Challenge,
    id: uuid()
  },
  {
    name: 'challenge',
    type: CardType.Challenge,
    id: uuid()
  },
  {
    name: 'challenge',
    type: CardType.Challenge,
    id: uuid()
  },
  {
    name: 'challenge',
    type: CardType.Challenge,
    id: uuid()
  },
  {
    name: 'challenge',
    type: CardType.Challenge,
    id: uuid()
  },
  {
    name: 'challenge',
    type: CardType.Challenge,
    id: uuid()
  },
  {
    name: 'challenge',
    type: CardType.Challenge,
    id: uuid()
  },
  {
    name: 'challenge',
    type: CardType.Challenge,
    id: uuid()
  }
];

const magicCards: MagicCard[] = [
  {
    name: 'Call to the Fallen',
    type: CardType.Magic,
    id: uuid()
  },
  {
    name: 'Critical Boost',
    type: CardType.Magic,
    id: uuid()
  },
  {
    name: 'Destructive Spell',
    type: CardType.Magic,
    id: uuid()
  },
  {
    name: 'Enchanted Spell',
    type: CardType.Magic,
    id: uuid()
  },
  {
    name: 'Entangling Trap',
    type: CardType.Magic,
    id: uuid()
  },
  {
    name: 'Critical Boost',
    type: CardType.Magic,
    id: uuid()
  },
  {
    name: 'Destructive Spell',
    type: CardType.Magic,
    id: uuid()
  },
  {
    name: 'Enchanted Spell',
    type: CardType.Magic,
    id: uuid()
  },
  {
    name: 'Entangling Trap',
    type: CardType.Magic,
    id: uuid()
  },
  {
    name: 'Forced Exchange',
    type: CardType.Magic,
    id: uuid()
  },
  {
    name: 'Forceful Winds',
    type: CardType.Magic,
    id: uuid()
  },
  {
    name: 'Winds of Change',
    type: CardType.Magic,
    id: uuid()
  },
  {
    name: 'Winds of Change',
    type: CardType.Magic,
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
  players: [{ hand: [] }],

  // PUBLIC
  dice: {
    main: { roll: [0, 0], modifier: 0 },
    defend: null
  },
  board: [
    {
      classes: {
        FIGHTER: 0,
        BARD: 0,
        GUARDIAN: 0,
        RANGER: 0,
        THIEF: 0,
        WIZARD: 0
      },
      heroCards: [],
      largeCards: []
    }
  ],
  mainDeck: {
    monsters: [monsterPile[0], monsterPile[0], monsterPile[0]],
    preparedCard: null
  },

  // MATCH VARIABLES
  match: {
    gameStarted: false,
    players: [],
    player: 0,
    turnsLeft: 3,
    phase: 'start-roll',
    isRolling: false,
    isReady: [false]
  }
};
