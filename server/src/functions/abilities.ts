import { endTurnDiscard } from '../controllers/socketio/game/useEffect';
import { rooms } from '../rooms';
import { sendGameState } from '../server';
import { AnyCard, CardType, GameState, HeroClass, allCards } from '../types';
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
  Effect,
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
  searchDiscard,
  stealHero
} from './abilitiesHelpers';
import { reshuffleDeck } from './gameHelpers';
import cloneDeep from 'lodash.clonedeep';

export const heroAbilities: {
  [key: string]: ((
    roomId: string,
    state: GameState,
    effect: Effect,
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
    (roomId, state, effect) => choosePlayer(roomId, state, effect, 'Swap Hand'),
    (roomId, state, effect, returnVal) => {
      if (!state.turn.effect || !returnVal || !returnVal.num) return;
      const userNum = returnVal.num;

      effect.choice = [userNum];

      sendGameState(roomId);

      swapHands(state, state.turn.player, userNum);
      effect.val.curr++;

      setTimeout(() => {
        sendGameState(roomId);
      }, 600);
    },
    (roomId, state, effect) => endEffect(roomId, state, effect)
  ],
  // DONE
  'fuzzy-cheeks': [
    ...drawCard(),
    ...playFromHand(CardType.hero),
    (roomId, state, effect) => endEffect(roomId, state, effect, false)
  ],
  // DONE
  'greedy-cheeks': [
    (roomId, state, effect) => {
      effect.action = 'choose-hand';
      effect.actionChanged = true;
      effect.allowedCards = allCards;
      effect.purpose = 'Give Card';
      let players = [];
      for (let i = 0; i < rooms[roomId].numPlayers; i++) {
        if (i !== state.turn.player) {
          players.push(i);
        }
      }
      effect.players = players;
      effect.val = { min: players.length, max: players.length, curr: 0 };
      sendGameState(roomId);
    },
    (roomId, state, effect, returnVal, fromPlayer) => {
      if (!state.turn.effect || !returnVal || !returnVal.card || !fromPlayer)
        return;

      const card = removeCard(roomId, fromPlayer, returnVal.card.id);
      if (card === -1) return;

      addCards(roomId, [card], state.turn.player);
      effect.val.curr++;

      sendGameState(roomId);
    },
    (roomId, state, effect) => endEffect(roomId, state, effect)
  ],
  // DONE
  'lucky-bucky': [
    ...pickFromHand,
    ...ifMayPlay(1, CardType.hero),
    (roomId, state, effect) => endEffect(roomId, state, effect, false)
  ],
  // DONE
  'mellow-dee': [
    ...drawCard(),
    ...ifMayPlay(1, CardType.hero),
    (roomId, state, effect) => endEffect(roomId, state, effect, false)
  ],
  // DONE
  'napping-nibbles': [
    (roomId, state, effect) => {
      effect.action = 'none';
      effect.actionChanged = true;
      effect.allowedCards = [];
      effect.players = [];
      effect.purpose = 'Do Nothing';
      sendGameState(roomId);

      setTimeout(() => {
        state.turn.effect = null;
        if (state.turn.movesLeft > 0) {
          state.turn.phase = 'play';
          state.turn.phaseChanged = true;
          sendGameState(roomId);
        } else
          endTurnDiscard(roomId, state.secret.playerIds[state.turn.player]);
      }, 5000);
    }
  ],
  // DONE
  peanut: [
    ...drawCard(2),
    (roomId, state, effect) => endEffect(roomId, state, effect)
  ],
  // DONE
  'tipsy-tootie': [
    chooseStealHero,
    (roomId, state, effect, returnVal) => {
      if (
        !returnVal ||
        !returnVal.card ||
        returnVal.card.player === undefined ||
        returnVal.card.type !== CardType.hero ||
        returnVal.card.player === state.turn.player ||
        effect.card.type !== CardType.hero ||
        effect.card.player === undefined
      ) {
        console.log(returnVal, state.turn.effect);
        return;
      }

      effect.choice = [returnVal.card];
      effect.val.curr++;
      sendGameState(roomId);

      swapCard(
        roomId,
        state.turn.player,
        effect.card,
        returnVal.card.player,
        returnVal.card
      );

      setTimeout(() => {
        sendGameState(roomId);
      }, 1200);
    },
    (roomId, state, effect) =>
      setTimeout(() => {
        endEffect(roomId, state, effect);
      }, 1200)
  ],

  // FIGHTERS
  // DONE
  'bad-axe': [
    ...destroyHero,
    (roomId, state, effect) =>
      setTimeout(() => {
        endEffect(roomId, state, effect);
      }, 1200)
  ],
  // DONE
  'bear-claw': pullIfPull(CardType.hero),
  // DONE
  'beary-wise': [
    (roomId, state, effect) => {
      effect.action = 'choose-hand';
      effect.actionChanged = true;
      effect.val = { min: 1, max: 1, curr: 0 };
      effect.allowedCards = allCards;
      effect.players = [(state.turn.player + 1) % rooms[roomId].numPlayers];
      effect.purpose = 'Discard Card';
      effect.active = {
        num: [(state.turn.player + 1) % rooms[roomId].numPlayers, 1, 2], // player, cards, iteration
        card: []
      };
      effect.choice = [];
      sendGameState(roomId);
    },
    (roomId, state, effect, returnVal) => {
      if (
        !returnVal ||
        !returnVal.card ||
        !effect.active ||
        !effect.active.num ||
        !effect.active.card ||
        returnVal.card.player !== effect.active.num[0]
      )
        return;

      effect.choice = [returnVal.card];
      discardCard(roomId, effect.active.num[0], returnVal.card.id);

      sendGameState(roomId);

      if (effect.active.num[2] < rooms[roomId].numPlayers) {
        const next =
          (state.turn.player + effect.active.num[2]++) %
          rooms[roomId].numPlayers;
        effect.players = [next];
        effect.active.num[0] = next;
        effect.val = {
          min: 1,
          max: 1,
          curr: 0
        };
        effect.choice = null;
      } else {
        effect.val.curr++;
      }
      effect.active.card.push(returnVal.card);

      setTimeout(() => {
        sendGameState(roomId);
      }, 2000);
    },
    ...chooseToAdd,
    (roomId, state, effect) =>
      setTimeout(() => {
        endEffect(roomId, state, effect);
      }, 2400)
  ],
  // DONE
  'fury-knuckle': pullIfPull(CardType.challenge),
  // DONE
  'heavy-bear': [
    (roomId, state, effect) => choosePlayer(roomId, state, effect),
    receivePlayer,
    (roomId, state, effect) => {
      if (!effect.choice || typeof effect.choice[0] !== 'number') return;

      effect.action = 'choose-hand';
      effect.actionChanged = true;
      effect.val = { min: 2, max: 2, curr: 0 };
      effect.allowedCards = allCards;
      effect.players = [effect.choice[0]];
      effect.purpose = 'Discard Cards';
      effect.active = {
        num: [effect.choice[0], 2],
        card: []
      };
      effect.choice = [];
      sendGameState(roomId);
    },
    receiveDiscardCard,
    (roomId, state, effect) =>
      setTimeout(() => {
        endEffect(roomId, state, effect);
      }, 2000)
  ],
  // DONE
  'pan-chucks': [
    ...drawCard(2),
    ...chooseReveal(2, CardType.challenge),
    ...destroyHero,
    (roomId, state, effect) =>
      setTimeout(() => {
        endEffect(roomId, state, effect);
      }, 1500)
  ],
  // DONE
  'qi-bear': [
    (roomId, state, effect) => {
      effect.action = 'choose-hand';
      effect.actionChanged = true;
      effect.val = { min: 1, max: 3, curr: 0 };
      effect.allowedCards = allCards;
      effect.players = [state.turn.player];
      effect.purpose = 'Discard Cards';
      effect.active = {
        num: [state.turn.player, 1]
      };
      effect.choice = [];
      sendGameState(roomId);
    },
    (roomId, state, effect, returnVal) => {
      if (
        !returnVal ||
        !effect.active ||
        !effect.active.num ||
        ((!returnVal.card || returnVal.card.player !== effect.active.num[0]) &&
          (!returnVal.num || returnVal.num !== -2)) ||
        !effect.choice
      )
        return;

      if (++effect.val.curr < effect.val.max && returnVal.card) {
        effect.players = [state.turn.player];
      }

      if (returnVal.card) {
        effect.choice = [...(effect.choice as AnyCard[]), returnVal.card];
        discardCard(roomId, effect.active.num[0], returnVal.card.id);
      } else {
        effect.goNext = true;
      }

      sendGameState(roomId);
    },
    (roomId, state, effect) => {
      if (!state.turn.effect || !effect.choice) return;

      effect.action = 'choose-other-boards';
      effect.actionChanged = true;
      effect.val = {
        min: effect.choice.length,
        max: effect.choice.length,
        curr: 0
      };
      effect.allowedCards = [];
      effect.players = [state.turn.player];
      effect.purpose = 'Destroy Hero';
      effect.active = { num: [state.turn.player] };
      effect.choice = [];
      setTimeout(() => {
        sendGameState(roomId);
      }, 1200);
    },
    receiveDestroyHero,
    (roomId, state, effect) =>
      setTimeout(() => {
        endEffect(roomId, state, effect);
      }, 1500)
  ],
  // DONE
  'tough-teddy': eachOtherWithHeroInBoardDiscard(HeroClass.fighter),

  // RANGER
  // DONE
  bullseye: [
    (roomId, state, effect) => {
      effect.action = 'choose-cards';
      effect.actionChanged = true;
      effect.val = { min: 3, max: 3, curr: 0 };
      effect.allowedCards = [];
      effect.players = [state.turn.player];
      effect.purpose = 'Add Card';
      effect.active = { num: [state.turn.player, 3] };

      effect.active.card = [];
      for (let i = 0; i < 3; i++) {
        let card = state.secret.deck.pop();
        if (!card) {
          card = reshuffleDeck(roomId);
        }
        effect.active.card.push(card);
      }

      effect.activeCardVisible = [];
      for (let i = 0; i < rooms[roomId].numPlayers; i++) {
        effect.activeCardVisible.push(i === state.turn.player);
      }

      effect.choice = null;
      sendGameState(roomId);
    },
    (roomId, state, effect, returnVal) => {
      if (
        !returnVal ||
        !returnVal.card ||
        !effect.active ||
        !effect.active.card ||
        !effect.active.num
      )
        return;

      effect.choice = [
        effect.active.card.findIndex(val => val.id === returnVal.card?.id)
      ];
      effect.val.curr++;
      sendGameState(roomId);

      if (effect.active.num[1] === 3) {
        addCards(roomId, [returnVal.card], state.turn.player);
      } else {
        state.secret.deck.push(returnVal.card);
      }

      if (effect.active.card.length !== 1) {
        effect.players = [state.turn.player];
      }

      effect.active.num[1]--;
      effect.choice = [];
      effect.active.card = effect.active.card.filter(
        val => val.id !== returnVal.card?.id
      );
      effect.purpose = 'Return Back';

      setTimeout(() => {
        sendGameState(roomId);
      }, 1200);
    },
    (roomId, state, effect) =>
      setTimeout(() => {
        endEffect(roomId, state, effect);
      }, 1800)
  ],
  // DONE
  hook: [
    (roomId, state, effect) => {
      effect.action = 'choose-hand';
      effect.actionChanged = true;
      effect.allowedCards = [CardType.item];
      effect.players = [state.turn.player];
      effect.purpose = 'Play Item';
      effect.val = { min: 0, max: 1, curr: 0 };

      sendGameState(roomId);
    },
    (roomId, state, effect, returnVal) => {
      if (
        !returnVal ||
        ((!returnVal.card || returnVal.card.type !== CardType.item) &&
          !returnVal.num)
      )
        return;

      if (returnVal.card) {
        effect.choice = [returnVal.card];
      } else {
        effect.choice = [0];
      }
      sendGameState(roomId);

      if (returnVal.card && returnVal.card.type === CardType.item) {
        let privateArr = [];
        for (let i = 0; i < rooms[roomId].numPlayers; i++) {
          privateArr.push(true);
        }
        state.turn.cachedEvent = {
          phase: 'use-effect',
          effect: {
            action: 'draw',
            actionChanged: true,
            allowedCards: [],
            players: [state.turn.player],
            purpose: 'Draw Card',
            val: { min: 1, max: 1, curr: 0 },
            card: effect.card,
            activeCardVisible: cloneDeep(privateArr),
            activeNumVisible: cloneDeep(privateArr),
            goNext: false,
            step: 2,
            choice: null
          }
        };
        state.turn.effect = null;
        setTimeout(() => {
          if (returnVal.card?.type === CardType.item)
            playCard(roomId, state.turn.player, returnVal.card, true);
        }, 1200);
      } else if (returnVal.num && returnVal.num === -2) {
        effect.goNext = true;
      }
    },
    (roomId, state, effect) => {
      effect.action = 'draw';
      effect.actionChanged = true;
      effect.allowedCards = [];
      effect.val = { min: 1, max: 1, curr: 0 };
      effect.players = [state.turn.player];
      effect.purpose = 'Draw Card';
      setTimeout(() => {
        sendGameState(roomId);
      }, 1200);
    },
    (roomId, state, effect) => {
      drawCards(roomId, state.turn.player, 1);
      effect.val.curr++;
      sendGameState(roomId);
    },
    (roomId, state, effect) =>
      setTimeout(() => {
        endEffect(roomId, state, effect);
      }, 800)
  ],
  // DONE
  'lookie-rookie': searchDiscard(CardType.item),
  // DONE
  'quick-draw': [
    ...drawCard(2),
    ...ifMayPlay(2, CardType.item),
    (roomId, state, effect) => endEffect(roomId, state, effect, false)
  ],
  // DONE
  'serious-grey': [...destroyHero, ...drawCard(1)],
  // DONE
  'sharp-fox': [
    ...pickPlayer('Peek Hand'),
    (roomId, state, effect) => {
      if (!effect.choice || typeof effect.choice[0] !== 'number') return;

      effect.action = 'choose-other-hand-show';
      effect.actionChanged = true;
      effect.val = { min: 0, max: 0, curr: 0 };
      effect.allowedCards = [];
      effect.players = [state.turn.player];
      effect.purpose = 'Peek';
      effect.active = {
        num: [effect.choice[0], state.players[effect.choice[0]].numCards],
        card: state.players[effect.choice[0]].hand
      };

      effect.activeCardVisible = [];
      for (let i = 0; i < rooms[roomId].numPlayers; i++) {
        effect.activeCardVisible.push(
          i === state.turn.player || i === effect.choice[0]
        );
      }

      effect.choice = null;

      setTimeout(() => {
        sendGameState(roomId);
      }, 1200);
    },
    (roomId, state, effect, returnVal) => {},
    (roomId, state, effect) => endEffect(roomId, state, effect)
  ],
  // DONE
  wildshot: [
    ...drawCard(3),
    ...discardCards(1),
    (roomId, state, effect) =>
      setTimeout(() => {
        endEffect(roomId, state, effect);
      }, 1200)
  ],
  // DONE
  'wily-red': [
    (roomId, state, effect) => {
      effect.action = 'draw';
      effect.actionChanged = true;
      effect.allowedCards = [];
      effect.val = { min: 1, max: 1, curr: 0 };
      effect.players = [state.turn.player];
      effect.purpose = 'Draw Card';
      sendGameState(roomId);
    },
    (roomId, state, effect) => {
      effect.active = {
        num: [7 - state.players[state.turn.player].numCards]
      };

      if (state.players[state.turn.player].numCards < 7) {
        drawCards(
          roomId,
          state.turn.player,
          7 - state.players[state.turn.player].numCards
        );
      }
      effect.val.curr++;
      sendGameState(roomId);
    },
    (roomId, state, effect) => {
      if (!effect.active || !effect.active.num) return;

      setTimeout(
        () => endEffect(roomId, state, effect),
        effect.active.num[0] * 450 + 250
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
    (roomId, state, effect) => {
      if (!effect.choice || typeof effect.choice[0] !== 'number') return;

      effect.action = 'choose-other-hand-show';
      effect.actionChanged = true;
      effect.val = { min: 1, max: 1, curr: 0 };
      effect.allowedCards = [];
      effect.players = [state.turn.player];
      effect.purpose = 'Steal Card';
      effect.active = {
        num: [effect.choice[0], state.players[effect.choice[0]].numCards],
        card: state.players[effect.choice[0]].hand
      };

      effect.activeCardVisible = [];
      for (let i = 0; i < rooms[roomId].numPlayers; i++) {
        effect.activeCardVisible.push(
          i === state.turn.player || i === effect.choice[0]
        );
      }

      effect.choice = null;

      setTimeout(() => {
        sendGameState(roomId);
      }, 1200);
    },
    (roomId, state, effect, returnVal) => {
      if (!returnVal || !returnVal.num || !effect.active || !effect.active.num)
        return;

      effect.choice = [returnVal.num];
      effect.val.curr++;
      sendGameState(roomId);

      const card = removeCardIndex(roomId, effect.active.num[0], returnVal.num);
      if (card === -1) return;
      addCards(roomId, [card], state.turn.player);

      setTimeout(() => {
        sendGameState(roomId);
      }, 400);
    },
    (roomId, state, effect) =>
      setTimeout(() => {
        endEffect(roomId, state, effect);
      }, 1200)
  ],
  // TODO: COMBINATION
  'slippery-paws': [],
  // DONE
  'sly-pickings': [
    ...pickFromHand,
    ...ifMayPlay(1, CardType.item),
    (roomId, state, effect) => endEffect(roomId, state, effect, false)
  ],
  // DONE
  'smooth-mimimeow': eachOtherWithHeroInBoardDiscard(HeroClass.thief),

  // WIZARD
  // TODO: SEARCH DISCARD
  'bun-bun': [],
  // DONE
  buttons: [
    ...pickFromHand,
    ...ifMayPlay(1, CardType.magic),
    (roomId, state, effect) => endEffect(roomId, state, effect, false)
  ],
  // TODO: TEST
  fluffy: [
    (roomId, state, effect) => {
      effect.action = 'choose-other-boards';
      effect.actionChanged = true;
      effect.val = { min: 2, max: 2, curr: 0 };
      effect.allowedCards = [];
      effect.players = [state.turn.player];
      effect.purpose = 'Destroy Hero';
      effect.active = { num: [state.turn.player] };
      sendGameState(roomId);
    },
    (roomId, state, effect, returnVal) => {
      if (
        !returnVal ||
        !returnVal.card ||
        returnVal.card.player === undefined ||
        returnVal.card.type !== CardType.hero ||
        !effect.active ||
        !effect.active.num ||
        returnVal.card.player === effect.active.num[0]
      )
        return;

      effect.choice = [returnVal.card];
      if (++effect.val.curr < effect.val.max) {
        effect.players = [state.turn.player];
      }
      sendGameState(roomId);

      destroyCard(roomId, returnVal.card.player, returnVal.card);
      setTimeout(() => {
        sendGameState(roomId);
      }, 1200);
    },
    (roomId, state, effect) =>
      setTimeout(() => {
        endEffect(roomId, state, effect);
      }, 2400)
  ],
  //...
  // TODO: TEST
  whiskers: [
    ...stealHero,
    ...destroyHero,
    (roomId, state, effect) => {
      setTimeout(() => {
        endEffect(roomId, state, effect);
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
