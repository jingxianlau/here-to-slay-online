import { GameState, privateState } from '../types';

export const parseState = (player: number, state: GameState): privateState => {
  let copy: GameState = JSON.parse(JSON.stringify(state));

  const numPlayers = Object.keys(copy.match.players).length;

  let newState: privateState = copy;

  newState.secret = null;
  newState.match.players = null;
  for (let i = 1; i <= numPlayers; i++) {
    if (i !== player) {
      newState.players[i] = null;
    }
  }

  return newState;
};
