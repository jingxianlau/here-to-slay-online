import cloneDeep from 'lodash.clonedeep';
import { GameState, privateState } from '../types';
import { rooms } from '../rooms';

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

export const checkCredentials = (roomId: string, userId: string): number => {
  if (!rooms[roomId]) return -1;

  const playerNum = rooms[roomId].state.secret.playerIds.indexOf(userId);

  return playerNum;
};

export const validSender = (roomId: string, userId: string): number => {
  const playerNum = checkCredentials(roomId, userId);

  if (
    (rooms[roomId].state.turn.player === playerNum ||
      rooms[roomId].state.turn.challenger === playerNum) &&
    rooms[roomId].state.secret.playerIds[playerNum] === userId
  ) {
    return playerNum;
  } else {
    return -1;
  }
};

export const addPlayer = (roomId: string, userId: string, username: string) => {
  let room = rooms[roomId];
  room.numPlayers++;
  room.state.secret.playerIds.push(userId);
  room.state.match.players.push(username);
  room.state.players.push({ hand: [] });
  room.state.board.push({
    classes: {
      fighter: 0,
      bard: 0,
      guardian: 0,
      ranger: 0,
      thief: 0,
      wizard: 0
    },
    heroCards: [],
    largeCards: []
  });

  room.state.match.isReady.push(false);
};

export const parseState = (userId: string, state: GameState): privateState => {
  let newState: privateState = cloneDeep(state) as privateState;

  const numPlayers = state.match.players.length;
  const playerNum = state.secret.playerIds.indexOf(userId);

  newState.secret = null;
  for (let i = 0; i < numPlayers; i++) {
    if (i !== playerNum) {
      newState.players[i] = null;
    }
  }

  return newState;
};
