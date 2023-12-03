import {
  discardCard,
  nextPlayer,
  removeFreeUse,
  rollDice
} from '../../../functions/game';
import { checkCredentials, validSender } from '../../../functions/helpers';
import { abilities } from '../../../functions/abilities';
import { rooms } from '../../../rooms';
import { sendGameState } from '../../../server';
import {
  AnyCard,
  CardType,
  HeroCard,
  MagicCard,
  MonsterCard
} from '../../../types';

function isCard(object: AnyCard | number | null): object is AnyCard {
  return typeof object !== 'number' && object !== null;
}

export const useEffectRoll = (
  roomId: string,
  userId: string,
  heroCard: HeroCard
) => {
  const playerNum = validSender(roomId, userId);
  const gameState = rooms[roomId].state;
  if (
    playerNum === -1 ||
    gameState.dice.main.total !== 0 ||
    gameState.turn.player !== playerNum ||
    (gameState.turn.phase !== 'play' &&
      gameState.turn.phase !== 'use-effect-roll')
  ) {
    return;
  }

  if (
    gameState.turn.phase === 'use-effect-roll' &&
    gameState.mainDeck.preparedCard &&
    gameState.mainDeck.preparedCard.card.type === CardType.hero &&
    gameState.mainDeck.preparedCard.card.id === heroCard.id
  ) {
    const roll = rollDice();
    const val = roll[0] + roll[1];
    gameState.dice.main.roll = roll;
    gameState.dice.main.total = val;
    sendGameState(roomId);

    setTimeout(() => {
      gameState.turn.phaseChanged = true;
      gameState.turn.phase = 'modify';
      gameState.turn.isRolling = false;
      sendGameState(roomId);
      gameState.turn.phaseChanged = false;
    }, 3000);
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
      if (val.id === heroCard.id) {
        val.abilityUsed = true;
      }
    });

    gameState.turn.isRolling = true;
    sendGameState(roomId);
    gameState.turn.phaseChanged = false;
  }
};

export const useEffect = (
  roomId: string,
  userId: string,
  card: HeroCard | MagicCard | MonsterCard,
  returnVal?: AnyCard | number
) => {
  const playerNum = checkCredentials(roomId, userId);
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

    abilities[cardName][++state.turn.effect.step](
      roomId,
      state.turn.player,
      returnVal
        ? {
            card: isCard(returnVal) ? returnVal : undefined,
            player: typeof returnVal === 'number' ? returnVal : undefined
          }
        : undefined,
      state.turn.player !== playerNum ? playerNum : undefined
    );

    if (state.turn.effect.players.length === 0 && state.turn.effect.val === 0) {
      abilities[cardName][++state.turn.effect.step](roomId, state.turn.player);
    } else {
      state.turn.effect.step--;
    }
  } else if (
    state.mainDeck.preparedCard?.card.id === card.id &&
    ((card.type === CardType.hero && state.mainDeck.preparedCard?.successful) ||
      (card.type === CardType.large &&
        card.player === undefined &&
        !state.mainDeck.preparedCard.successful)) &&
    state.turn.phase === 'modify'
  ) {
    // new effect
    state.turn.phase = 'use-effect';
    state.turn.phaseChanged = true;
    state.mainDeck.preparedCard = null;
    state.turn.effect = {
      action: 'none',
      players: [],
      val: 0,
      step: 0,
      choice: null,
      purpose: '',
      card: card
    };

    abilities[cardName][0](roomId, playerNum);
    state.turn.phaseChanged = false;
  }
};

// misc functions that i have no idea where to put
export const pass = (roomId: string, userId: string) => {
  const playerNum = validSender(roomId, userId);
  if (playerNum === -1) return;
  removeFreeUse(roomId);

  rooms[roomId].state.turn.movesLeft = 0;
  sendGameState(roomId);
  setTimeout(() => {
    endTurnDiscard(roomId, userId);
  }, 200);
};

export const endTurnDiscard = (
  roomId: string,
  userId: string,
  returnVal?: AnyCard
) => {
  const playerNum = validSender(roomId, userId);
  const state = rooms[roomId].state;
  if (state.turn.player !== playerNum) return;

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
    if (state.board[state.turn.player].heroCards.some(val => val.freeUse)) {
      state.turn.phase = 'play';
      state.turn.phaseChanged = true;
      sendGameState(roomId);
      state.turn.phaseChanged = false;
      return;
    } else if (state.players[playerNum].numCards > 7) {
      state.turn.phase = 'end-turn-discard';
      state.turn.toDiscard = state.players[playerNum].numCards - 7;
      state.turn.phaseChanged = true;
      sendGameState(roomId);
      state.turn.phaseChanged = false;
    } else {
      nextPlayer(roomId);
    }
  }
};
