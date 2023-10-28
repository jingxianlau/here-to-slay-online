import { rooms } from '../rooms';
import { AnyCard, GameState, LeaderCard, MonsterCard, Room } from '../types';
import { random } from './helpers';

export const shuffle = (arr: AnyCard[]) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
};

export const distributeCards = (state: GameState, numPlayers: number) => {
  // DISTRIBUTE CARDS
  shuffle(state.secret.deck);
  shuffle(state.secret.leaderPile);
  shuffle(state.secret.monsterPile);

  state.mainDeck.monsters = [
    state.secret.monsterPile.pop() as MonsterCard,
    state.secret.monsterPile.pop() as MonsterCard,
    state.secret.monsterPile.pop() as MonsterCard
  ];
  for (let i = 0; i < numPlayers; i++) {
    for (let _ = 0; _ < 5; _++) {
      let card = state.secret.deck.pop() as AnyCard;
      card.player = i;
      state.players[i].hand.push(card);
    }

    let leader = state.secret.leaderPile.pop() as LeaderCard;
    leader.player = i;
    state.board[i].classes[leader.class]++;
    state.board[i].largeCards.push(leader);
  }
};

export function nextPlayer(roomId: string) {
  let player = rooms[roomId].state.turn.player;
  rooms[roomId].state.turn.player = (player + 1) % rooms[roomId].numPlayers;
  rooms[roomId].state.turn.movesLeft = 3;
}

export function rollDice(): [number, number] {
  return [random(1, 6), random(1, 6)];
}
