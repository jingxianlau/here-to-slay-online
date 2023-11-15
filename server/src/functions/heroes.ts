import { rooms } from '../rooms';
import { sendGameState } from '../server';
import { AnyCard, CardType, GameState, allCards } from '../types';
import { addCards, drawCards, playCard, removeCard, swapHands } from './game';

const endEffect = (roomId: string, playerNum: number) => {
  const state = rooms[roomId].state;
  state.turn.effect = null;
  state.turn.phase = 'play';
  state.turn.phaseChanged = true;
  sendGameState(roomId);
  state.turn.phaseChanged = false;
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

      sendGameState(roomId);
    },
    (roomId, playerNum, returnVal) => {
      const state = rooms[roomId].state;
      if (!state.turn.effect || !returnVal || !returnVal.player) return;
      const userNum = returnVal.player;
      swapHands(state, playerNum, userNum);

      sendGameState(roomId);
    },
    endEffect
  ],
  // draw card and play hero;
  'fuzzy-cheeks': [
    (roomId, playerNum) => {
      const state = rooms[roomId].state;
      if (!state.turn.effect) return;
      drawCards(roomId, playerNum, 1);
      sendGameState(roomId);

      state.turn.effect.action = 'choose-hand';
      state.turn.effect.allowedCards = [CardType.hero];
      state.turn.effect.val = 1;
      state.turn.effect.players = [playerNum];
      setTimeout(() => {
        sendGameState(roomId);
      }, 1200);
    },
    (roomId, playerNum, returnVal) => {
      const state = rooms[roomId].state;
      if (
        !state.turn.effect ||
        !returnVal ||
        !returnVal.card ||
        returnVal.card.type !== CardType.hero
      )
        return;

      playCard(roomId, playerNum, returnVal.card);
    },
    endEffect
  ],
  // each must give a card to player
  'greedy-cheeks': [
    (roomId, playerNum) => {
      const state = rooms[roomId].state;
      if (!state.turn.effect) return;

      state.turn.effect.action = 'choose-hand';
      state.turn.effect.allowedCards = allCards;
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
    endEffect
  ]
};
