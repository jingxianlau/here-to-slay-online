"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialState = exports.monsterPile = exports.leaderPile = exports.deck = void 0;
const types_1 = require("../types");
const uuid_1 = require("uuid");
const leaderCards = [
    {
        name: 'The Charismatic Song',
        class: types_1.HeroClass.bard,
        type: types_1.CardType.large,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'The Cloaked Sage',
        class: types_1.HeroClass.wizard,
        type: types_1.CardType.large,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'The Divine Arrow',
        class: types_1.HeroClass.ranger,
        type: types_1.CardType.large,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'The Fist of Reason',
        class: types_1.HeroClass.fighter,
        type: types_1.CardType.large,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'The Protecting Horn',
        class: types_1.HeroClass.guardian,
        type: types_1.CardType.large,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'The Shadow Claw',
        class: types_1.HeroClass.thief,
        type: types_1.CardType.large,
        id: (0, uuid_1.v4)()
    }
];
const monsterCards = [
    {
        name: 'Anuran Cauldron',
        type: types_1.CardType.large,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Arctic Aries',
        type: types_1.CardType.large,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Bloodwing',
        type: types_1.CardType.large,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Orthus',
        type: types_1.CardType.large,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Corrupted Sabretooth',
        type: types_1.CardType.large,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Crowned Serpent',
        type: types_1.CardType.large,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Abyss Queen',
        type: types_1.CardType.large,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Dracos',
        type: types_1.CardType.large,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Dark Dragon King',
        type: types_1.CardType.large,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Malamammoth',
        type: types_1.CardType.large,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Rex Major',
        type: types_1.CardType.large,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Terratuga',
        type: types_1.CardType.large,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Mega Slime',
        type: types_1.CardType.large,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Titan Wyvern',
        type: types_1.CardType.large,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Warworn Owlbear',
        type: types_1.CardType.large,
        id: (0, uuid_1.v4)()
    }
];
const heroCards = [
    {
        name: 'Dodgy Dealer',
        class: types_1.HeroClass.bard,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Fuzzy Cheeks',
        class: types_1.HeroClass.bard,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Greedy Cheeks',
        class: types_1.HeroClass.bard,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Lucky Buddy',
        class: types_1.HeroClass.bard,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Mellow Dee',
        class: types_1.HeroClass.bard,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Napping Nibbles',
        class: types_1.HeroClass.bard,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Peanut',
        class: types_1.HeroClass.bard,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Tipsy Tootie',
        class: types_1.HeroClass.bard,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Bad Axe',
        class: types_1.HeroClass.fighter,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Bear Claw',
        class: types_1.HeroClass.fighter,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Beary Wise',
        class: types_1.HeroClass.fighter,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Fury Knuckle',
        class: types_1.HeroClass.fighter,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Heavy Bear',
        class: types_1.HeroClass.fighter,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Pan Chucks',
        class: types_1.HeroClass.fighter,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Qi Bear',
        class: types_1.HeroClass.fighter,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Tough Teddy',
        class: types_1.HeroClass.fighter,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Calming Voice',
        class: types_1.HeroClass.guardian,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Guiding Light',
        class: types_1.HeroClass.guardian,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Holy Curselifter',
        class: types_1.HeroClass.guardian,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Iron Resolve',
        class: types_1.HeroClass.guardian,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Might Blade',
        class: types_1.HeroClass.guardian,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Radiant Horn',
        class: types_1.HeroClass.guardian,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Vibrant Glow',
        class: types_1.HeroClass.guardian,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Wise Shield',
        class: types_1.HeroClass.guardian,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Bullseye',
        class: types_1.HeroClass.ranger,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Hook',
        class: types_1.HeroClass.ranger,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Lookie Rookie',
        class: types_1.HeroClass.ranger,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Quick Draw',
        class: types_1.HeroClass.ranger,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Serious Grey',
        class: types_1.HeroClass.ranger,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Sharp Fox',
        class: types_1.HeroClass.ranger,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Wildshot',
        class: types_1.HeroClass.ranger,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Wily Red',
        class: types_1.HeroClass.ranger,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Kit Napper',
        class: types_1.HeroClass.thief,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Meowzio',
        class: types_1.HeroClass.thief,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Plundering Puma',
        class: types_1.HeroClass.thief,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Shuri Kitty',
        class: types_1.HeroClass.thief,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Silent Shadow',
        class: types_1.HeroClass.thief,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Slippery Paws',
        class: types_1.HeroClass.thief,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Sly Pickings',
        class: types_1.HeroClass.thief,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Smooth Mimimeow',
        class: types_1.HeroClass.thief,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Bun Bun',
        class: types_1.HeroClass.wizard,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Buttons',
        class: types_1.HeroClass.wizard,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Fluffy',
        class: types_1.HeroClass.wizard,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Hopper',
        class: types_1.HeroClass.wizard,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Snowball',
        class: types_1.HeroClass.wizard,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Spooky',
        class: types_1.HeroClass.wizard,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Whiskers',
        class: types_1.HeroClass.wizard,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Wiggles',
        class: types_1.HeroClass.wizard,
        type: types_1.CardType.hero,
        id: (0, uuid_1.v4)()
    }
];
const itemCards = [
    {
        name: 'bard Mask',
        type: types_1.CardType.item,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Decoy Doll',
        type: types_1.CardType.item,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'fighter Mask',
        type: types_1.CardType.item,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'guardian Mask',
        type: types_1.CardType.item,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Particularly Rusty Coin',
        type: types_1.CardType.item,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Particularly Rusty Coin',
        type: types_1.CardType.item,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'ranger Mask',
        type: types_1.CardType.item,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Really Big Ring',
        type: types_1.CardType.item,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Really Big Ring',
        type: types_1.CardType.item,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'thief Mask',
        type: types_1.CardType.item,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'wizard Mask',
        type: types_1.CardType.item,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Suspiciously Shiny Coin',
        type: types_1.CardType.item,
        id: (0, uuid_1.v4)()
    },
    {
        name: "Curse of the Snake's Eye",
        type: types_1.CardType.item,
        id: (0, uuid_1.v4)()
    },
    {
        name: "Curse of the Snake's Eye",
        type: types_1.CardType.item,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Sealing Key',
        type: types_1.CardType.item,
        id: (0, uuid_1.v4)()
    }
];
const modifierCards = [
    {
        name: 'modifier',
        modifier: [+1, -3],
        type: types_1.CardType.modifier,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'modifier',
        modifier: [+1, -3],
        type: types_1.CardType.modifier,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'modifier',
        modifier: [+1, -3],
        type: types_1.CardType.modifier,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'modifier',
        modifier: [+1, -3],
        type: types_1.CardType.modifier,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'modifier',
        modifier: [2, -2],
        type: types_1.CardType.modifier,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'modifier',
        modifier: [2, -2],
        type: types_1.CardType.modifier,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'modifier',
        modifier: [2, -2],
        type: types_1.CardType.modifier,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'modifier',
        modifier: [2, -2],
        type: types_1.CardType.modifier,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'modifier',
        modifier: [2, -2],
        type: types_1.CardType.modifier,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'modifier',
        modifier: [2, -2],
        type: types_1.CardType.modifier,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'modifier',
        modifier: [2, -2],
        type: types_1.CardType.modifier,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'modifier',
        modifier: [2, -2],
        type: types_1.CardType.modifier,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'modifier',
        modifier: [2, -2],
        type: types_1.CardType.modifier,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'modifier',
        modifier: [3, -1],
        type: types_1.CardType.modifier,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'modifier',
        modifier: [3, -1],
        type: types_1.CardType.modifier,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'modifier',
        modifier: [3, -1],
        type: types_1.CardType.modifier,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'modifier',
        modifier: [3, -1],
        type: types_1.CardType.modifier,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'modifier',
        modifier: [4],
        type: types_1.CardType.modifier,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'modifier',
        modifier: [4],
        type: types_1.CardType.modifier,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'modifier',
        modifier: [4],
        type: types_1.CardType.modifier,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'modifier',
        modifier: [4],
        type: types_1.CardType.modifier,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'modifier',
        modifier: [-4],
        type: types_1.CardType.modifier,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'modifier',
        modifier: [-4],
        type: types_1.CardType.modifier,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'modifier',
        modifier: [-4],
        type: types_1.CardType.modifier,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'modifier',
        modifier: [-4],
        type: types_1.CardType.modifier,
        id: (0, uuid_1.v4)()
    }
];
const challengeCard = [
    {
        name: 'challenge',
        type: types_1.CardType.challenge,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'challenge',
        type: types_1.CardType.challenge,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'challenge',
        type: types_1.CardType.challenge,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'challenge',
        type: types_1.CardType.challenge,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'challenge',
        type: types_1.CardType.challenge,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'challenge',
        type: types_1.CardType.challenge,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'challenge',
        type: types_1.CardType.challenge,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'challenge',
        type: types_1.CardType.challenge,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'challenge',
        type: types_1.CardType.challenge,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'challenge',
        type: types_1.CardType.challenge,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'challenge',
        type: types_1.CardType.challenge,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'challenge',
        type: types_1.CardType.challenge,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'challenge',
        type: types_1.CardType.challenge,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'challenge',
        type: types_1.CardType.challenge,
        id: (0, uuid_1.v4)()
    }
];
const magicCards = [
    {
        name: 'Call to the Fallen',
        type: types_1.CardType.magic,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Critical Boost',
        type: types_1.CardType.magic,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Destructive Spell',
        type: types_1.CardType.magic,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Enchanted Spell',
        type: types_1.CardType.magic,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Entangling Trap',
        type: types_1.CardType.magic,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Critical Boost',
        type: types_1.CardType.magic,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Destructive Spell',
        type: types_1.CardType.magic,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Enchanted Spell',
        type: types_1.CardType.magic,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Entangling Trap',
        type: types_1.CardType.magic,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Forced Exchange',
        type: types_1.CardType.magic,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Forceful Winds',
        type: types_1.CardType.magic,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Winds of Change',
        type: types_1.CardType.magic,
        id: (0, uuid_1.v4)()
    },
    {
        name: 'Winds of Change',
        type: types_1.CardType.magic,
        id: (0, uuid_1.v4)()
    }
];
exports.deck = [
    ...heroCards,
    ...itemCards,
    ...magicCards,
    ...modifierCards,
    ...challengeCard
];
exports.leaderPile = [...leaderCards];
exports.monsterPile = [...monsterCards];
exports.initialState = {
    secret: {
        deck: exports.deck,
        leaderPile: exports.leaderPile,
        discardPile: [],
        monsterPile: exports.monsterPile,
        playerIds: [],
        playerSocketIds: []
    },
    players: [],
    dice: {
        main: { roll: [1, 1], modifier: 0, total: 0 },
        defend: null
    },
    board: [],
    mainDeck: {
        monsters: [exports.monsterPile[0], exports.monsterPile[0], exports.monsterPile[0]],
        preparedCard: null
    },
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
//# sourceMappingURL=cards.js.map