import { GameState } from '../types';

export const random = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const removePlayer = (state: GameState, playerNum: number) => {
  state.secret.playerIds.splice(playerNum, 1);
  state.match.players.splice(playerNum, 1);
  state.board.pop();
  state.players.pop();
};
