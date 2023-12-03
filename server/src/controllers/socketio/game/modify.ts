import {
  monsterRequirements,
  rollRequirements
} from '../../../functions/abilities';
import { discardCard, removeBoard } from '../../../functions/game';
import { checkCredentials } from '../../../functions/helpers';
import { rooms } from '../../../rooms';
import { sendGameState } from '../../../server';
import { CardType, HeroCard, ModifierCard, MonsterCard } from '../../../types';
import { endTurnDiscard, useEffect } from './useEffect';

export const meetsRollRequirements = (
  type: 'fail' | 'pass',
  card: HeroCard | MonsterCard,
  roll: number
) => {
  let req;
  req = rollRequirements[card.name.replaceAll(' ', '-').toLowerCase()][type];
  if (!req) return false;

  if (req < 0) {
    if (roll <= Math.abs(req)) {
      return true;
    } else {
      return false;
    }
  } else {
    if (roll >= req) {
      return true;
    } else {
      return false;
    }
  }
};

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

    // EFFECT AFTERWARDS
    if (state.match.isReady.every(val => val === false)) {
      const cardUserId = state.secret.playerIds[state.turn.player];

      // use card
      if (state.mainDeck.preparedCard) {
        // challenge
        if (
          state.dice.defend &&
          state.mainDeck.preparedCard.card &&
          state.mainDeck.preparedCard.card.player !== undefined
        ) {
          if (state.dice.main.total >= state.dice.defend.total) {
            // fail
            state.mainDeck.preparedCard.successful = false;
            if (state.mainDeck.preparedCard.card.type === 'hero') {
              const player = state.mainDeck.preparedCard.card.player;
              if (player === undefined) return;
              removeBoard(
                roomId,
                state.mainDeck.preparedCard.card.player,
                state.mainDeck.preparedCard.card
              );
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
              endTurnDiscard(roomId, cardUserId);
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

            if (preppedCard.type === 'hero' || preppedCard.type === 'item') {
              if (preppedCard.type === 'hero') {
                preppedCard.freeUse = true;
              }
              state.turn.phaseChanged = true;
              state.turn.phase = 'play';

              state.dice.main.roll = [1, 1];
              state.dice.main.total = 0;
              state.dice.main.modifier = [];
              state.dice.main.modValues = [];
              delete state.turn.challenger;
              state.match.isReady.fill(null);

              setTimeout(() => {
                sendGameState(roomId);
                state.turn.phaseChanged = false;
              }, 1200);
            } else if (preppedCard.type === 'magic') {
              state.dice.main.roll = [1, 1];
              state.dice.main.total = 0;
              state.dice.main.modifier = [];
              state.dice.main.modValues = [];
              delete state.turn.challenger;
              state.match.isReady.fill(null);
              useEffect(roomId, cardUserId, preppedCard);
            }
          }
        }

        // attack monster
        else if (
          state.mainDeck.preparedCard.card.type === CardType.large &&
          state.mainDeck.preparedCard.card.player === undefined
        ) {
          const preppedCard = state.mainDeck.preparedCard.card;

          if (
            meetsRollRequirements('pass', preppedCard, state.dice.main.total)
          ) {
            // monster slain
            state.mainDeck.preparedCard.successful = true;
            preppedCard.player = state.turn.player;
            state.board[state.turn.player].largeCards.push(preppedCard);
            state.mainDeck.monsters.map((val, i) => {
              if (val.id === preppedCard.id) {
                state.mainDeck.monsters[i] =
                  state.secret.monsterPile.pop() as MonsterCard;
              }
            });
            sendGameState(roomId);
            state.mainDeck.preparedCard = null;
            setTimeout(() => {
              state.dice.main.roll = [1, 1];
              state.dice.main.total = 0;
              state.dice.main.modifier = [];
              state.dice.main.modValues = [];

              if (state.turn.movesLeft === 0) {
                state.match.isReady.fill(null);
                endTurnDiscard(roomId, cardUserId);
              } else {
                state.match.isReady.fill(null);
                state.turn.phase = 'play';
                state.turn.phaseChanged = true;
                sendGameState(roomId);
                state.turn.phaseChanged = false;
              }
            }, 1200);
          } else if (
            meetsRollRequirements('fail', preppedCard, state.dice.main.total)
          ) {
            // punishment
            state.dice.main.roll = [1, 1];
            state.dice.main.total = 0;
            state.dice.main.modifier = [];
            state.dice.main.modValues = [];
            state.mainDeck.preparedCard.successful = false;
            state.match.isReady.fill(null);
            useEffect(roomId, cardUserId, preppedCard);
          } else {
            // neutral
            state.mainDeck.preparedCard.successful = false;
            sendGameState(roomId);
            state.mainDeck.preparedCard = null;
            setTimeout(() => {
              state.dice.main.roll = [1, 1];
              state.dice.main.total = 0;
              state.dice.main.modifier = [];
              state.dice.main.modValues = [];

              if (state.turn.movesLeft === 0) {
                state.match.isReady.fill(null);
                endTurnDiscard(roomId, cardUserId);
              } else {
                state.match.isReady.fill(null);
                state.turn.phase = 'play';
                state.turn.phaseChanged = true;
                sendGameState(roomId);
                state.turn.phaseChanged = false;
              }
            }, 1200);
          }
        }

        // hero ability
        else if (
          state.mainDeck.preparedCard &&
          state.mainDeck.preparedCard.card.type === CardType.hero &&
          state.mainDeck.preparedCard.card.player !== undefined
        ) {
          const preppedCard = state.mainDeck.preparedCard.card;

          if (
            meetsRollRequirements('pass', preppedCard, state.dice.main.total)
          ) {
            // pass
            state.dice.main.roll = [1, 1];
            state.dice.main.total = 0;
            state.dice.main.modifier = [];
            state.dice.main.modValues = [];
            state.mainDeck.preparedCard.successful = true;
            state.match.isReady.fill(null);
            useEffect(roomId, cardUserId, preppedCard);
          } else {
            // fail
            state.mainDeck.preparedCard.successful = false;
            sendGameState(roomId);
            state.mainDeck.preparedCard = null;
            setTimeout(() => {
              state.dice.main.roll = [1, 1];
              state.dice.main.total = 0;
              state.dice.main.modifier = [];
              state.dice.main.modValues = [];

              if (state.turn.movesLeft === 0) {
                state.match.isReady.fill(null);
                endTurnDiscard(roomId, cardUserId);
              } else {
                state.match.isReady.fill(null);
                state.turn.phase = 'play';
                state.turn.phaseChanged = true;
                sendGameState(roomId);
                state.turn.phaseChanged = false;
              }
            }, 1200);
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
