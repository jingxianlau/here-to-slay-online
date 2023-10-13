import { AnyCard, GameState, privateState } from '../types';

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

export const shuffle = (arr: AnyCard[]): AnyCard[] => {
  let currentIndex = arr.length;
  let randomIndex;

  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [arr[currentIndex], arr[randomIndex]] = [
      arr[randomIndex],
      arr[currentIndex]
    ];
  }

  return arr;
};
