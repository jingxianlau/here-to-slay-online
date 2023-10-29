import { rooms } from '../rooms';
import { AnyCard, GameState, LeaderCard, MonsterCard } from '../types';
import shuffle from 'lodash.shuffle';
import random from 'lodash.random';

export const distributeCards = (state: GameState, numPlayers: number) => {
  // DISTRIBUTE CARDS
  state.secret.deck = shuffle(state.secret.deck);
  state.secret.leaderPile = shuffle(state.secret.leaderPile);
  state.secret.monsterPile = shuffle(state.secret.monsterPile);

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
      state.match.isReady.push(null);
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
  rooms[roomId].state.turn.phase = 'draw';
}

export function rollDice(): [number, number] {
  return [random(1, 6), random(1, 6)];
}

export function reshuffleDeck(roomId: string) {
  const state = rooms[roomId].state;
  state.secret.deck = shuffle(state.secret.discardPile);
  state.secret.discardPile = [];
  state.mainDeck.discardTop = null;

  return state.secret.deck.pop() as AnyCard;
}
