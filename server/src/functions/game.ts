import { monsterPile } from '../cards/cards';
import { AnyCard, GameState, LeaderCard, MonsterCard, Room } from '../types';
import { random } from './helpers';

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

export function nextPlayer(room: Room) {
  let player = room.state.turn.player;
  room.state.turn.player = (player + 1) % room.numPlayers;
}

export function rollDice(): [number, number] {
  return [random(1, 6), random(1, 6)];
}
