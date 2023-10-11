import { GameState, privateState } from '../types';

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
