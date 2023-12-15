import {
  nextPlayer,
  removeFreeUse,
  rollDice
} from '../../../functions/gameHelpers';
import { discardCard } from '../../../functions/game';
import { checkCredentials, validSender } from '../../../functions/helpers';
import { heroAbilities } from '../../../functions/abilities';
import { rooms } from '../../../rooms';
import { disconnectAll, sendGameState } from '../../../server';
import {
  AnyCard,
  CardType,
  HeroCard,
  HeroClass,
  ItemCard,
  MagicCard,
  MonsterCard
} from '../../../types';
import cloneDeep from 'lodash.clonedeep';

function isCard(object: AnyCard | number | null): object is AnyCard {
  return typeof object !== 'number' && object !== null;
}

export const useEffectRoll = (
  roomId: string,
  userId: string,
  heroCard: HeroCard
) => {
  const playerNum = validSender(roomId, userId);
  if (playerNum === -1) return;
  const gameState = rooms[roomId].state;
  if (
    gameState.dice.main.total !== 0 ||
    gameState.turn.player !== playerNum ||
    (gameState.turn.phase !== 'play' &&
      gameState.turn.phase !== 'use-effect-roll') ||
    (heroCard.item && heroCard.item.name === 'Sealing Key')
  ) {
    return;
  }

  // DEV
  // useEffect(roomId, userId, heroCard);
  // return;
  // DEV

  if (
    gameState.turn.phase === 'use-effect-roll' &&
    gameState.mainDeck.preparedCard &&
    gameState.mainDeck.preparedCard.card.type === CardType.hero &&
    gameState.mainDeck.preparedCard.card.id === heroCard.id
  ) {
    rollDice(roomId);
  } else {
    if (
      (gameState.turn.movesLeft < 1 && !heroCard.freeUse) ||
      heroCard.abilityUsed
    )
      return;

    gameState.turn.phase = 'use-effect-roll';
    gameState.turn.phaseChanged = true;
    gameState.mainDeck.preparedCard = { card: heroCard, successful: null };

    if (!heroCard.freeUse) {
      gameState.turn.movesLeft--;
    } else {
      removeFreeUse(roomId);
    }
    gameState.board[playerNum].heroCards.forEach(val => {
      if (val && val.id === heroCard.id) {
        val.abilityUsed = true;
      }
    });

    gameState.turn.isRolling = true;
    sendGameState(roomId);
  }
};

export const useEffect = (
  roomId: string,
  userId: string,
  card: HeroCard | MagicCard | MonsterCard | ItemCard,
  returnVal?: AnyCard | number
) => {
  const playerNum = checkCredentials(roomId, userId);
  if (playerNum === -1 || !card) return;
  const state = rooms[roomId].state;
  if (
    (state.turn.effect &&
      (state.turn.phase !== 'use-effect' ||
        !state.turn.effect.players.some(val => val === playerNum) ||
        state.turn.effect.card.id !== card.id)) ||
    (!state.turn.effect && state.turn.player !== playerNum)
  ) {
    return;
  }

  const cardName = card.name.replaceAll(' ', '-').toLowerCase();

  if (state.turn.effect) {
    // next function in effect
    state.turn.effect.players = state.turn.effect.players.filter(
      val => val !== playerNum
    );

    heroAbilities[card.type !== CardType.large ? cardName : card.punishment][
      ++state.turn.effect.step
    ](
      roomId,
      state,
      state.turn.effect,
      returnVal !== undefined
        ? {
            card: isCard(returnVal) ? returnVal : undefined,
            num: typeof returnVal === 'number' ? returnVal : undefined
          }
        : undefined,
      state.turn.player !== playerNum ? playerNum : undefined
    );

    if (!state.turn.effect) return;
    if (
      state.turn.effect.players.length === 0 &&
      ((state.turn.effect.val.max === state.turn.effect.val.min &&
        state.turn.effect.val.max === state.turn.effect.val.curr) ||
        (state.turn.effect.val.curr >= state.turn.effect.val.min &&
          state.turn.effect.val.curr <= state.turn.effect.val.max &&
          state.turn.effect.goNext) ||
        (state.turn.effect.val.min !== state.turn.effect.val.max &&
          state.turn.effect.val.max === state.turn.effect.val.curr))
    ) {
      heroAbilities[card.type !== CardType.large ? cardName : card.punishment][
        ++state.turn.effect.step
      ](roomId, state, state.turn.effect);
    } else {
      state.turn.effect.step--;
    }
  } else if (
    state.board[playerNum].heroCards.some(val => val?.id === card.id)
  ) {
    // new effect
    let privateArr = [];
    for (let i = 0; i < rooms[roomId].numPlayers; i++) {
      privateArr.push(true);
    }
    state.turn.phase = 'use-effect';
    state.turn.phaseChanged = true;
    state.mainDeck.preparedCard = null;
    state.turn.effect = {
      action: 'none',
      actionChanged: false,
      players: [],
      val: { min: -1, max: -1, curr: -1 },
      goNext: false,
      step: 0,
      choice: null,
      activeNumVisible: cloneDeep(privateArr),
      activeCardVisible: cloneDeep(privateArr),
      purpose: '',
      card: card
    };

    heroAbilities[card.type !== CardType.large ? cardName : card.punishment][0](
      roomId,
      state,
      state.turn.effect
    );
  }
};

// misc functions that i have no idea where to put
export const pass = (roomId: string, userId: string) => {
  const playerNum = validSender(roomId, userId);
  if (playerNum === -1) return;
  const state = rooms[roomId].state;
  removeFreeUse(roomId);

  rooms[roomId].state.turn.movesLeft = 0;
  sendGameState(roomId);
  setTimeout(() => {
    if (state.players[playerNum].numCards > 7) {
      state.turn.phase = 'end-turn-discard';
      state.turn.toDiscard = state.players[playerNum].numCards - 7;
      state.turn.phaseChanged = true;
      sendGameState(roomId);
    } else {
      nextPlayer(roomId);
    }
  }, 200);
};

function checkWin(roomId: string): boolean[] | -1 {
  const state = rooms[roomId].state;
  let winners: boolean[] = [];
  for (let i = 0; i < rooms[roomId].numPlayers; i++) {
    if (state.board[i].heroCards.length === 5) {
      let isWinner = true;
      for (const className of Object.keys(
        state.board[i].classes
      ) as HeroClass[]) {
        if (state.board[i].classes[className] !== 1) {
          isWinner = false;
        }
      }
      winners.push(isWinner);
    } else {
      winners.push(false);
    }
  }
  if (winners.some(val => val)) {
    return winners;
  } else {
    return -1;
  }
}
export const endTurnDiscard = (
  roomId: string,
  userId: string,
  returnVal?: AnyCard
) => {
  const playerNum = validSender(roomId, userId);
  if (playerNum === -1) return;
  const state = rooms[roomId].state;
  if (state.turn.player !== playerNum) return;

  const hasWon = checkWin(roomId);
  if (hasWon !== -1) {
    rooms[roomId].state.match.isReady = hasWon;
    rooms[roomId].state.turn.phase = 'end-game';
    rooms[roomId].state.turn.phaseChanged = true;
    sendGameState(roomId);

    let start = Date.now();
    const timer = setInterval(() => {
      let delta = Date.now() - start;
      // random variable cos i don't need one specifically for game end timer
      rooms[roomId].state.match.startRolls.maxVal = Math.floor(delta / 1000);
      sendGameState(roomId);

      if (delta / 1000 >= 180) {
        disconnectAll(roomId);
        delete rooms[roomId];
        clearInterval(timer);
      }
    }, 1000);
    return;
  }

  if (
    state.turn.phase === 'end-turn-discard' &&
    returnVal &&
    state.turn.toDiscard
  ) {
    discardCard(roomId, playerNum, returnVal.id);
    sendGameState(roomId);
    if (state.players[playerNum].hand.length <= 7) {
      setTimeout(() => {
        state.turn.toDiscard = 0;
        nextPlayer(roomId);
      }, 2000);
    }
  } else {
    // new effect
    if (state.turn.cachedEvent && state.turn.cachedEvent.length >= 1) {
      const cached = state.turn.cachedEvent.pop();
      if (!cached) return;
      state.turn.phase = cached.phase;
      state.turn.effect = cached.effect;
      state.turn.cachedEvent = [];
    } else {
      if (
        state.board[state.turn.player].heroCards.some(val => val && val.freeUse)
      ) {
        state.turn.phase = 'play';
        state.turn.phaseChanged = true;
        sendGameState(roomId);
        return;
      } else if (state.players[playerNum].numCards > 7) {
        state.turn.phase = 'end-turn-discard';
        state.turn.toDiscard = state.players[playerNum].numCards - 7;
        state.turn.phaseChanged = true;
        sendGameState(roomId);
      } else {
        nextPlayer(roomId);
      }
    }
  }
};
