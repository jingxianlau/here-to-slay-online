import { endTurnDiscard } from '../controllers/socketio/game/useEffect';
import { rooms } from '../rooms';
import { sendGameState } from '../server';
import { AnyCard, CardType } from '../types';
import { addCards, drawCards, playCard, removeCardIndex } from './game';

interface returnType {
  card?: AnyCard;
  num?: number;
}

export const endEffect = (
  roomId: string,
  playerNum: number,
  updatePhase = true
) => {
  setTimeout(() => {
    const state = rooms[roomId].state;
    state.turn.effect = null;
    if (updatePhase) {
      if (state.turn.movesLeft > 0) {
        state.turn.phase = 'play';
        state.turn.phaseChanged = true;
        sendGameState(roomId);
      } else endTurnDiscard(roomId, state.secret.playerIds[playerNum]);
    }
  }, 2400);
};

export const choosePlayer = (
  roomId: string,
  playerNum: number,
  text = 'Choose Player'
) => {
  const state = rooms[roomId].state;
  if (!state.turn.effect) return;

  state.turn.effect.action = 'choose-player';
  state.turn.effect.actionChanged = true;
  state.turn.effect.val = 1;
  state.turn.effect.allowedCards = [];
  state.turn.effect.players = [playerNum];
  state.turn.effect.purpose = text;
  sendGameState(roomId);
};
export const receivePlayer = (
  roomId: string,
  playerNum: number,
  returnVal?: returnType
) => {
  const state = rooms[roomId].state;
  if (!state.turn.effect || !returnVal || !returnVal.num) return;
  state.turn.effect.choice = [returnVal.num];
  state.turn.effect.val--;
  sendGameState(roomId);
};

export const pickCard = (roomId: string, playerNum: number) => {
  const state = rooms[roomId].state;
  if (
    !state.turn.effect ||
    !state.turn.effect.choice ||
    typeof state.turn.effect.choice[0] !== 'number'
  )
    return;

  state.turn.effect.action = 'choose-other-hand-hide';
  state.turn.effect.actionChanged = true;
  state.turn.effect.val = 1;
  state.turn.effect.allowedCards = [];
  state.turn.effect.players = [playerNum];
  state.turn.effect.purpose = 'Choose Card';
  state.turn.effect.active = {
    num: [
      state.turn.effect.choice[0],
      state.players[state.turn.effect.choice[0]].numCards
    ]
  };
  state.turn.effect.choice = null;
  sendGameState(roomId);
};
const addCard = (roomId: string, playerNum: number, returnVal?: returnType) => {
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
  state.turn.effect.val--;
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
    if (state.turn.effect?.active) {
      delete state.turn.effect.active.num;
    }
  }, 400);
};
export const pickFromHand = [
  (roomId: string, playerNum: number) => choosePlayer(roomId, playerNum),
  receivePlayer,
  pickCard,
  addCard
];

export const ifMayPlay = (
  type: CardType.hero | CardType.item | CardType.magic
) => {
  return [
    (roomId: string, playerNum: number) => {
      const state = rooms[roomId].state;
      if (!state.turn.effect || state.players[playerNum].numCards <= 0) return;

      setTimeout(() => {
        if (state.turn.effect) {
          state.turn.effect.action = 'play';
          state.turn.effect.actionChanged = true;
          state.turn.effect.val = 1;
          state.turn.effect.allowedCards = [];
          state.turn.effect.players = [playerNum];
          state.turn.effect.purpose = 'Play';
          state.turn.effect.active = {
            num: [
              state.players[playerNum].hand[
                state.players[playerNum].numCards - 1
              ].type === type
                ? 1
                : 0
            ],
            card: [
              state.players[playerNum].hand[
                state.players[playerNum].numCards - 1
              ]
            ]
          };
          sendGameState(roomId);
        }
      }, 1200);
    },
    (roomId: string, playerNum: number, returnVal?: returnType) => {
      const state = rooms[roomId].state;
      if (
        !state.turn.effect ||
        !state.turn.effect.active ||
        !state.turn.effect.active.card ||
        !state.turn.effect.active.num ||
        state.turn.effect.active.card[0].type !== type
      )
        return;

      state.turn.effect.val--;
      if (state.turn.effect.active.num[0] === 1 && returnVal && returnVal.num) {
        playCard(roomId, playerNum, state.turn.effect.active.card[0], true);
      }
    }
  ];
};

export const drawCard = (num = 1) => [
  (roomId: string, playerNum: number) => {
    const state = rooms[roomId].state;
    if (!state.turn.effect) return;
    state.turn.effect.action = 'draw';
    state.turn.effect.actionChanged = true;
    state.turn.effect.allowedCards = [];
    state.turn.effect.val = 1;
    state.turn.effect.players = [playerNum];
    state.turn.effect.purpose = 'Draw Card';
    sendGameState(roomId);
  },
  (roomId: string, playerNum: number) => {
    const state = rooms[roomId].state;
    if (!state.turn.effect) return;
    drawCards(roomId, playerNum, num);
    state.turn.effect.active = {
      card: [state.players[playerNum].hand[state.players[playerNum].numCards]]
    };
    state.turn.effect.val--;
  }
];

export const playFromHand = (
  type: CardType.hero | CardType.magic | CardType.item
) => [
  (roomId: string, playerNum: number) => {
    const state = rooms[roomId].state;
    if (!state.turn.effect) return;
    state.turn.effect.action = 'choose-hand';
    state.turn.effect.actionChanged = true;
    state.turn.effect.allowedCards = [type];
    state.turn.effect.val = 1;
    state.turn.effect.players = [playerNum];
    state.turn.effect.purpose = `Play ${type}`;
    sendGameState(roomId);
  },
  (roomId: string, playerNum: number, returnVal?: returnType) => {
    const state = rooms[roomId].state;
    if (!state.turn.effect) return;

    if (!returnVal?.card) {
      state.turn.effect.choice = [0];
      state.turn.effect.val--;
      sendGameState(roomId);
      endEffect(roomId, playerNum);
    } else if (returnVal && returnVal.card && returnVal.card.type === type) {
      state.turn.effect.choice = [returnVal.card];
      playCard(roomId, playerNum, returnVal.card, true);
      state.turn.effect.val--;
    }
  }
];
