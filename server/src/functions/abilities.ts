import { endTurnDiscard } from '../controllers/socketio/game/useEffect';
import { rooms } from '../rooms';
import { sendGameState } from '../server';
import { AnyCard, CardType, HeroClass, allCards } from '../types';
import { addCards, drawCards, playCard, removeCard, swapHands } from './game';

const endEffect = (roomId: string, playerNum: number, updatePhase = true) => {
  setTimeout(() => {
    const state = rooms[roomId].state;
    state.turn.effect = null;
    if (updatePhase) {
      if (state.turn.movesLeft > 0) {
        state.turn.phase = 'play';
        state.turn.phaseChanged = true;
        sendGameState(roomId);
        state.turn.phaseChanged = false;
      } else endTurnDiscard(roomId, state.secret.playerIds[playerNum]);
    }
  }, 2400);
};

export const abilities: {
  [key: string]: ((
    roomId: string,
    playerNum: number,
    returnVal?: {
      card?: AnyCard;
      player?: number;
    },
    fromPlayer?: number
  ) => void)[];
} = {
  // trade hands with another player
  'dodgy-dealer': [
    (roomId, playerNum) => {
      const state = rooms[roomId].state;
      if (!state.turn.effect) return;
      state.turn.effect.action = 'choose-player';
      state.turn.effect.players = [playerNum];
      state.turn.effect.val = 1;
      state.turn.effect.purpose = 'Swap Hands';

      sendGameState(roomId);
    },
    (roomId, playerNum, returnVal) => {
      const state = rooms[roomId].state;
      if (!state.turn.effect || !returnVal || !returnVal.player) return;
      const userNum = returnVal.player;

      state.turn.effect.choice = [userNum];

      sendGameState(roomId);

      swapHands(state, playerNum, userNum);
      state.turn.effect.val--;

      setTimeout(() => {
        sendGameState(roomId);
      }, 600);
    },
    (roomId, playerNum) => endEffect(roomId, playerNum)
  ],
  // draw card and play hero;
  'fuzzy-cheeks': [
    (roomId, playerNum) => {
      const state = rooms[roomId].state;
      if (!state.turn.effect) return;
      state.turn.effect.action = 'draw';
      state.turn.effect.allowedCards = [];
      state.turn.effect.val = 1;
      state.turn.effect.players = [playerNum];
      state.turn.effect.purpose = 'Draw Card';
      sendGameState(roomId);
    },
    (roomId, playerNum) => {
      const state = rooms[roomId].state;
      if (!state.turn.effect) return;
      drawCards(roomId, playerNum, 1);
      state.turn.effect.val--;
    },
    (roomId, playerNum) => {
      const state = rooms[roomId].state;
      if (!state.turn.effect) return;
      state.turn.effect.action = 'choose-hand';
      state.turn.effect.allowedCards = [CardType.hero];
      state.turn.effect.val = 1;
      state.turn.effect.players = [playerNum];
      state.turn.effect.purpose = 'Play Hero';
      sendGameState(roomId);
    },
    (roomId, playerNum, returnVal) => {
      const state = rooms[roomId].state;
      if (!state.turn.effect) return;

      if (!returnVal?.card) {
        state.turn.effect.choice = [0];
        state.turn.effect.val--;
        sendGameState(roomId);
        endEffect(roomId, playerNum);
      } else if (
        returnVal &&
        returnVal.card &&
        returnVal.card.type === CardType.hero
      ) {
        state.turn.effect.choice = [returnVal.card];
        playCard(roomId, playerNum, returnVal.card, true);
        state.turn.effect.val--;
      }
    },
    (roomId, playerNum) => endEffect(roomId, playerNum, false)
  ],
  // each must give a card to player
  'greedy-cheeks': [
    (roomId, playerNum) => {
      const state = rooms[roomId].state;
      if (!state.turn.effect) return;

      state.turn.effect.action = 'choose-hand';
      state.turn.effect.allowedCards = allCards;
      state.turn.effect.purpose = 'Give Card';
      let players = [];
      for (let i = 0; i < rooms[roomId].numPlayers; i++) {
        if (i !== playerNum) {
          players.push(i);
        }
      }
      state.turn.effect.players = players;
      sendGameState(roomId);
    },
    (roomId, playerNum, returnVal, fromPlayer) => {
      const state = rooms[roomId].state;
      if (!state.turn.effect || !returnVal || !returnVal.card || !fromPlayer)
        return;

      const card = removeCard(roomId, fromPlayer, returnVal.card.id);
      if (card === -1) return;

      addCards(roomId, [card], playerNum);

      sendGameState(roomId);
    },
    (roomId, playerNum) => endEffect(roomId, playerNum)
  ]
};

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
