import { discardCard } from '../../../functions/game';
import { checkCredentials } from '../../../functions/helpers';
import { rooms } from '../../../rooms';
import { sendGameState } from '../../../server';
import { ModifierCard } from '../../../types';
import { endTurnDiscard, useEffect } from './useEffect';

export const modifyRoll = (
  roomId: string,
  userId: string,
  info: {
    modifier: ModifierCard;
    effect: 0 | 1;
    dice: 0 | 1;
  } | null,
  modify: boolean
) => {
  const playerNum = checkCredentials(roomId, userId);
  const state = rooms[roomId].state;

  if (!modify) {
    state.match.isReady[playerNum] = false;
    sendGameState(roomId);
    if (state.match.isReady.every(val => val === false)) {
      // TODO: use card
      if (state.mainDeck.preparedCard && state.dice.defend) {
        if (state.dice.main.total >= state.dice.defend.total) {
          // fail
          state.mainDeck.preparedCard.successful = false;
          if (state.mainDeck.preparedCard.card.type === 'hero') {
            const player = state.mainDeck.preparedCard.card.player;
            const id = state.mainDeck.preparedCard.card.id;
            if (player === undefined) return;
            state.board[player].heroCards.filter(val => val.id !== id);
          }
          sendGameState(roomId);

          state.dice.main.roll = [1, 1];
          state.dice.main.total = 0;
          state.dice.main.modifier = [];
          state.dice.main.modValues = [];
          state.dice.defend = null;
          delete state.turn.challenger;
          state.mainDeck.preparedCard = null;

          if (state.turn.movesLeft === 0) {
            endTurnDiscard(roomId, userId);
          } else {
            rooms[roomId].state.turn.phase = 'play';
            rooms[roomId].state.turn.phaseChanged = true;
            setTimeout(() => {
              sendGameState(roomId);
              state.turn.phaseChanged = false;
            }, 1200);
          }
        } else {
          state.mainDeck.preparedCard.successful = true;
          sendGameState(roomId);

          const preppedCard = state.mainDeck.preparedCard.card;

          state.mainDeck.preparedCard = null;
          state.dice.defend = null;

          switch (preppedCard.type) {
            case 'hero':
              preppedCard.freeUse = true;
              state.turn.phaseChanged = true;
              state.turn.phase = 'play';

              state.dice.main.roll = [1, 1];
              state.dice.main.total = 0;
              state.dice.main.modifier = [];
              state.dice.main.modValues = [];
              delete state.turn.challenger;

              setTimeout(() => {
                sendGameState(roomId);
                state.turn.phaseChanged = false;
              }, 1200);
              break;
            case 'item':
              // use item
              break;
            case 'magic':
              state.dice.main.roll = [1, 1];
              state.dice.main.total = 0;
              state.dice.main.modifier = [];
              state.dice.main.modValues = [];
              delete state.turn.challenger;
              useEffect(roomId, userId, preppedCard);
          }
        }
      }
    } else return;
  }

  if (
    playerNum === -1 ||
    state.turn.phase !== 'modify' ||
    !info ||
    (info.dice === 1 && !state.dice.defend) ||
    (info.modifier.modifier.length === 1 && info.effect === 1) ||
    !discardCard(roomId, playerNum, info.modifier.id)
  ) {
    return;
  }

  const { dice, effect, modifier } = info;

  if (dice === 0) {
    const mod = modifier.modifier[effect] as number;
    state.dice.main.modifier.push(modifier);
    state.dice.main.modValues.push(mod);
    state.dice.main.total += mod;
  } else {
    const mod = modifier.modifier[effect] as number;
    if (!state.dice.defend) return;
    state.dice.defend.modifier.push(modifier);
    state.dice.defend.modValues.push(mod);
    state.dice.defend.total += mod;
  }

  state.match.isReady.fill(dice === 0 ? true : null);
  sendGameState(roomId);
};
