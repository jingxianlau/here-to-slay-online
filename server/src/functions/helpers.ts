import { GameState } from '../types';

export const random = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const removePlayer = (
  room: { numPlayers: number; state: GameState; private: boolean },
  playerNum: number
) => {
  room.state.secret.playerIds.splice(playerNum, 1);
  room.state.match.players.splice(playerNum, 1);
  room.state.match.isReady.splice(playerNum, 1);
  room.state.board.pop();
  room.state.players.pop();
  room.numPlayers--;
};
