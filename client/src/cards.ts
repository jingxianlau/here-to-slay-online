import {
  LeaderCard,
  HeroClass,
  CardType,
  MonsterCard,
  HeroCard,
  ItemCard,
  ModifierCard,
  ChallengeCard,
  MagicCard,
  AnyCard
} from './types';

// ALL CARDS (BASE GAME)
const leaderCards: LeaderCard[] = [
  {
    name: 'The Charismatic Song',
    class: HeroClass.bard,
    type: CardType.large,
    id: ''
  },
  {
    name: 'The Cloaked Sage',
    class: HeroClass.wizard,
    type: CardType.large,
    id: ''
  },
  {
    name: 'The Divine Arrow',
    class: HeroClass.ranger,
    type: CardType.large,
    id: ''
  },
  {
    name: 'The Fist of Reason',
    class: HeroClass.fighter,
    type: CardType.large,
    id: ''
  },
  {
    name: 'The Protecting Horn',
    class: HeroClass.guardian,
    type: CardType.large,
    id: ''
  },
  {
    name: 'The Shadow Claw',
    class: HeroClass.thief,
    type: CardType.large,
    id: ''
  }
];

const monsterCards: MonsterCard[] = [
  {
    name: 'Anuran Cauldron',
    type: CardType.large,
    id: '',
    punishment: 'monster-sacrifice'
  },
  {
    name: 'Arctic Aries',
    type: CardType.large,
    id: '',
    punishment: 'monster-sacrifice'
  },
  {
    name: 'Bloodwing',
    type: CardType.large,
    id: '',
    punishment: 'monster-sacrifice'
  },
  {
    name: 'Orthus',
    type: CardType.large,
    id: '',
    punishment: 'monster-discard'
  },
  {
    name: 'Corrupted Sabretooth',
    type: CardType.large,
    id: '',
    punishment: 'monster-sacrifice'
  },
  {
    name: 'Crowned Serpent',
    type: CardType.large,
    id: '',
    punishment: 'monster-sacrifice'
  },
  {
    name: 'Abyss Queen',
    type: CardType.large,
    id: '',
    punishment: 'monster-sacrifice'
  },
  {
    name: 'Dracos',
    type: CardType.large,
    id: '',
    punishment: 'monster-sacrifice'
  },
  {
    name: 'Dark Dragon King',
    type: CardType.large,
    id: '',
    punishment: 'monster-discard'
  },
  {
    name: 'Malamammoth',
    type: CardType.large,
    id: '',
    punishment: 'monster-discard'
  },
  {
    name: 'Rex Major',
    type: CardType.large,
    id: '',
    punishment: 'monster-discard'
  },
  {
    name: 'Terratuga',
    type: CardType.large,
    id: '',
    punishment: 'monster-sacrifice'
  },
  {
    name: 'Mega Slime',
    type: CardType.large,
    id: '',
    punishment: 'monster-sacrifice'
  },
  {
    name: 'Titan Wyvern',
    type: CardType.large,
    id: '',
    punishment: 'monster-discard'
  },
  {
    name: 'Warworn Owlbear',
    type: CardType.large,
    id: '',
    punishment: 'monster-discard'
  }
];

const heroCards: HeroCard[] = [
  // Bards
  {
    name: 'Dodgy Dealer',
    class: HeroClass.bard,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Fuzzy Cheeks',
    class: HeroClass.bard,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Greedy Cheeks',
    class: HeroClass.bard,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Lucky Bucky',
    class: HeroClass.bard,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Mellow Dee',
    class: HeroClass.bard,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Napping Nibbles',
    class: HeroClass.bard,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Peanut',
    class: HeroClass.bard,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Tipsy Tootie',
    class: HeroClass.bard,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  // fighters
  {
    name: 'Bad Axe',
    class: HeroClass.fighter,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Bear Claw',
    class: HeroClass.fighter,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Beary Wise',
    class: HeroClass.fighter,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Fury Knuckle',
    class: HeroClass.fighter,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Heavy Bear',
    class: HeroClass.fighter,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Pan Chucks',
    class: HeroClass.fighter,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Qi Bear',
    class: HeroClass.fighter,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Tough Teddy',
    class: HeroClass.fighter,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  // guardian
  {
    name: 'Calming Voice',
    class: HeroClass.guardian,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Guiding Light',
    class: HeroClass.guardian,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Holy Curselifter',
    class: HeroClass.guardian,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Iron Resolve',
    class: HeroClass.guardian,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Mighty Blade',
    class: HeroClass.guardian,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Radiant Horn',
    class: HeroClass.guardian,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Vibrant Glow',
    class: HeroClass.guardian,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Wise Shield',
    class: HeroClass.guardian,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  // rangers
  {
    name: 'Bullseye',
    class: HeroClass.ranger,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Hook',
    class: HeroClass.ranger,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Lookie Rookie',
    class: HeroClass.ranger,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Quick Draw',
    class: HeroClass.ranger,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Serious Grey',
    class: HeroClass.ranger,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Sharp Fox',
    class: HeroClass.ranger,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Wildshot',
    class: HeroClass.ranger,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Wily Red',
    class: HeroClass.ranger,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  // Thieves
  {
    name: 'Kit Napper',
    class: HeroClass.thief,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Meowzio',
    class: HeroClass.thief,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Plundering Puma',
    class: HeroClass.thief,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Shurikitty',
    class: HeroClass.thief,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Silent Shadow',
    class: HeroClass.thief,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Slippery Paws',
    class: HeroClass.thief,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Sly Pickings',
    class: HeroClass.thief,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Smooth Mimimeow',
    class: HeroClass.thief,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  // wizard
  {
    name: 'Bun Bun',
    class: HeroClass.wizard,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Buttons',
    class: HeroClass.wizard,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Fluffy',
    class: HeroClass.wizard,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Hopper',
    class: HeroClass.wizard,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Snowball',
    class: HeroClass.wizard,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Spooky',
    class: HeroClass.wizard,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Whiskers',
    class: HeroClass.wizard,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  },
  {
    name: 'Wiggles',
    class: HeroClass.wizard,
    type: CardType.hero,
    id: '',
    freeUse: false,
    abilityUsed: false
  }
];

const itemCards: ItemCard[] = [
  {
    name: 'Bard Mask',
    type: CardType.item,
    id: '',
    category: HeroClass.bard
  },
  {
    name: 'Decoy Doll',
    type: CardType.item,
    id: '',
    category: 'blessed'
  },
  {
    name: 'Fighter Mask',
    type: CardType.item,
    id: '',
    category: HeroClass.fighter
  },
  {
    name: 'Guardian Mask',
    type: CardType.item,
    id: '',
    category: HeroClass.guardian
  },
  {
    name: 'Particularly Rusty Coin',
    type: CardType.item,
    id: '',
    category: 'blessed'
  },
  {
    name: 'Ranger Mask',
    type: CardType.item,
    id: '',
    category: HeroClass.ranger
  },
  {
    name: 'Really Big Ring',
    type: CardType.item,
    id: '',
    category: 'blessed'
  },
  {
    name: 'Thief Mask',
    type: CardType.item,
    id: '',
    category: HeroClass.thief
  },
  {
    name: 'Wizard Mask',
    type: CardType.item,
    id: '',
    category: HeroClass.wizard
  },
  {
    name: 'Suspiciously Shiny Coin',
    type: CardType.item,
    id: '',
    category: 'cursed'
  },

  {
    name: "Curse of the Snake's Eyes",
    type: CardType.item,
    id: '',
    category: 'cursed'
  },
  {
    name: 'Sealing Key',
    type: CardType.item,
    id: '',
    category: 'cursed'
  }
];

const modifierCards: ModifierCard[] = [
  {
    name: '1-3',
    modifier: [1, -3],
    type: CardType.modifier,
    id: ''
  },
  {
    name: '2-2',
    modifier: [2, -2],
    type: CardType.modifier,
    id: ''
  },
  {
    name: '3-1',
    modifier: [3, -1],
    type: CardType.modifier,
    id: ''
  },
  {
    name: '0-4',
    modifier: [-4],
    type: CardType.modifier,
    id: ''
  }
];

const challengeCard: ChallengeCard[] = [
  {
    name: 'challenge',
    type: CardType.challenge,
    id: ''
  }
];

const magicCards: MagicCard[] = [
  {
    name: 'Call to the Fallen',
    type: CardType.magic,
    id: ''
  },
  {
    name: 'Critical Boost',
    type: CardType.magic,
    id: ''
  },
  {
    name: 'Destructive Spell',
    type: CardType.magic,
    id: ''
  },
  {
    name: 'Enchanted Spell',
    type: CardType.magic,
    id: ''
  },
  {
    name: 'Entangling Trap',
    type: CardType.magic,
    id: ''
  },
  {
    name: 'Forced Exchange',
    type: CardType.magic,
    id: ''
  },
  {
    name: 'Forceful Winds',
    type: CardType.magic,
    id: ''
  },
  {
    name: 'Winds of Change',
    type: CardType.magic,
    id: ''
  }
];

const others: string[] = [
  'https://jingxianlau.github.io/here-to-slay/assets/icons/bard.png',
  'https://jingxianlau.github.io/here-to-slay/assets/icons/fighter.png',
  'https://jingxianlau.github.io/here-to-slay/assets/icons/hero.png',
  'https://jingxianlau.github.io/here-to-slay/assets/icons/ranger.png',
  'https://jingxianlau.github.io/here-to-slay/assets/icons/guardian.png',
  'https://jingxianlau.github.io/here-to-slay/assets/icons/wizard.png',
  'https://jingxianlau.github.io/here-to-slay/assets/icons/thief.png',
  'https://jingxianlau.github.io/here-to-slay/assets/circle-star.svg',

  'https://jingxianlau.github.io/here-to-slay/assets/back/back-creme.png'
];

export const everyCard: (AnyCard | string)[] = [
  ...heroCards,
  ...itemCards,
  ...magicCards,
  ...modifierCards,
  ...challengeCard,
  ...leaderCards,
  ...monsterCards,
  ...others
];
