import { removeFreeUse, rollDice } from '../../../functions/game';
import { validSender } from '../../../functions/helpers';
import { rooms } from '../../../rooms';
import { sendGameState } from '../../../server';
import { CardType, MonsterCard } from '../../../types';

export const attackRoll = (
  roomId: string,
  userId: string,
  monster: MonsterCard
) => {
  const playerNum = validSender(roomId, userId);
  const gameState = rooms[roomId].state;
  if (
    playerNum === -1 ||
    gameState.dice.main.total === 0 ||
    gameState.turn.player !== playerNum
  ) {
    return;
  }

  if (
    gameState.turn.phase === 'attack-roll' &&
    gameState.mainDeck.preparedCard &&
    gameState.mainDeck.preparedCard.card.type === CardType.large &&
    gameState.mainDeck.preparedCard.card.player === undefined
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
    gameState.turn.phase = 'attack-roll';
    gameState.mainDeck.preparedCard = { card: monster, successful: null };
    sendGameState(roomId);
  }
};

export const attackMonster = (
  roomId: string,
  userId: string,
  monsterId: string
) => {
  removeFreeUse(roomId);
};
