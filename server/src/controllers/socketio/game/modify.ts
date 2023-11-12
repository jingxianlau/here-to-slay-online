import { removeCard, rollDice } from '../../../functions/game';
import { checkCredentials, validSender } from '../../../functions/helpers';
import { rooms } from '../../../rooms';
import { sendGameState } from '../../../server';
import { ModifierCard } from '../../../types';

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
  const gameState = rooms[roomId].state;

  if (!modify) {
    gameState.match.isReady[playerNum] = false;

    if (gameState.match.isReady.every(val => val === false)) {
      // DO STUFF
    } else return;
  }

  if (
    playerNum === -1 ||
    gameState.turn.phase !== 'modify' ||
    !info ||
    (info.dice === 1 && !gameState.dice.defend) ||
    (info.modifier.modifier.length === 1 && info.effect === 1) ||
    !removeCard(roomId, playerNum, info.modifier.id)
  ) {
    return;
  }

  const { dice, effect, modifier } = info;

  if (dice === 0) {
    const mod = modifier.modifier[effect] as number;
    gameState.dice.main.modifier.push(modifier);
    gameState.dice.main.modValues.push(mod);
    gameState.dice.main.total += mod;
  } else {
    const mod = modifier.modifier[effect] as number;
    if (!gameState.dice.defend) return;
    gameState.dice.defend.modifier.push(modifier);
    gameState.dice.defend.modValues.push(mod);
    gameState.dice.defend.total += mod;
  }

  sendGameState(roomId);
};
