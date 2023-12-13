import { endTurnDiscard } from '../controllers/socketio/game/useEffect';
import { rooms } from '../rooms';
import { sendGameState } from '../server';
import { AnyCard, CardType, HeroClass, allCards } from '../types';
import {
  addCards,
  destroyCard,
  discardCard,
  drawCards,
  playCard,
  removeCard,
  removeCardIndex,
  swapCard,
  swapHands
} from './game';
import {
  addCard,
  choosePlayer,
  chooseReveal,
  chooseStealHero,
  chooseToAdd,
  destroyHero,
  discardCards,
  drawCard,
  eachOtherWithHeroInBoardDiscard,
  endEffect,
  ifMayPlay,
  pickFromHand,
  pickPlayer,
  playFromHand,
  pullIfPull,
  receiveDestroyHero,
  receiveDiscardCard,
  receivePlayer,
  stealHero
} from './abilitiesHelpers';
import { reshuffleDeck } from './gameHelpers';

export const heroAbilities: {
  [key: string]: ((
    roomId: string,
    playerNum: number,
    returnVal?: {
      card?: AnyCard;
      num?: number;
    },
    fromPlayer?: number
  ) => void)[];
} = {
  // BARDS
  // DONE
  'dodgy-dealer': [
    (roomId, playerNum) => choosePlayer(roomId, playerNum, 'Swap Hand'),
    (roomId, playerNum, returnVal) => {
      const state = rooms[roomId].state;
      if (!state.turn.effect || !returnVal || !returnVal.num) return;
      const userNum = returnVal.num;

      state.turn.effect.choice = [userNum];

      sendGameState(roomId);

      swapHands(state, playerNum, userNum);
      state.turn.effect.val.curr++;

      setTimeout(() => {
        sendGameState(roomId);
      }, 600);
    },
    (roomId, playerNum) => endEffect(roomId, playerNum)
  ],
  // DONE
  'fuzzy-cheeks': [
    ...drawCard(),
    ...playFromHand(CardType.hero),
    (roomId, playerNum) => endEffect(roomId, playerNum, false)
  ],
  // DONE
  'greedy-cheeks': [
    (roomId, playerNum) => {
      const state = rooms[roomId].state;
      if (!state.turn.effect) return;

      state.turn.effect.action = 'choose-hand';
      state.turn.effect.actionChanged = true;
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
  ],
  // DONE
  'lucky-bucky': [
    ...pickFromHand,
    ...ifMayPlay(CardType.hero),
    (roomId, playerNum) => endEffect(roomId, playerNum, false)
  ],
  // DONE
  'mellow-dee': [
    ...drawCard(),
    ...ifMayPlay(CardType.hero),
    (roomId, playerNum) => endEffect(roomId, playerNum, false)
  ],
  // DONE
  'napping-nibbles': [
    (roomId, playerNum) => {
      const state = rooms[roomId].state;
      if (!state.turn.effect) return;

      state.turn.effect.action = 'none';
      state.turn.effect.actionChanged = true;
      state.turn.effect.allowedCards = [];
      state.turn.effect.players = [];
      state.turn.effect.purpose = 'Do Nothing';
      sendGameState(roomId);

      setTimeout(() => {
        state.turn.effect = null;
        if (state.turn.movesLeft > 0) {
          state.turn.phase = 'play';
          state.turn.phaseChanged = true;
          sendGameState(roomId);
        } else endTurnDiscard(roomId, state.secret.playerIds[playerNum]);
      }, 5000);
    }
  ],
  // DONE
  peanut: [...drawCard(2), (roomId, playerNum) => endEffect(roomId, playerNum)],
  // DONE
  'tipsy-tootie': [
    chooseStealHero,
    (roomId, playerNum, returnVal) => {
      const state = rooms[roomId].state;
      if (
        !state.turn.effect ||
        !returnVal ||
        !returnVal.card ||
        returnVal.card.player === undefined ||
        returnVal.card.type !== CardType.hero ||
        returnVal.card.player === playerNum ||
        state.turn.effect.card.type !== CardType.hero ||
        state.turn.effect.card.player === undefined
      ) {
        console.log(returnVal, state.turn.effect);
        return;
      }

      state.turn.effect.choice = [returnVal.card];
      state.turn.effect.val.curr++;
      sendGameState(roomId);

      swapCard(
        roomId,
        playerNum,
        state.turn.effect.card,
        returnVal.card.player,
        returnVal.card
      );

      setTimeout(() => {
        sendGameState(roomId);
      }, 1200);
    },
    (roomId, playerNum) =>
      setTimeout(() => {
        endEffect(roomId, playerNum);
      }, 1200)
  ],

  // FIGHTERS
  // DONE
  'bad-axe': [
    ...destroyHero,
    (roomId, playerNum) =>
      setTimeout(() => {
        endEffect(roomId, playerNum);
      }, 1200)
  ],
  // DONE
  'bear-claw': pullIfPull(CardType.hero),
  // DONE
  'beary-wise': [
    (roomId, playerNum) => {
      const state = rooms[roomId].state;
      if (!state.turn.effect) return;

      state.turn.effect.action = 'choose-hand';
      state.turn.effect.actionChanged = true;
      state.turn.effect.val = { min: 1, max: 1, curr: 0 };
      state.turn.effect.allowedCards = allCards;
      state.turn.effect.players = [(playerNum + 1) % rooms[roomId].numPlayers];
      state.turn.effect.purpose = 'Discard Card';
      state.turn.effect.active = {
        num: [(playerNum + 1) % rooms[roomId].numPlayers, 1, 2], // player, cards, iteration
        card: []
      };
      state.turn.effect.choice = [];
      sendGameState(roomId);
    },
    (roomId, playerNum, returnVal) => {
      const state = rooms[roomId].state;
      if (
        !state.turn.effect ||
        !returnVal ||
        !returnVal.card ||
        !state.turn.effect ||
        !state.turn.effect.active ||
        !state.turn.effect.active.num ||
        !state.turn.effect.active.card ||
        returnVal.card.player !== state.turn.effect.active.num[0]
      )
        return;

      state.turn.effect.choice = [returnVal.card];
      discardCard(roomId, state.turn.effect.active.num[0], returnVal.card.id);

      sendGameState(roomId);

      if (state.turn.effect.active.num[2] < rooms[roomId].numPlayers) {
        const next =
          (playerNum + state.turn.effect.active.num[2]++) %
          rooms[roomId].numPlayers;
        state.turn.effect.players = [next];
        state.turn.effect.active.num[0] = next;
        state.turn.effect.val = {
          min: 1,
          max: 1,
          curr: 0
        };
        state.turn.effect.choice = null;
      } else {
        state.turn.effect.val.curr++;
      }
      state.turn.effect.active.card.push(returnVal.card);

      setTimeout(() => {
        sendGameState(roomId);
      }, 2000);
    },
    ...chooseToAdd,
    (roomId, playerNum) =>
      setTimeout(() => {
        endEffect(roomId, playerNum);
      }, 2400)
  ],
  // DONE
  'fury-knuckle': pullIfPull(CardType.challenge),
  // DONE
  'heavy-bear': [
    (roomId, playerNum) => choosePlayer(roomId, playerNum),
    receivePlayer,
    (roomId, playerNum) => {
      const state = rooms[roomId].state;
      if (
        !state.turn.effect ||
        !state.turn.effect.choice ||
        typeof state.turn.effect.choice[0] !== 'number'
      )
        return;

      state.turn.effect.action = 'choose-hand';
      state.turn.effect.actionChanged = true;
      state.turn.effect.val = { min: 2, max: 2, curr: 0 };
      state.turn.effect.allowedCards = allCards;
      state.turn.effect.players = [state.turn.effect.choice[0]];
      state.turn.effect.purpose = 'Discard Cards';
      state.turn.effect.active = {
        num: [state.turn.effect.choice[0], 2],
        card: []
      };
      state.turn.effect.choice = [];
      sendGameState(roomId);
    },
    receiveDiscardCard,
    (roomId, playerNum) =>
      setTimeout(() => {
        endEffect(roomId, playerNum);
      }, 2000)
  ],
  // DONE
  'pan-chucks': [
    ...drawCard(2),
    ...chooseReveal(2, CardType.challenge),
    ...destroyHero,
    (roomId, userId) =>
      setTimeout(() => {
        endEffect(roomId, userId);
      }, 1500)
  ],
  // DONE
  'qi-bear': [
    (roomId: string, playerNum: number) => {
      const state = rooms[roomId].state;
      if (!state.turn.effect) return;

      state.turn.effect.action = 'choose-hand';
      state.turn.effect.actionChanged = true;
      state.turn.effect.val = { min: 1, max: 3, curr: 0 };
      state.turn.effect.allowedCards = allCards;
      state.turn.effect.players = [playerNum];
      state.turn.effect.purpose = 'Discard Cards';
      state.turn.effect.active = {
        num: [playerNum, 1]
      };
      state.turn.effect.choice = [];
      sendGameState(roomId);
    },
    (roomId, playerNum, returnVal) => {
      const state = rooms[roomId].state;
      if (
        !state.turn.effect ||
        !returnVal ||
        !state.turn.effect ||
        !state.turn.effect.active ||
        !state.turn.effect.active.num ||
        ((!returnVal.card ||
          returnVal.card.player !== state.turn.effect.active.num[0]) &&
          (!returnVal.num || returnVal.num !== -2)) ||
        !state.turn.effect.choice
      )
        return;

      if (
        ++state.turn.effect.val.curr < state.turn.effect.val.max &&
        returnVal.card
      ) {
        state.turn.effect.players = [playerNum];
      }

      if (returnVal.card) {
        state.turn.effect.choice = [
          ...(state.turn.effect.choice as AnyCard[]),
          returnVal.card
        ];
        discardCard(roomId, state.turn.effect.active.num[0], returnVal.card.id);
      } else {
        state.turn.effect.goNext = true;
      }

      sendGameState(roomId);
    },
    (roomId: string, playerNum: number) => {
      const state = rooms[roomId].state;
      if (!state.turn.effect || !state.turn.effect.choice) return;

      state.turn.effect.action = 'choose-other-boards';
      state.turn.effect.actionChanged = true;
      state.turn.effect.val = {
        min: state.turn.effect.choice.length,
        max: state.turn.effect.choice.length,
        curr: 0
      };
      state.turn.effect.allowedCards = [];
      state.turn.effect.players = [playerNum];
      state.turn.effect.purpose = 'Destroy Hero';
      state.turn.effect.active = { num: [playerNum] };
      state.turn.effect.choice = [];
      setTimeout(() => {
        sendGameState(roomId);
      }, 1200);
    },
    receiveDestroyHero,
    (roomId, playerNum) =>
      setTimeout(() => {
        endEffect(roomId, playerNum);
      }, 1500)
  ],
  // DONE
  'tough-teddy': eachOtherWithHeroInBoardDiscard(HeroClass.fighter),

  // RANGER
  // DONE
  bullseye: [
    (roomId: string, playerNum: number) => {
      const state = rooms[roomId].state;
      if (!state.turn.effect) return;

      state.turn.effect.action = 'choose-cards';
      state.turn.effect.actionChanged = true;
      state.turn.effect.val = { min: 3, max: 3, curr: 0 };
      state.turn.effect.allowedCards = [];
      state.turn.effect.players = [playerNum];
      state.turn.effect.purpose = 'Add Card';
      state.turn.effect.active = { num: [playerNum, 3] };

      state.turn.effect.active.card = [];
      for (let i = 0; i < 3; i++) {
        let card = state.secret.deck.pop();
        if (!card) {
          card = reshuffleDeck(roomId);
        }
        state.turn.effect.active.card.push(card);
      }

      state.turn.effect.activeCardVisible = [];
      for (let i = 0; i < rooms[roomId].numPlayers; i++) {
        state.turn.effect.activeCardVisible.push(i === playerNum);
      }

      state.turn.effect.choice = null;
      sendGameState(roomId);
    },
    (roomId, playerNum, returnVal) => {
      const state = rooms[roomId].state;
      if (
        !state.turn.effect ||
        !returnVal ||
        !returnVal.card ||
        !state.turn.effect.active ||
        !state.turn.effect.active.card ||
        !state.turn.effect.active.num
      )
        return;

      state.turn.effect.choice = [
        state.turn.effect.active.card.findIndex(
          val => val.id === returnVal.card?.id
        )
      ];
      state.turn.effect.val.curr++;
      sendGameState(roomId);

      if (state.turn.effect.active.num[1] === 3) {
        addCards(roomId, [returnVal.card], playerNum);
      } else {
        state.secret.deck.push(returnVal.card);
      }

      if (state.turn.effect.active.card.length !== 1) {
        state.turn.effect.players = [playerNum];
      }

      state.turn.effect.active.num[1]--;
      state.turn.effect.choice = [];
      state.turn.effect.active.card = state.turn.effect.active.card.filter(
        val => val.id !== returnVal.card?.id
      );
      state.turn.effect.purpose = 'Return Back';

      setTimeout(() => {
        sendGameState(roomId);
      }, 1200);
    },
    (roomId, playerNum) =>
      setTimeout(() => {
        endEffect(roomId, playerNum);
      }, 1800)
  ],

  // TODO: CACHE ABILITY
  hook: [],
  // TODO: SEARCH DISCARD PILE
  'lookie-rookie': [],
  // TODO: COMBINE PLAY IMMEDIATELY WITH REVEAL
  'quick-draw': [
    ...drawCard(2)
    // ...chooseReveal(2, CardType.item)
  ],
  // DONE
  'serious-grey': [...destroyHero, ...drawCard(1)],
  // DONE
  'sharp-fox': [
    ...pickPlayer('Peek Hand'),
    (roomId: string, playerNum: number) => {
      const state = rooms[roomId].state;
      if (
        !state.turn.effect ||
        !state.turn.effect.choice ||
        typeof state.turn.effect.choice[0] !== 'number'
      )
        return;

      state.turn.effect.action = 'choose-other-hand-show';
      state.turn.effect.actionChanged = true;
      state.turn.effect.val = { min: 0, max: 0, curr: 0 };
      state.turn.effect.allowedCards = [];
      state.turn.effect.players = [playerNum];
      state.turn.effect.purpose = 'Peek';
      state.turn.effect.active = {
        num: [
          state.turn.effect.choice[0],
          state.players[state.turn.effect.choice[0]].numCards
        ],
        card: state.players[state.turn.effect.choice[0]].hand
      };

      state.turn.effect.activeCardVisible = [];
      for (let i = 0; i < rooms[roomId].numPlayers; i++) {
        state.turn.effect.activeCardVisible.push(
          i === playerNum || i === state.turn.effect.choice[0]
        );
      }

      state.turn.effect.choice = null;

      setTimeout(() => {
        sendGameState(roomId);
      }, 1200);
    },
    (roomId, playerNum, returnVal) => {},
    (roomId, playerNum) => endEffect(roomId, playerNum)
  ],
  // DONE
  wildshot: [
    ...drawCard(3),
    ...discardCards(1),
    (roomId, playerNum) =>
      setTimeout(() => {
        endEffect(roomId, playerNum);
      }, 1200)
  ],
  // DONE
  'wily-red': [
    (roomId: string, playerNum: number) => {
      const state = rooms[roomId].state;
      if (!state.turn.effect) return;
      state.turn.effect.action = 'draw';
      state.turn.effect.actionChanged = true;
      state.turn.effect.allowedCards = [];
      state.turn.effect.val = { min: 1, max: 1, curr: 0 };
      state.turn.effect.players = [playerNum];
      state.turn.effect.purpose = 'Draw Card';
      sendGameState(roomId);
    },
    (roomId: string, playerNum: number) => {
      const state = rooms[roomId].state;
      if (!state.turn.effect) return;

      state.turn.effect.active = {
        num: [7 - state.players[playerNum].numCards]
      };

      if (state.players[playerNum].numCards < 7) {
        drawCards(roomId, playerNum, 7 - state.players[playerNum].numCards);
      }
      state.turn.effect.val.curr++;
      sendGameState(roomId);
    },
    (roomId, playerNum) => {
      const state = rooms[roomId].state;
      if (
        !state.turn.effect ||
        !state.turn.effect.active ||
        !state.turn.effect.active.num
      )
        return;

      setTimeout(
        () => endEffect(roomId, playerNum),
        state.turn.effect.active.num[0] * 450 + 250
      );
    }
  ],

  // THIEF
  // DONE
  'kit-napper': stealHero,
  // TODO: COMBINATION
  meowzio: [],
  // TODO: COMBINATION
  'plundering-puma': [],
  // TODO: MODIFIED DESTROY
  shurikitty: [],
  // DONE
  'silent-shadow': [
    ...pickPlayer('Peek Hand'),
    (roomId: string, playerNum: number) => {
      const state = rooms[roomId].state;
      if (
        !state.turn.effect ||
        !state.turn.effect.choice ||
        typeof state.turn.effect.choice[0] !== 'number'
      )
        return;

      state.turn.effect.action = 'choose-other-hand-show';
      state.turn.effect.actionChanged = true;
      state.turn.effect.val = { min: 1, max: 1, curr: 0 };
      state.turn.effect.allowedCards = [];
      state.turn.effect.players = [playerNum];
      state.turn.effect.purpose = 'Steal Card';
      state.turn.effect.active = {
        num: [
          state.turn.effect.choice[0],
          state.players[state.turn.effect.choice[0]].numCards
        ],
        card: state.players[state.turn.effect.choice[0]].hand
      };

      state.turn.effect.activeCardVisible = [];
      for (let i = 0; i < rooms[roomId].numPlayers; i++) {
        state.turn.effect.activeCardVisible.push(
          i === playerNum || i === state.turn.effect.choice[0]
        );
      }

      state.turn.effect.choice = null;

      setTimeout(() => {
        sendGameState(roomId);
      }, 1200);
    },
    (roomId, playerNum, returnVal) => {
      const state = rooms[roomId].state;
      if (
        !state.turn.effect ||
        !returnVal ||
        !returnVal.num ||
        !state.turn.effect.active ||
        !state.turn.effect.active.num
      )
        return;

      state.turn.effect.choice = [returnVal.num];
      state.turn.effect.val.curr++;
      sendGameState(roomId);

      const card = removeCardIndex(
        roomId,
        state.turn.effect.active.num[0],
        returnVal.num
      );
      if (card === -1) return;
      addCards(roomId, [card], playerNum);

      setTimeout(() => {
        sendGameState(roomId);
      }, 400);
    },
    (roomId, playerNum) =>
      setTimeout(() => {
        endEffect(roomId, playerNum);
      }, 1200)
  ],
  // TODO: COMBINATION
  'slippery-paws': [],
  // DONE
  'sly-pickings': [
    ...pickFromHand,
    ...ifMayPlay(CardType.item),
    (roomId, playerNum) => endEffect(roomId, playerNum, false)
  ],
  // DONE
  'smooth-mimimeow': eachOtherWithHeroInBoardDiscard(HeroClass.thief),

  // WIZARD
  // TODO: SEARCH DISCARD
  'bun-bun': [],
  // DONE
  buttons: [
    ...pickFromHand,
    ...ifMayPlay(CardType.magic),
    (roomId, playerNum) => endEffect(roomId, playerNum, false)
  ],
  // TODO: TEST
  fluffy: [
    (roomId: string, playerNum: number) => {
      const state = rooms[roomId].state;
      if (!state.turn.effect) return;

      state.turn.effect.action = 'choose-other-boards';
      state.turn.effect.actionChanged = true;
      state.turn.effect.val = { min: 2, max: 2, curr: 0 };
      state.turn.effect.allowedCards = [];
      state.turn.effect.players = [playerNum];
      state.turn.effect.purpose = 'Destroy Hero';
      state.turn.effect.active = { num: [playerNum] };
      sendGameState(roomId);
    },
    (roomId, playerNum, returnVal) => {
      const state = rooms[roomId].state;
      if (
        !state.turn.effect ||
        !returnVal ||
        !returnVal.card ||
        returnVal.card.player === undefined ||
        returnVal.card.type !== CardType.hero ||
        !state.turn.effect.active ||
        !state.turn.effect.active.num ||
        returnVal.card.player === state.turn.effect.active.num[0]
      )
        return;

      state.turn.effect.choice = [returnVal.card];
      if (++state.turn.effect.val.curr < state.turn.effect.val.max) {
        state.turn.effect.players = [playerNum];
      }
      sendGameState(roomId);

      destroyCard(roomId, returnVal.card.player, returnVal.card);
      setTimeout(() => {
        sendGameState(roomId);
      }, 1200);
    },
    (roomId, playerNum) =>
      setTimeout(() => {
        endEffect(roomId, playerNum);
      }, 2400)
  ],
  //...
  // TODO: TEST
  whiskers: [
    ...stealHero,
    ...destroyHero,
    (roomId, playerNum) => {
      setTimeout(() => {
        endEffect(roomId, playerNum);
      }, 2400);
    }
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
  dracos: { pass: -5, fail: 8 },
  malamammoth: { pass: 8, fail: -4 },
  'mega-slime': { pass: 8, fail: -7 },
  orthus: { pass: 8, fail: -4 },
  'rex-major': { pass: 8, fail: -4 },
  terratuga: { pass: 11, fail: -7 },
  'titan-wyvern': { pass: 8, fail: -4 },
  'warworn-owlbear': { pass: 8, fail: -4 }
};
