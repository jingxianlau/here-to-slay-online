import { removeFreeUse } from '../../../functions/game';

export const attackMonster = (
  roomId: string,
  userId: string,
  monsterId: string
) => {
  removeFreeUse(roomId);
};

export const attackRoll = (
  roomId: string,
  userId: string,
  monsterId: string
) => {};
