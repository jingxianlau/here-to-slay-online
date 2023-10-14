import { monsterPile } from '../cards/cards';
import {
  AnyCard,
  GameState,
  LeaderCard,
  MonsterCard,
  privateState
} from '../types';

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

export const distributeCards = (state: GameState, numPlayers: number) => {
  // DISTRIBUTE CARDS
  state.secret.deck = shuffle(state.secret.deck);
  state.secret.leaderPile = shuffle(state.secret.leaderPile) as LeaderCard[];
  state.secret.monsterPile = shuffle(state.secret.monsterPile) as MonsterCard[];

  state.mainDeck.monsters = [
    monsterPile.pop() as MonsterCard,
    monsterPile.pop() as MonsterCard,
    monsterPile.pop() as MonsterCard
  ];
  for (let i = 0; i < numPlayers; i++) {
    for (let _ = 0; _ < 7; _++) {
      state.players[i].hand.push(state.secret.deck.pop() as AnyCard);
    }

    let leader = state.secret.leaderPile.pop() as LeaderCard;
    state.board[i].classes[leader.class]++;
    state.board[i].largeCards.push(leader);
  }
};
