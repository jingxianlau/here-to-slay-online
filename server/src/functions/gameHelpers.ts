import { rooms } from '../rooms';
import { AnyCard, GameState, LeaderCard, MonsterCard } from '../types';
import shuffle from 'lodash.shuffle';
import random from 'lodash.random';
import { heroCards, initialState } from '../cards';
import { sendGameState } from '../server';
import cloneDeep from 'lodash.clonedeep';

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

    // let card2 = cloneDeep(heroCards[1]);
    // card2.player = i;
    // state.players[i].hand.push(card2);
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
  if (rooms[roomId].state.players[player].hand.length > 7) return;

  const newPlayer = (player + 1) % rooms[roomId].numPlayers;
  rooms[roomId].state.turn.player = newPlayer;
  rooms[roomId].state.turn.movesLeft = 3;
  rooms[roomId].state.turn.phase = 'draw';
  rooms[roomId].state.turn.phaseChanged = true;

  const heroes = rooms[roomId].state.board[newPlayer].heroCards;
  for (let i = 0; i < heroes.length; i++) {
    heroes.forEach(val => (val.abilityUsed = false));
  }

  sendGameState(roomId);
  rooms[roomId].state.turn.phaseChanged = false;
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

export function removeFreeUse(roomId: string) {
  const boards = rooms[roomId].state.board;
  for (let i = 0; i < boards.length; i++) {
    boards[i].heroCards.forEach(val => (val.freeUse = false));
  }
}
