import { GameState, Room, privateState } from '../types';

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

export const checkCredentials = (
  rooms: { [key: string]: Room },
  roomId: string,
  userId: string
): number => {
  if (!rooms[roomId]) return -1;

  const playerNum = rooms[roomId].state.secret.playerIds.indexOf(userId);

  if (playerNum === -1) {
    return -1;
  } else {
    return playerNum;
  }
};

export const validSender = (
  rooms: { [key: string]: Room },
  roomId: string,
  userId: string
): number => {
  const playerNum = checkCredentials(rooms, roomId, userId);

  if (
    rooms[roomId].state.turn.player === playerNum &&
    rooms[roomId].state.secret.playerIds[playerNum] === userId
  ) {
    return playerNum;
  } else {
    return -1;
  }
};

export const parseState = (userId: string, state: GameState): privateState => {
  let copy: GameState = JSON.parse(JSON.stringify(state));

  const numPlayers = state.match.players.length;
  const playerNum = state.secret.playerIds.indexOf(userId);

  let newState: privateState = copy;

  newState.secret = null;
  for (let i = 0; i < numPlayers; i++) {
    if (i !== playerNum) {
      newState.players[i] = null;
    }
  }

  return newState;
};
