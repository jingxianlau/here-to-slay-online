import { removeFreeUse } from '../../../functions/game';
import { checkCredentials } from '../../../functions/helpers';
import { heroEffects } from '../../../functions/heroes';
import { rooms } from '../../../rooms';
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
