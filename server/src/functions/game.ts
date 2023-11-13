import { rooms } from '../rooms';
import { AnyCard, GameState, LeaderCard, MonsterCard } from '../types';
import shuffle from 'lodash.shuffle';
import random from 'lodash.random';
import { initialState } from '../cards';

export const distributeCards = (state: GameState, numPlayers: number) => {
  // DISTRIBUTE CARDS
  state.secret.deck = shuffle(initialState.secret.deck);
  state.secret.leaderPile = shuffle(initialState.secret.leaderPile);
  state.secret.monsterPile = shuffle(initialState.secret.monsterPile);

  state.mainDeck.monsters = [
    state.secret.monsterPile.pop() as MonsterCard,
    state.secret.monsterPile.pop() as MonsterCard,
    state.secret.monsterPile.pop() as MonsterCard
  ];

  for (let i = 0; i < numPlayers; i++) {
    state.players[i].hand = [];
    state.board[i].classes = {
      fighter: 0,
      bard: 0,
      guardian: 0,
      ranger: 0,
      thief: 0,
      wizard: 0
    };
    state.board[i].largeCards = [];
    state.board[i].heroCards = [];

    for (let _ = 0; _ < 5; _++) {
      let card = state.secret.deck.pop() as AnyCard;
      card.player = i;
      state.players[i].hand.push(card);
    }
    state.players[i].numCards = 5;

    let leader = state.secret.leaderPile.pop() as LeaderCard;
    leader.player = i;
    state.board[i].classes[leader.class]++;
    state.board[i].largeCards.push(leader);
    state.match.isReady.push(null);
  }
};

export function nextPlayer(roomId: string) {
  let player = rooms[roomId].state.turn.player;
  rooms[roomId].state.turn.player = (player + 1) % rooms[roomId].numPlayers;
  rooms[roomId].state.turn.movesLeft = 3;
  rooms[roomId].state.turn.phase = 'draw';
  rooms[roomId].state.turn.phaseChanged = true;
}

export function rollDice(): [number, number] {
  return [random(1, 6), random(1, 6)];
}

export function reshuffleDeck(roomId: string) {
  const state = rooms[roomId].state;
  state.secret.deck = shuffle(state.mainDeck.discardPile);
  state.mainDeck.discardPile = [];

  return state.secret.deck.pop() as AnyCard;
}

export function hasCard(roomId: string, playerNum: number, cardId: string) {
  return rooms[roomId].state.players[playerNum].hand.some(c => c.id === cardId);
}

function findCard(roomId: string, playerNum: number, cardId: string) {
  return rooms[roomId].state.players[playerNum].hand.findIndex(
    c => c.id === cardId
  );
}
export function removeCard(roomId: string, playerNum: number, cardId: string) {
  const cardIndex = findCard(roomId, playerNum, cardId);
  if (cardIndex === -1) {
    return false;
  } else {
    rooms[roomId].state.mainDeck.discardPile.push(
      rooms[roomId].state.players[playerNum].hand.splice(cardIndex, 1)[0]
    );
    rooms[roomId].state.players[playerNum].numCards--;
    return true;
  }
}
