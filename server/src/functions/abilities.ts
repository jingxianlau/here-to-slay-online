import {
  endTurnDiscard,
  useEffect
} from '../controllers/socketio/game/useEffect';
import { rooms } from '../rooms';
import { sendGameState } from '../server';
import {
  AnyCard,
  CardType,
  GameState,
  HeroCard,
  HeroClass,
  MagicCard,
  allCards
} from '../types';
import {
  addCards,
  destroyCard,
  discardCard,
  drawCards,
  playCard,
  removeCard,
  removeCardIndex,
  swapCard
} from './game';
import {
  Effect,
  addCard,
  chooseDestroyHero,
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
  pickCard,
  pickFromHand,
  pickPlayer,
  playFromHand,
  pullIfPull,
  receiveDestroyHero,
  receiveDiscardCard,
  receivePlayer,
  receiveSacrificeHero,
  sacrificeHero,
  searchDiscard,
  stealHero
} from './abilitiesHelpers';
import { removeHero, reshuffleDeck } from './gameHelpers';
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
  ...{
    'dodgy-dealer': [
      (roomId, state, effect) =>
        choosePlayer(roomId, state, effect, 'Swap Hand'),
      (roomId, state, effect, returnVal) => {
        if (!state.turn.effect || !returnVal || returnVal.num === undefined)
          return;
        const player1 = state.turn.player;
        const player2 = returnVal.num;

        effect.choice = [player2];

        const hand1 = state.players[player1].hand;
        const numCards1 = state.players[player1].numCards;
        const hand2 = state.players[player2].hand;
        const numCards2 = state.players[player2].numCards;

        state.players[player1].hand = [];
        state.players[player2].hand = [];
        state.players[player2].numCards = 0;
        state.players[player2].numCards = 0;

        sendGameState(roomId);

        state.players[player1].hand = hand2;
        state.players[player1].numCards = numCards2;
        state.players[player2].hand = hand1;
        state.players[player2].numCards = numCards1;

        setTimeout(() => {
          sendGameState(roomId);
        }, Math.max(numCards1, numCards2) * 320);

        effect.val.curr++;
        effect.active = { num: [Math.max(numCards1, numCards2) * 640] };
      },
      (roomId, state, effect) => {
        if (!effect.active || !effect.active.num || !effect.active.num[0])
          return;
        setTimeout(() => {
          endEffect(roomId, state, effect);
        }, effect.active.num[0]);
      }
    ],
    'fuzzy-cheeks': [
      ...drawCard(),
      ...playFromHand(CardType.hero),
      (roomId, state, effect) => endEffect(roomId, state, effect, false)
    ],
    'greedy-cheeks': [
      (roomId, state, effect) => {
        effect.action = 'choose-hand';
        effect.actionChanged = true;
        effect.allowedCards = allCards;
        effect.purpose = 'Give Card';
        let players = [];
        for (let i = 0; i < rooms[roomId].numPlayers; i++) {
          if (i !== state.turn.player && state.players[i].numCards > 0) {
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
    'lucky-bucky': [
      ...pickFromHand(),
      ...ifMayPlay(1, CardType.hero),
      (roomId, state, effect) => endEffect(roomId, state, effect, false)
    ],
    'mellow-dee': [
      ...drawCard(),
      ...ifMayPlay(1, CardType.hero),
      (roomId, state, effect) => endEffect(roomId, state, effect, false)
    ],
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
    peanut: [
      ...drawCard(2),
      (roomId, state, effect) => endEffect(roomId, state, effect)
    ],
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
          effect.card.player === undefined ||
          state.players[returnVal.card.player].protection.some(
            val => val.type === 'steal'
          )
        ) {
          endEffect(roomId, state, effect);
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
    ]
  },

  // FIGHTERS
  ...{
    'bad-axe': [
      ...destroyHero,
      (roomId, state, effect) =>
        setTimeout(() => {
          endEffect(roomId, state, effect);
        }, 1200)
    ],
    'bear-claw': pullIfPull(CardType.hero),
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

        effect.choice = null;
        effect.active.card.push(returnVal.card);
        let next: number;
        do {
          next =
            (state.turn.player + effect.active.num[2]++) %
            rooms[roomId].numPlayers;

          console.log(state.turn.player + effect.active.num[2]);

          if (next === state.turn.player) {
            effect.val.curr++;
            return;
          }
        } while (rooms[roomId].state.players[next].numCards === 0);
        effect.players = [next];
        effect.active.num[0] = next;
        effect.val = {
          min: 1,
          max: 1,
          curr: 0
        };

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
    'fury-knuckle': pullIfPull(CardType.challenge),
    'heavy-bear': [
      (roomId, state, effect) => choosePlayer(roomId, state, effect),
      receivePlayer,
      (roomId, state, effect) => {
        if (!effect.choice || typeof effect.choice[0] !== 'number') return;

        effect.action = 'choose-hand';
        effect.actionChanged = true;
        effect.val = {
          min: Math.min(
            rooms[roomId].state.players[effect.choice[0]].numCards,
            2
          ),
          max: 2,
          curr: 0
        };
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
    'pan-chucks': [
      ...drawCard(2),
      ...chooseReveal(2, CardType.challenge),
      ...destroyHero,
      (roomId, state, effect) =>
        setTimeout(() => {
          endEffect(roomId, state, effect);
        }, 1500)
    ],
    'qi-bear': [
      (roomId, state, effect) => {
        effect.action = 'choose-hand';
        effect.actionChanged = true;
        effect.val = { min: 0, max: 3, curr: 0 };
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
          ((!returnVal.card ||
            returnVal.card.player !== effect.active.num[0]) &&
            (returnVal.num === undefined || returnVal.num !== -2)) ||
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
        if (effect.choice.length === 0) {
          endEffect(roomId, state, effect);
          return;
        }

        effect.action = 'choose-other-boards';
        effect.actionChanged = true;
        effect.val = {
          min: 0,
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
      (roomId, state, effect, returnVal) => {
        if (
          !returnVal ||
          !returnVal.card ||
          returnVal.card.player === undefined ||
          returnVal.card.type !== CardType.hero ||
          !effect.active ||
          !effect.active.num ||
          returnVal.card.player === effect.active.num[0] ||
          state.players[returnVal.card.player].protection.some(
            val => val.type === 'destroy'
          )
        ) {
          endEffect(roomId, state, effect);
          return;
        }

        effect.choice = [returnVal.card];
        effect.players = [state.turn.player];
        effect.val.curr++;
        sendGameState(roomId);

        destroyCard(roomId, returnVal.card.player, returnVal.card);
        setTimeout(() => {
          sendGameState(roomId);
        }, 1200);
      },
      (roomId, state, effect) =>
        setTimeout(() => {
          endEffect(roomId, state, effect);
        }, 1500)
    ],
    'tough-teddy': eachOtherWithHeroInBoardDiscard(HeroClass.fighter)
  },

  // RANGER
  ...{
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
    hook: [
      (roomId, state, effect) => {
        effect.action = 'choose-hand';
        effect.actionChanged = true;

        let allowed = false;
        for (let i = 0; i < rooms[roomId].numPlayers; i++) {
          if (
            state.board[i].heroCards.some(val => {
              if (val === null) {
                return false;
              } else if (!val.item) {
                return true;
              }
              return false;
            })
          ) {
            allowed = true;
          }
        }

        if (allowed) {
          effect.allowedCards = [CardType.item];
        } else {
          effect.allowedCards = [];
        }

        effect.players = [state.turn.player];
        effect.purpose = 'Play Item';
        effect.val = { min: 0, max: 1, curr: 0 };

        sendGameState(roomId);
      },
      (roomId, state, effect, returnVal) => {
        if (
          !returnVal ||
          ((!returnVal.card || returnVal.card.type !== CardType.item) &&
            returnVal.num === undefined)
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
          state.turn.cachedEvent.push({
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
          });
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
    'lookie-rookie': searchDiscard(CardType.item),
    'quick-draw': [
      ...drawCard(2),
      ...ifMayPlay(2, CardType.item),
      (roomId, state, effect) => endEffect(roomId, state, effect, false)
    ],
    'serious-grey': [
      ...destroyHero,
      ...drawCard(1),
      (roomId, state, effect) => endEffect(roomId, state, effect)
    ],
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
    wildshot: [
      ...drawCard(3),
      ...discardCards(1),
      (roomId, state, effect) =>
        setTimeout(() => {
          endEffect(roomId, state, effect);
        }, 1200)
    ],
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
    ]
  },

  // THIEF
  ...{
    'kit-napper': [
      ...stealHero,
      (roomId, state, effect) =>
        setTimeout(() => {
          endEffect(roomId, state, effect);
        }, 2000)
    ],
    meowzio: [
      ...stealHero,
      (roomId, state, effect) => {
        if (
          !effect.choice ||
          typeof effect.choice[0] === 'number' ||
          !effect.choice[0] ||
          effect.choice[0].player === undefined
        )
          return;

        effect.action = 'choose-other-hand-hide';
        effect.actionChanged = true;
        effect.val = { min: 1, max: 1, curr: 0 };
        effect.allowedCards = [];
        effect.players = [state.turn.player];
        effect.purpose = 'Choose Card';
        effect.active = {
          num: [
            effect.choice[0].player,
            state.players[effect.choice[0].player].numCards
          ]
        };
        effect.choice = null;
        setTimeout(() => {
          sendGameState(roomId);
        }, 1200);
      },
      addCard,
      (roomId, state, effect) =>
        setTimeout(() => {
          endEffect(roomId, state, effect);
        }, 2400)
    ],
    'plundering-puma': [
      ...pickFromHand(2),
      (roomId, state, effect) => {
        if (
          !effect.active ||
          !effect.active.num ||
          effect.active.num.length === 0
        )
          return;

        effect.action = 'draw';
        effect.actionChanged = true;
        effect.allowedCards = [];
        effect.val = { min: 0, max: 1, curr: 0 };
        effect.players = [effect.active.num[0]];
        effect.purpose = 'Draw Card';
        effect.choice = null;
        sendGameState(roomId);
      },
      (roomId, state, effect, returnVal, fromPlayer) => {
        if (!fromPlayer) return;
        if (returnVal && returnVal.num && returnVal.num === -2)
          endEffect(roomId, state, effect);

        drawCards(roomId, fromPlayer, 1);
        effect.val.curr++;
        sendGameState(roomId);
      },
      (roomId, state, effect) =>
        setTimeout(() => {
          endEffect(roomId, state, effect);
        }, 1200)
    ],
    shurikitty: [
      chooseDestroyHero,
      (roomId, state, effect, returnVal) => {
        if (
          !returnVal ||
          !returnVal.card ||
          returnVal.card.player === undefined ||
          returnVal.card.type !== CardType.hero ||
          !effect.active ||
          !effect.active.num ||
          returnVal.card.player === effect.active.num[0] ||
          state.players[returnVal.card.player].protection.some(
            val => val.type === 'destroy'
          )
        )
          return;

        effect.choice = [returnVal.card];
        effect.val.curr++;
        sendGameState(roomId);

        // MODIFIED DESTROY
        const heroCard = removeHero(
          roomId,
          returnVal.card.player,
          returnVal.card.id
        );
        if (!heroCard) return;

        delete heroCard.player;
        if (heroCard.item && heroCard.item.name.includes('Mask')) {
          state.board[returnVal.card.player].classes[
            heroCard.item.name.split(' ')[0].toLowerCase() as HeroClass
          ]--;
        } else {
          state.board[returnVal.card.player].classes[returnVal.card.class]--;
        }

        heroCard.freeUse = false;
        heroCard.abilityUsed = false;
        if (heroCard.item) {
          delete heroCard.item.heroId;
          delete heroCard.item.heroPlayer;
          heroCard.item.player = state.turn.player;
          addCards(roomId, [heroCard.item], state.turn.player);
        }
        delete heroCard.item;
        state.mainDeck.discardPile.push(heroCard);

        setTimeout(() => {
          sendGameState(roomId);
        }, 1200);
      }
    ],
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
        if (
          !returnVal ||
          returnVal.num === undefined ||
          !effect.active ||
          !effect.active.num
        )
          return;

        effect.choice = [returnVal.num];
        effect.val.curr++;
        sendGameState(roomId);

        const card = removeCardIndex(
          roomId,
          effect.active.num[0],
          returnVal.num
        );
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
    'slippery-paws': [
      ...pickFromHand(2),
      (roomId, state, effect) => {
        effect.action = 'choose-cards';
        effect.actionChanged = true;
        effect.val = { min: 1, max: 1, curr: 0 };
        effect.allowedCards = [];
        effect.players = [state.turn.player];
        effect.purpose = 'Discard Card';
        effect.active = { num: [state.turn.player, 2] };

        effect.active.card = [];
        for (let i = 1; i <= 2; i++) {
          effect.active.card.push(
            state.players[state.turn.player].hand[
              state.players[state.turn.player].numCards - i
            ]
          );
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

        const cardIndex = effect.active.card.findIndex(
          val => val.id === returnVal.card?.id
        );
        effect.choice = [cardIndex];
        effect.val.curr++;
        sendGameState(roomId);

        discardCard(
          roomId,
          state.turn.player,
          effect.active.card[cardIndex].id
        );

        effect.active.card = effect.active.card.filter(
          val => val.id !== returnVal.card?.id
        );
        setTimeout(() => {
          sendGameState(roomId);
        }, 1200);
      },
      (roomId, state, effect) =>
        setTimeout(() => {
          endEffect(roomId, state, effect);
        }, 1800)
    ],
    'sly-pickings': [
      ...pickFromHand(),
      ...ifMayPlay(1, CardType.item),
      (roomId, state, effect) => endEffect(roomId, state, effect, false)
    ],
    'smooth-mimimeow': [
      (roomId: string, state: GameState, effect: Effect) => {
        effect.action = 'choose-other-hand-hide';
        effect.actionChanged = true;
        effect.val = { min: 1, max: 1, curr: 0 };
        effect.allowedCards = allCards;
        effect.purpose = 'Choose Card';

        effect.active = {};
        effect.active.num = [state.turn.player, 1, 3];

        for (let i = 0; i < rooms[roomId].numPlayers; i++) {
          if (
            state.board[i].heroCards.some(
              val => val?.class === HeroClass.thief
            ) &&
            i !== state.turn.player &&
            state.players[i].numCards
          ) {
            effect.active.num.push(i);
          }
        }

        if (effect.active.num.length - 3 > 0) {
          effect.active.num[0] = effect.active.num[effect.active.num[2]];
          effect.active.num[1] = state.players[effect.active.num[0]].numCards;
          effect.players = [state.turn.player];
          effect.choice = [];
        } else {
          endEffect(roomId, state, effect);
        }
        sendGameState(roomId);
      },
      (roomId, state, effect, returnVal) => {
        if (
          !returnVal ||
          !returnVal.num ||
          !effect.active ||
          !effect.active.num
        )
          return;

        effect.choice = [returnVal.num];

        sendGameState(roomId);
        const card = removeCardIndex(
          roomId,
          effect.active.num[0],
          returnVal.num
        );
        if (card === -1) return;
        addCards(roomId, [card], state.turn.player);

        if (effect.active.num[2] - 2 < effect.active.num.length - 3) {
          const next = effect.active.num[++effect.active.num[2]];
          effect.players = [state.turn.player];
          effect.active.num[0] = next;
          effect.active.num[1] = state.players[next].numCards;
          effect.val = {
            min: 1,
            max: 1,
            curr: 0
          };
          effect.choice = null;
        } else {
          effect.val.curr++;
        }

        setTimeout(() => {
          sendGameState(roomId);
        }, 1200);
      },
      (roomId: string, state: GameState, effect: Effect) =>
        setTimeout(() => {
          endEffect(roomId, state, effect);
        }, 1500)
    ]
  },

  // WIZARD
  ...{
    'bun-bun': searchDiscard(CardType.magic),
    buttons: [
      ...pickFromHand(1),
      ...ifMayPlay(1, CardType.magic),
      (roomId, state, effect) => endEffect(roomId, state, effect, false)
    ],
    fluffy: [
      (roomId, state, effect) => {
        effect.action = 'choose-other-boards';
        effect.actionChanged = true;
        effect.val = { min: 0, max: 2, curr: 0 };
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
          returnVal.card.player === effect.active.num[0] ||
          state.players[returnVal.card.player].protection.some(
            val => val.type === 'destroy'
          )
        ) {
          endEffect(roomId, state, effect);
          return;
        }

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
    hopper: [
      ...pickPlayer(),
      (roomId, state, effect) => {
        if (
          !effect.choice ||
          effect.choice.length < 1 ||
          typeof effect.choice[0] !== 'number'
        )
          return;
        effect.action = 'choose-own-board';
        effect.actionChanged = true;
        effect.val = {
          min: state.board[effect.choice[0]].heroCards.some(val => val !== null)
            ? 1
            : 0,
          max: 1,
          curr: 0
        };
        effect.allowedCards = [];
        effect.players = [effect.choice[0]];
        effect.purpose = 'Sacrifice Hero';
        effect.active = { num: [effect.choice[0]] };
        effect.choice = null;
        setTimeout(() => {
          sendGameState(roomId);
        }, 1200);
      },
      receiveSacrificeHero,
      (roomId, state, effect) =>
        setTimeout(() => {
          endEffect(roomId, state, effect);
        }, 2400)
    ],
    snowball: [
      ...drawCard(1),
      (roomId: string, state: GameState, effect: Effect) => {
        if (
          !state.turn.effect ||
          state.players[state.turn.player].numCards <= 0
        )
          return;

        effect.action = 'choose-two';
        effect.actionChanged = true;
        effect.val = { min: 1, max: 1, curr: 0 };
        effect.allowedCards = [];
        effect.players = [state.turn.player];
        effect.purpose = 'Play Cancel';
        effect.active = {};
        effect.active.card = [];
        effect.active.num = [];

        effect.active.card.push(
          state.players[state.turn.player].hand[
            state.players[state.turn.player].numCards - 1
          ]
        );
        effect.active.num.push(
          state.players[state.turn.player].hand[
            state.players[state.turn.player].numCards - 1
          ].type === CardType.magic
            ? 1
            : 0
        );

        effect.activeNumVisible = [];
        effect.activeCardVisible = [];
        for (let i = 0; i < rooms[roomId].numPlayers; i++) {
          effect.activeNumVisible.push(i === state.turn.player);
          effect.activeCardVisible.push(i === state.turn.player);
        }

        setTimeout(() => {
          sendGameState(roomId);
        }, 800);
      },
      (roomId, state, effect, returnVal) => {
        if (!effect.active || !effect.active.card || !effect.active.num) return;

        effect.val.curr++;
        if (
          effect.active.num.some(val => val) &&
          returnVal &&
          returnVal.num !== undefined &&
          effect.active.card[returnVal.num].type === CardType.magic
        ) {
          let privateArr = [];
          for (let i = 0; i < rooms[roomId].numPlayers; i++) {
            privateArr.push(true);
          }
          state.turn.cachedEvent.push({
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
              step: 5,
              choice: null
            }
          });
          state.turn.effect = null;
          playCard(
            roomId,
            state.turn.player,
            effect.active.card[returnVal.num] as MagicCard,
            true
          );
        } else if (
          effect.active.num.every(val => !val) ||
          (returnVal && returnVal.num === -1)
        ) {
          endEffect(roomId, state, effect);
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
    spooky: [
      (roomId: string, state: GameState, effect: Effect) => {
        effect.action = 'choose-own-board';
        effect.actionChanged = true;
        effect.val = { min: 1, max: 1, curr: 0 };
        effect.allowedCards = allCards;
        effect.purpose = 'Sacrifice Hero';

        effect.active = {};
        effect.active.num = [state.turn.player, 1, 3];

        for (let i = 0; i < rooms[roomId].numPlayers; i++) {
          if (
            i !== state.turn.player &&
            state.board[i].heroCards.some(val => val !== null)
          ) {
            effect.active.num.push(i);
          }
        }

        if (effect.active.num.length - 3 > 0) {
          effect.active.num[0] = effect.active.num[3];
          effect.players = [effect.active.num[effect.active.num[2]]];
          effect.choice = [];
        } else {
          endEffect(roomId, state, effect);
        }
        sendGameState(roomId);
      },
      (roomId, state, effect, returnVal, fromPlayer) => {
        if (
          !returnVal ||
          !returnVal.card ||
          returnVal.card.type !== CardType.hero ||
          !effect.active ||
          !effect.active.num ||
          returnVal.card.player !== effect.active.num[0] ||
          fromPlayer === undefined
        )
          return;

        effect.choice = [returnVal.card];
        effect.val.curr++;
        sendGameState(roomId);
        destroyCard(roomId, fromPlayer, returnVal.card);

        if (effect.active.num[2] - 2 < effect.active.num.length - 3) {
          const next = effect.active.num[++effect.active.num[2]];
          effect.players = [next];
          effect.active.num[0] = next;
          effect.val = {
            min: 1,
            max: 1,
            curr: 0
          };
          effect.choice = null;
        }

        setTimeout(() => {
          sendGameState(roomId);
        }, 1200);
      },
      (roomId: string, state: GameState, effect: Effect) =>
        setTimeout(() => {
          endEffect(roomId, state, effect);
        }, 2400)
    ],
    whiskers: [
      ...stealHero,
      ...destroyHero,
      (roomId, state, effect) => {
        setTimeout(() => {
          endEffect(roomId, state, effect);
        }, 2400);
      }
    ],
    wiggles: [
      ...stealHero,
      (roomId, state, effect) => {
        if (
          !effect.choice ||
          typeof effect.choice[0] === 'number' ||
          effect.choice[0].type !== CardType.hero
        )
          return;
        const choice = effect.choice[0];
        state.turn.effect = null;
        useEffect(roomId, state.secret.playerIds[state.turn.player], choice);
      }
    ]
  },

  // GUARDIAN
  ...{
    'calming-voice': [
      (roomId, state, effect) => {
        state.players[state.turn.player].protection.push({
          type: 'steal',
          turns: 1,
          card: effect.card as HeroCard
        });
        endEffect(roomId, state, effect);
      }
    ],
    'guiding-light': searchDiscard(CardType.hero),
    'holy-curselifter': [
      (roomId, state, effect) => {
        effect.action = 'choose-own-board';
        effect.actionChanged = true;
        effect.val = { min: 0, max: 1, curr: 0 };
        effect.allowedCards = [CardType.item];
        effect.players = [state.turn.player];
        effect.purpose = 'Return Curse';
        effect.active = {
          num: [state.turn.player]
        };
        sendGameState(roomId);
      },
      (roomId, state, effect, returnVal) => {
        if (
          !returnVal ||
          !returnVal.card ||
          returnVal.card.player === undefined ||
          returnVal.card.type !== CardType.item ||
          !effect.active ||
          !effect.active.num ||
          !effect.active.num.length ||
          returnVal.card.player !== effect.active.num[0] ||
          returnVal.card.category !== 'cursed' ||
          returnVal.card.heroPlayer === undefined
        ) {
          endEffect(roomId, state, effect);
          return;
        }

        const heroCard = state.board[returnVal.card.heroPlayer].heroCards.find(
          val =>
            val &&
            val.item &&
            returnVal.card &&
            val.item.id === returnVal.card.id
        );
        if (!heroCard || !heroCard.item) return;

        effect.choice = [returnVal.card];
        effect.val.curr++;
        sendGameState(roomId);

        delete heroCard.item.heroId;
        delete heroCard.item.heroPlayer;
        heroCard.item.heroPlayer = state.turn.player;
        addCards(roomId, [heroCard.item], state.turn.player);
        delete heroCard.item;

        setTimeout(() => {
          sendGameState(roomId);
        }, 1200);
      },
      (roomId, state, effect) =>
        setTimeout(() => {
          endEffect(roomId, state, effect);
        }, 2400)
    ],
    'iron-resolve': [
      (roomId, state, effect) => {
        state.players[state.turn.player].protection.push({
          type: 'challenge',
          turns: 1,
          card: effect.card as HeroCard
        });
        endEffect(roomId, state, effect);
      }
    ],
    'mighty-blade': [
      (roomId, state, effect) => {
        state.players[state.turn.player].protection.push({
          type: 'destroy',
          turns: 1,
          card: effect.card as HeroCard
        });
        endEffect(roomId, state, effect);
      }
    ],
    'radiant-horn': searchDiscard(CardType.modifier),
    'vibrant-glow': [
      (roomId, state, effect) => {
        state.players[state.turn.player].passives.push({
          type: 'roll',
          mod: 5,
          turns: 0,
          card: effect.card as HeroCard
        });
        endEffect(roomId, state, effect);
      }
    ],
    'wise-shield': [
      (roomId, state, effect) => {
        state.players[state.turn.player].passives.push({
          type: 'roll',
          mod: 3,
          turns: 0,
          card: effect.card as HeroCard
        });
        endEffect(roomId, state, effect);
      }
    ]
  },

  // MAGIC
  ...{
    'call-to-the-fallen': searchDiscard(CardType.hero),
    'critical-boost': [
      ...drawCard(3),
      ...discardCards(1),
      (roomId, state, effect) =>
        setTimeout(() => {
          endEffect(roomId, state, effect);
        }, 1200)
    ],
    'destructive-spell': [
      (roomId: string, state: GameState, effect: Effect) => {
        if (state.players[state.turn.player].numCards < 1) {
          endEffect(roomId, state, effect);
          return;
        }

        effect.action = 'choose-hand';
        effect.actionChanged = true;
        effect.val = { min: 1, max: 1, curr: 0 };
        effect.allowedCards = allCards;
        effect.players = [state.turn.player];
        effect.purpose = 'Discard Card';
        effect.active = {
          num: [state.turn.player, 1]
        };
        effect.choice = [];
        sendGameState(roomId);
      },
      receiveDiscardCard,
      ...destroyHero,
      (roomId, state, effect) =>
        setTimeout(() => {
          endEffect(roomId, state, effect);
        }, 2400)
    ],
    'entangling-trap': [
      (roomId: string, state: GameState, effect: Effect) => {
        if (state.players[state.turn.player].numCards < 2) {
          endEffect(roomId, state, effect);
          return;
        }

        effect.action = 'choose-hand';
        effect.actionChanged = true;
        effect.val = { min: 2, max: 2, curr: 0 };
        effect.allowedCards = allCards;
        effect.players = [state.turn.player];
        effect.purpose = 'Discard Cards';
        effect.active = {
          num: [state.turn.player, 1]
        };
        effect.choice = [];
        sendGameState(roomId);
      },
      receiveDiscardCard,
      ...stealHero,
      (roomId, state, effect) =>
        setTimeout(() => {
          endEffect(roomId, state, effect);
        }, 1200)
    ],
    'enchanted-spell': [
      (roomId, state, effect) => {
        state.players[state.turn.player].passives.push({
          type: 'roll',
          mod: 2,
          turns: 0,
          card: effect.card as MagicCard
        });
        endEffect(roomId, state, effect);
      }
    ],
    'forced-exchange': [
      (roomId, state, effect) => {
        effect.action = 'choose-other-boards';
        effect.actionChanged = true;
        effect.val = { min: 0, max: 1, curr: 0 };
        effect.allowedCards = [];
        effect.players = [state.turn.player];
        effect.purpose = 'Choose Hero';
        effect.choice = [];
        sendGameState(roomId);
      },
      (roomId, state, effect, returnVal) => {
        if (!returnVal || !returnVal.card) {
          endEffect(roomId, state, effect);
          return;
        }

        effect.choice = [returnVal.card];
        effect.val.curr++;
        sendGameState(roomId);
      },
      (roomId, state, effect) => {
        effect.action = 'choose-own-board';
        effect.actionChanged = true;
        effect.val = { min: 0, max: 1, curr: 0 };
        effect.allowedCards = [];
        effect.players = [state.turn.player];
        effect.purpose = 'Swap Hero';
        sendGameState(roomId);
      },
      (roomId, state, effect, returnVal) => {
        if (
          !returnVal ||
          !returnVal.card ||
          !effect.choice ||
          typeof effect.choice[0] === 'number' ||
          effect.choice[0].player === undefined ||
          effect.choice[0].type !== CardType.hero ||
          returnVal.card.player === undefined ||
          returnVal.card.type !== CardType.hero ||
          state.players[returnVal.card.player].protection.some(
            val => val.type === 'steal'
          )
        ) {
          endEffect(roomId, state, effect);
          return;
        }

        effect.choice = [...(effect.choice as AnyCard[]), returnVal.card];
        effect.val.curr++;
        sendGameState(roomId);

        swapCard(
          roomId,
          effect.choice[0].player as number,
          effect.choice[0] as HeroCard,
          effect.choice[1].player as number,
          effect.choice[1] as HeroCard
        );

        setTimeout(() => {
          sendGameState(roomId);
        }, 1200);
      },
      (roomId, state, effect) =>
        setTimeout(() => {
          endEffect(roomId, state, effect);
        }, 2400)
    ],
    'forceful-winds': [
      (roomId, state, effect) => {
        for (let i = 0; i < rooms[roomId].numPlayers; i++) {
          state.board[i].heroCards.map(val => {
            if (val?.item) {
              delete val.item.heroId;
              delete val.item.heroPlayer;
              val.item.heroPlayer = i;
              addCards(roomId, [val.item], i);
              delete val.item;
            }
          });
        }
        endEffect(roomId, state, effect);
      }
    ],
    'winds-of-change': [
      (roomId, state, effect) => {
        effect.action = 'choose-boards';
        effect.actionChanged = true;
        effect.val = { min: 0, max: 1, curr: 0 };
        effect.allowedCards = [CardType.item];
        effect.players = [state.turn.player];
        effect.purpose = 'Return Item';
        sendGameState(roomId);
      },
      (roomId, state, effect, returnVal) => {
        if (
          !returnVal ||
          !returnVal.card ||
          returnVal.card.player === undefined ||
          returnVal.card.type !== CardType.item ||
          !returnVal.card.heroPlayer
        ) {
          endEffect(roomId, state, effect);
          return;
        }

        const heroCard = state.board[returnVal.card.heroPlayer].heroCards.find(
          val =>
            val &&
            val.item &&
            returnVal.card &&
            val.item.id === returnVal.card.id
        );
        if (!heroCard || !heroCard.item) return;

        effect.choice = [returnVal.card];
        effect.val.curr++;
        sendGameState(roomId);

        delete heroCard.item.heroId;
        delete heroCard.item.heroPlayer;
        heroCard.item.heroPlayer = state.turn.player;
        addCards(roomId, [heroCard.item], state.turn.player);
        delete heroCard.item;

        setTimeout(() => {
          sendGameState(roomId);
        }, 1200);

        setTimeout(() => {
          sendGameState(roomId);
        }, 1200);
      },
      (roomId: string, state: GameState, effect: Effect) => {
        effect.action = 'draw';
        effect.actionChanged = true;
        effect.allowedCards = [];
        effect.val = { min: 1, max: 1, curr: 0 };
        effect.players = [state.turn.player];
        effect.purpose = 'Draw Card';
        setTimeout(() => {
          sendGameState(roomId);
        }, 2400);
      },
      (roomId: string, state: GameState, effect: Effect) => {
        drawCards(roomId, state.turn.player, 1);
        effect.val.curr++;
        sendGameState(roomId);
      },
      (roomId, state, effect) =>
        setTimeout(() => {
          endEffect(roomId, state, effect);
        }, 800)
    ]
  },

  // MONSTER
  ...{
    'monster-discard': [
      (roomId: string, state: GameState, effect: Effect) => {
        effect.action = 'choose-hand';
        effect.actionChanged = true;
        effect.val = {
          min: Math.min(state.players[state.turn.player].numCards, 2),
          max: 2,
          curr: 0
        };
        effect.allowedCards = allCards;
        effect.players = [state.turn.player];
        effect.purpose = 'Discard Cards';
        effect.active = {
          num: [state.turn.player, 2]
        };
        effect.choice = [];
        sendGameState(roomId);
      },
      receiveDiscardCard,
      (roomId, state, effect) =>
        setTimeout(() => {
          endEffect(roomId, state, effect);
        }, 1200)
    ],
    'monster-sacrifice': [
      ...sacrificeHero,
      (roomId, state, effect) =>
        setTimeout(() => {
          endEffect(roomId, state, effect);
        }, 2400)
    ]
  },

  // ITEM
  'suspiciously-shiny-coin': [
    ...discardCards(1),
    (roomId, state, effect) =>
      setTimeout(() => {
        if (!state.mainDeck.preparedCard) return;
        state.turn.effect = null;
        useEffect(
          roomId,
          state.secret.playerIds[state.turn.player],
          state.mainDeck.preparedCard.card
        );
      }, 2400)
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
