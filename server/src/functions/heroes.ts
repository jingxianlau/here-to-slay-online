import { endTurnDiscard } from '../controllers/socketio/game/useEffect';
import { rooms } from '../rooms';
import { sendGameState } from '../server';
import { AnyCard, CardType, GameState, allCards } from '../types';
import {
  addCards,
  drawCards,
  nextPlayer,
  playCard,
  removeCard,
  swapHands
} from './game';

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

export const heroEffects: {
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
