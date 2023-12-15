import { rollDice, removeFreeUse } from '../../../functions/gameHelpers';
import { hasCard, playCard, discardCard } from '../../../functions/game';
import { checkCredentials, validSender } from '../../../functions/helpers';
import { rooms } from '../../../rooms';
import { sendGameState } from '../../../server';
import { AnyCard, CardType, HeroClass } from '../../../types';
import { endTurnDiscard, useEffect } from './useEffect';
import random from 'lodash.random';

export const prepareCard = (roomId: string, userId: string, card: AnyCard) => {
  const playerNum = validSender(roomId, userId);
  const state = rooms[roomId].state;

  if (
    state.turn.phase === 'choose-hero' &&
    state.turn.player === playerNum &&
    state.mainDeck.preparedCard &&
    state.mainDeck.preparedCard.card.type === CardType.item &&
    card.type === CardType.hero &&
    !card.item &&
    card.player !== undefined
  ) {
    // chosen hero for item
    const itemHero =
      state.board[card.player].heroCards[
        state.board[card.player].heroCards.findIndex(
          val => val && val.id === card.id
        )
      ];
    if (!itemHero) return;
    itemHero.item = state.mainDeck.preparedCard.card;
    itemHero.item.heroId = card.id;
    itemHero.item.heroPlayer = card.player;
    if (itemHero.item.name.includes('Mask')) {
      state.board[card.player].classes[itemHero.class]--;
      state.board[card.player].classes[
        itemHero.item.name.split(' ')[0].toLowerCase() as HeroClass
      ]++;
    }
    sendGameState(roomId);
    setTimeout(() => {
      state.turn.phase = 'challenge';
      state.turn.phaseChanged = true;
      sendGameState(roomId);
    }, 1200);
  } else if (
    state.turn.phase === 'play' &&
    playerNum !== -1 &&
    card.player === playerNum &&
    state.players[playerNum].hand.some(val => card.id === val.id) &&
    (card.type === CardType.hero ||
      card.type === CardType.magic ||
      card.type === CardType.item) &&
    (card.type !== CardType.hero ||
      state.board[playerNum].heroCards.some(val => val === null)) &&
    (card.type !== CardType.item ||
      state.board.some(val => val.heroCards.some(val => val && !val.item))) &&
    state.turn.movesLeft >= 1
  ) {
    removeFreeUse(roomId);
    playCard(roomId, playerNum, card);
  } else return;
};

export const challenge = (
  roomId: string,
  userId: string,
  challenged: boolean,
  cardId: string | undefined
) => {
  const playerNum = checkCredentials(roomId, userId);
  const state = rooms[roomId].state;
  if (
    playerNum === -1 ||
    state.turn.phase !== 'challenge' ||
    !state.mainDeck.preparedCard ||
    (cardId && !hasCard(roomId, playerNum, cardId))
  ) {
    return;
  }

  state.match.isReady[playerNum] = challenged;
  sendGameState(roomId);

  if (state.match.isReady.every(val => val === false)) {
    state.mainDeck.preparedCard.successful = true;
    sendGameState(roomId);

    setTimeout(() => {
      state.match.isReady.fill(null);
      if (state.mainDeck.preparedCard?.card.type === CardType.hero) {
        state.mainDeck.preparedCard.card.freeUse = true;
      }
      if (state.mainDeck.preparedCard?.card.type === CardType.magic) {
        useEffect(roomId, userId, state.mainDeck.preparedCard.card);
        state.mainDeck.preparedCard = null;
        return;
      }
      state.mainDeck.preparedCard = null;

      if (state.turn.movesLeft > 0) {
        if (!state.turn.cachedEvent || state.turn.cachedEvent.length < 1) {
          state.turn.phase = 'play';
          state.turn.phaseChanged = true;
        } else {
          const cached = state.turn.cachedEvent.pop();
          if (!cached) return;
          state.turn.phase = cached.phase;
          state.turn.effect = cached.effect;
          state.turn.cachedEvent = [];
        }
        sendGameState(roomId);
      } else {
        endTurnDiscard(roomId, state.secret.playerIds[state.turn.player]);
      }
    }, 1200);
  } else if (challenged && cardId) {
    if (!discardCard(roomId, playerNum, cardId)) {
      return;
    }
    sendGameState(roomId);
    state.match.isReady.fill(null);

    setTimeout(() => {
      state.dice.main.roll = [1, 1];
      state.dice.main.total = 0;
      state.dice.main.modifier = [];

      state.turn.phase = 'challenge-roll';
      state.turn.phaseChanged = true;
      state.turn.challenger = playerNum;
      state.turn.isRolling = true;
      sendGameState(roomId);
    }, 1200);
  }
};

export const challengeRoll = (roomId: string, userId: string) => {
  const playerNum = validSender(roomId, userId);
  const state = rooms[roomId].state;
  if (
    playerNum === -1 ||
    state.turn.phase !== 'challenge-roll' ||
    !state.mainDeck.preparedCard ||
    (state.dice.main.total === 0 && state.turn.challenger !== playerNum) ||
    (state.dice.main.total > 0 && state.turn.player !== playerNum)
  ) {
    return;
  }

  const roll: [number, number] = [random(1, 6), random(1, 6)];
  const val = roll[0] + roll[1];

  if (state.dice.main.total === 0) {
    state.dice.main.roll = roll;
    state.dice.main.total = val;
    state.dice.defend = {
      roll: [1, 1],
      total: 0,
      modifier: [],
      modValues: []
    };
  } else if (state.dice.defend !== null) {
    state.dice.defend.roll = roll;
    state.dice.defend.total = val;
    for (let i = 0; i < state.players[state.turn.player].passives.length; i++) {
      const passive = state.players[state.turn.player].passives[i];
      if (passive.type === 'roll') {
        state.dice.defend.total += passive.mod;
        state.dice.defend.modifier.push(passive.card);
        state.dice.defend.modValues.push(passive.mod);
      }
    }
  }
  sendGameState(roomId);

  if (state.dice.defend && state.dice.defend.total > 0) {
    setTimeout(() => {
      state.turn.phaseChanged = true;
      state.turn.phase = 'modify';
      state.turn.isRolling = false;
      sendGameState(roomId);
    }, 3000);
  }
};
