import {
  discardCard,
  nextPlayer,
  removeFreeUse
} from '../../../functions/game';
import { checkCredentials, validSender } from '../../../functions/helpers';
import { heroEffects } from '../../../functions/heroes';
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
  )
    return;

  const cardName = card.name.replaceAll(' ', '-').toLowerCase();

  if (state.turn.effect) {
    // next function in effect
    state.turn.effect.players = state.turn.effect.players.filter(
      val => val !== playerNum
    );

    heroEffects[cardName][++state.turn.effect.step](
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
      heroEffects[cardName][++state.turn.effect.step](
        roomId,
        state.turn.player
      );
    } else {
      state.turn.effect.step--;
    }
  } else if (card.type === CardType.hero && !card.abilityUsed) {
    // new effect
    state.turn.phase = 'use-effect';
    state.turn.phaseChanged = true;
    state.turn.effect = {
      action: 'none',
      players: [],
      val: 0,
      step: 0,
      choice: null,
      purpose: '',
      card: card
    };
    if (!card.freeUse) {
      state.turn.movesLeft--;
    } else if (card.type === CardType.hero) {
      card.freeUse = false;
    }
    card.abilityUsed = true;
    removeFreeUse(roomId);
    heroEffects[cardName][0](roomId, playerNum);
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
    if (state.players[playerNum].numCards > 7) {
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
