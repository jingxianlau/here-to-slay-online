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
  AnyCard
} from '../types';
import { v4 as UUID } from 'uuid';

// ALL CARDS (BASE GAME)
export const leaderCards: LeaderCard[] = [
  {
    name: 'The Charismatic Song',
    class: HeroClass.Bard,
    type: CardType.Large,
    id: UUID()
  },
  {
    name: 'The Cloaked Sage',
    class: HeroClass.Wizard,
    type: CardType.Large,
    id: UUID()
  },
  {
    name: 'The Divine Arrow',
    class: HeroClass.Ranger,
    type: CardType.Large,
    id: UUID()
  },
  {
    name: 'The Fist of Reason',
    class: HeroClass.Fighter,
    type: CardType.Large,
    id: UUID()
  },
  {
    name: 'The Protecting Horn',
    class: HeroClass.Guardian,
    type: CardType.Large,
    id: UUID()
  },
  {
    name: 'The Shadow Claw',
    class: HeroClass.Thief,
    type: CardType.Large,
    id: UUID()
  }
];

export const monsterCards: MonsterCard[] = [
  {
    name: 'Anuran Cauldron',
    type: CardType.Large
  },
  {
    name: 'Artic Aries',
    type: CardType.Large
  },
  {
    name: 'Bloodwing',
    type: CardType.Large
  },
  {
    name: 'Orthus',
    type: CardType.Large
  },
  {
    name: 'Corrupted Sabretooth',
    type: CardType.Large
  },
  {
    name: 'Crowned Serpent',
    type: CardType.Large
  },
  {
    name: 'Abyss Queen',
    type: CardType.Large
  },
  {
    name: 'Dracos',
    type: CardType.Large
  },
  {
    name: 'Dark Dragon King',
    type: CardType.Large
  },
  {
    name: 'Malamammoth',
    type: CardType.Large
  },
  {
    name: 'Rex Major',
    type: CardType.Large
  },
  {
    name: 'Terratuga',
    type: CardType.Large
  },
  {
    name: 'Mega Slime',
    type: CardType.Large
  },
  {
    name: 'Titan Wyvern',
    type: CardType.Large
  },
  {
    name: 'Warworn Owlbear',
    type: CardType.Large
  }
];

export const heroCards: HeroCard[] = [
  // Bards
  {
    name: 'Dodgy Dealer',
    class: HeroClass.Bard,
    type: CardType.Hero
  },
  {
    name: 'Fuzzy Cheeks',
    class: HeroClass.Bard,
    type: CardType.Hero
  },
  {
    name: 'Greedy Cheeks',
    class: HeroClass.Bard,
    type: CardType.Hero
  },
  {
    name: 'Lucky Buddy',
    class: HeroClass.Bard,
    type: CardType.Hero
  },
  {
    name: 'Mellow Dee',
    class: HeroClass.Bard,
    type: CardType.Hero
  },
  {
    name: 'Napping Nibbles',
    class: HeroClass.Bard,
    type: CardType.Hero
  },
  {
    name: 'Peanut',
    class: HeroClass.Bard,
    type: CardType.Hero
  },
  {
    name: 'Tipsy Tootie',
    class: HeroClass.Bard,
    type: CardType.Hero
  },
  // Fighters
  {
    name: 'Bad Axe',
    class: HeroClass.Fighter,
    type: CardType.Hero
  },
  {
    name: 'Bear Claw',
    class: HeroClass.Fighter,
    type: CardType.Hero
  },
  {
    name: 'Beary Wise',
    class: HeroClass.Fighter,
    type: CardType.Hero
  },
  {
    name: 'Fury Knuckle',
    class: HeroClass.Fighter,
    type: CardType.Hero
  },
  {
    name: 'Heavy Bear',
    class: HeroClass.Fighter,
    type: CardType.Hero
  },
  {
    name: 'Pan Chucks',
    class: HeroClass.Fighter,
    type: CardType.Hero
  },
  {
    name: 'Qi Bear',
    class: HeroClass.Fighter,
    type: CardType.Hero
  },
  {
    name: 'Tough Teddy',
    class: HeroClass.Fighter,
    type: CardType.Hero
  },
  // Guardian
  {
    name: 'Calming Voice',
    class: HeroClass.Guardian,
    type: CardType.Hero
  },
  {
    name: 'Guiding Light',
    class: HeroClass.Guardian,
    type: CardType.Hero
  },
  {
    name: 'Holy Curselifter',
    class: HeroClass.Guardian,
    type: CardType.Hero
  },
  {
    name: 'Iron Resolve',
    class: HeroClass.Guardian,
    type: CardType.Hero
  },
  {
    name: 'Might Blade',
    class: HeroClass.Guardian,
    type: CardType.Hero
  },
  {
    name: 'Radiant Horn',
    class: HeroClass.Guardian,
    type: CardType.Hero
  },
  {
    name: 'Vibrant Glow',
    class: HeroClass.Guardian,
    type: CardType.Hero
  },
  {
    name: 'Wise Shield',
    class: HeroClass.Guardian,
    type: CardType.Hero
  },
  // Rangers
  {
    name: 'Bullseye',
    class: HeroClass.Ranger,
    type: CardType.Hero
  },
  {
    name: 'Hook',
    class: HeroClass.Ranger,
    type: CardType.Hero
  },
  {
    name: 'Lookie Rookie',
    class: HeroClass.Ranger,
    type: CardType.Hero
  },
  {
    name: 'Quick Draw',
    class: HeroClass.Ranger,
    type: CardType.Hero
  },
  {
    name: 'Serious Grey',
    class: HeroClass.Ranger,
    type: CardType.Hero
  },
  {
    name: 'Sharp Fox',
    class: HeroClass.Ranger,
    type: CardType.Hero
  },
  {
    name: 'Wildshot',
    class: HeroClass.Ranger,
    type: CardType.Hero
  },
  {
    name: 'Wily Red',
    class: HeroClass.Ranger,
    type: CardType.Hero
  },
  // Thieves
  {
    name: 'Kit Napper',
    class: HeroClass.Thief,
    type: CardType.Hero
  },
  {
    name: 'Meowzio',
    class: HeroClass.Thief,
    type: CardType.Hero
  },
  {
    name: 'Plundering Puma',
    class: HeroClass.Thief,
    type: CardType.Hero
  },
  {
    name: 'Shuri Kitty',
    class: HeroClass.Thief,
    type: CardType.Hero
  },
  {
    name: 'Silent Shadow',
    class: HeroClass.Thief,
    type: CardType.Hero
  },
  {
    name: 'Slippery Paws',
    class: HeroClass.Thief,
    type: CardType.Hero
  },
  {
    name: 'Sly Pickings',
    class: HeroClass.Thief,
    type: CardType.Hero
  },
  {
    name: 'Smooth Mimimeow',
    class: HeroClass.Thief,
    type: CardType.Hero
  },
  // Wizard
  {
    name: 'Bun Bun',
    class: HeroClass.Wizard,
    type: CardType.Hero
  },
  {
    name: 'Buttons',
    class: HeroClass.Wizard,
    type: CardType.Hero
  },
  {
    name: 'Fluffy',
    class: HeroClass.Wizard,
    type: CardType.Hero
  },
  {
    name: 'Hopper',
    class: HeroClass.Wizard,
    type: CardType.Hero
  },
  {
    name: 'Snowball',
    class: HeroClass.Wizard,
    type: CardType.Hero
  },
  {
    name: 'Spooky',
    class: HeroClass.Wizard,
    type: CardType.Hero
  },
  {
    name: 'Whiskers',
    class: HeroClass.Wizard,
    type: CardType.Hero
  },
  {
    name: 'Wiggles',
    class: HeroClass.Wizard,
    type: CardType.Hero
  }
];

export const itemCards: ItemCard[] = [
  {
    name: 'Bard Mask',
    type: CardType.Item
  },
  {
    name: 'Decoy Doll',
    type: CardType.Item
  },
  {
    name: 'Fighter Mask',
    type: CardType.Item
  },
  {
    name: 'Guardian Mask',
    type: CardType.Item
  },
  {
    name: 'Particularly Rusty Coin',
    type: CardType.Item
  },
  {
    name: 'Particularly Rusty Coin',
    type: CardType.Item
  },
  {
    name: 'Ranger Mask',
    type: CardType.Item
  },
  {
    name: 'Really Big Ring',
    type: CardType.Item
  },
  {
    name: 'Really Big Ring',
    type: CardType.Item
  },
  {
    name: 'Thief Mask',
    type: CardType.Item
  },
  {
    name: 'Wizard Mask',
    type: CardType.Item
  },
  {
    name: 'Suspiciously Shiny Coin',
    type: CardType.Item
  },
  {
    name: "Curse of the Snake's Eye",
    type: CardType.Item
  },
  {
    name: "Curse of the Snake's Eye",
    type: CardType.Item
  },
  {
    name: 'Sealing Key',
    type: CardType.Item
  }
];

export const modifierCards: ModifierCard[] = [
  {
    name: 'modifier',
    modifier: [+1, -3],
    type: CardType.Modifier
  },
  {
    name: 'modifier',
    modifier: [+1, -3],
    type: CardType.Modifier
  },
  {
    name: 'modifier',
    modifier: [+1, -3],
    type: CardType.Modifier
  },
  {
    name: 'modifier',
    modifier: [+1, -3],
    type: CardType.Modifier
  },
  {
    name: 'modifier',
    modifier: [2, -2],
    type: CardType.Modifier
  },
  {
    name: 'modifier',
    modifier: [2, -2],
    type: CardType.Modifier
  },
  {
    name: 'modifier',
    modifier: [2, -2],
    type: CardType.Modifier
  },
  {
    name: 'modifier',
    modifier: [2, -2],
    type: CardType.Modifier
  },
  {
    name: 'modifier',
    modifier: [2, -2],
    type: CardType.Modifier
  },
  {
    name: 'modifier',
    modifier: [2, -2],
    type: CardType.Modifier
  },
  {
    name: 'modifier',
    modifier: [2, -2],
    type: CardType.Modifier
  },
  {
    name: 'modifier',
    modifier: [2, -2],
    type: CardType.Modifier
  },
  {
    name: 'modifier',
    modifier: [2, -2],
    type: CardType.Modifier
  },
  {
    name: 'modifier',
    modifier: [3, -1],
    type: CardType.Modifier
  },
  {
    name: 'modifier',
    modifier: [3, -1],
    type: CardType.Modifier
  },
  {
    name: 'modifier',
    modifier: [3, -1],
    type: CardType.Modifier
  },
  {
    name: 'modifier',
    modifier: [3, -1],
    type: CardType.Modifier
  },
  {
    name: 'modifier',
    modifier: [4],
    type: CardType.Modifier
  },
  {
    name: 'modifier',
    modifier: [4],
    type: CardType.Modifier
  },
  {
    name: 'modifier',
    modifier: [4],
    type: CardType.Modifier
  },
  {
    name: 'modifier',
    modifier: [4],
    type: CardType.Modifier
  },
  {
    name: 'modifier',
    modifier: [-4],
    type: CardType.Modifier
  },
  {
    name: 'modifier',
    modifier: [-4],
    type: CardType.Modifier
  },
  {
    name: 'modifier',
    modifier: [-4],
    type: CardType.Modifier
  },
  {
    name: 'modifier',
    modifier: [-4],
    type: CardType.Modifier
  }
];

export const challengeCard: ChallengeCard[] = [
  {
    name: 'challenge',
    type: CardType.Challenge
  },
  {
    name: 'challenge',
    type: CardType.Challenge
  },
  {
    name: 'challenge',
    type: CardType.Challenge
  },
  {
    name: 'challenge',
    type: CardType.Challenge
  },
  {
    name: 'challenge',
    type: CardType.Challenge
  },
  {
    name: 'challenge',
    type: CardType.Challenge
  },
  {
    name: 'challenge',
    type: CardType.Challenge
  },
  {
    name: 'challenge',
    type: CardType.Challenge
  },
  {
    name: 'challenge',
    type: CardType.Challenge
  },
  {
    name: 'challenge',
    type: CardType.Challenge
  },
  {
    name: 'challenge',
    type: CardType.Challenge
  },
  {
    name: 'challenge',
    type: CardType.Challenge
  },
  {
    name: 'challenge',
    type: CardType.Challenge
  },
  {
    name: 'challenge',
    type: CardType.Challenge
  }
];

export const magicCards: MagicCard[] = [
  {
    name: 'Call to the Fallen',
    type: CardType.Magic
  },
  {
    name: 'Critical Boost',
    type: CardType.Magic
  },
  {
    name: 'Destructive Spell',
    type: CardType.Magic
  },
  {
    name: 'Enchanted Spell',
    type: CardType.Magic
  },
  {
    name: 'Entangling Trap',
    type: CardType.Magic
  },
  {
    name: 'Critical Boost',
    type: CardType.Magic
  },
  {
    name: 'Destructive Spell',
    type: CardType.Magic
  },
  {
    name: 'Enchanted Spell',
    type: CardType.Magic
  },
  {
    name: 'Entangling Trap',
    type: CardType.Magic
  },
  {
    name: 'Forced Exchange',
    type: CardType.Magic
  },
  {
    name: 'Forceful Winds',
    type: CardType.Magic
  },
  {
    name: 'Winds of Change',
    type: CardType.Magic
  },
  {
    name: 'Winds of Change',
    type: CardType.Magic
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
