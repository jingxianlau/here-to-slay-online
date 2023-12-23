import { rooms } from '../rooms';
import {
  AnyCard,
  CardType,
  GameState,
  HeroCard,
  LeaderCard,
  MonsterCard
} from '../types';
import shuffle from 'lodash.shuffle';
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
    state.board[i].heroCards = [null, null, null, null, null];

    for (let _ = 0; _ < 5; _++) {
      let card = state.secret.deck.pop() as AnyCard;
      card.player = i;
      state.players[i].hand.push(card);
    }

    // DEV
    let card2 = cloneDeep(heroCards[17]);
    card2.player = i;
    state.players[i].hand.push(card2);
    state.players[i].numCards = 6;
    // DEV

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

  for (
    let i = 0;
    i < rooms[roomId].state.players[player].passives.length;
    i++
  ) {
    if (rooms[roomId].state.players[player].passives[i].turns === 0) {
      rooms[roomId].state.players[player].passives.splice(i--, 1);
    }
  }

  for (
    let i = 0;
    i < rooms[roomId].state.players[newPlayer].passives.length;
    i++
  ) {
    if (rooms[roomId].state.players[newPlayer].passives[i].turns === 1) {
      rooms[roomId].state.players[newPlayer].passives.splice(i--, 1);
    } else {
      rooms[roomId].state.players[newPlayer].passives[i].turns--;
    }
  }

  for (
    let i = 0;
    i < rooms[roomId].state.players[newPlayer].protection.length;
    i++
  ) {
    if (rooms[roomId].state.players[newPlayer].protection[i].turns === 1) {
      rooms[roomId].state.players[newPlayer].protection.splice(i--, 1);
    } else {
      rooms[roomId].state.players[newPlayer].protection[i].turns--;
    }
  }

  const heroes = rooms[roomId].state.board[newPlayer].heroCards;
  for (let i = 0; i < heroes.length; i++) {
    heroes.forEach(val => {
      if (val) {
        val.abilityUsed = false;
      }
    });
  }

  sendGameState(roomId);
}

export function rollDice(roomId: string) {
  const state = rooms[roomId].state;
  // const roll: [number, number] = [random(1, 6), random(1, 6)];
  const roll: [number, number] = [6, 6];
  const val = roll[0] + roll[1];
  state.dice.main.roll = roll;
  state.dice.main.total = val;
  for (let i = 0; i < state.players[state.turn.player].passives.length; i++) {
    const passive = state.players[state.turn.player].passives[i];
    if (passive.type === 'roll') {
      state.dice.main.total += passive.mod;
      state.dice.main.modifier.push(passive.card);
      state.dice.main.modValues.push(passive.mod);
    }
  }

  if (
    state.turn.phase === 'use-effect-roll' &&
    state.mainDeck.preparedCard?.card.type === CardType.hero &&
    state.mainDeck.preparedCard.card.item
  ) {
    const item = state.mainDeck.preparedCard.card.item;
    if (item.name === "Curse of the Snake's Eyes") {
      state.dice.main.total -= 2;
      state.dice.main.modifier.push(item);
      state.dice.main.modValues.push(-2);
    } else if (item.name === 'Really Big Ring') {
      state.dice.main.total += 2;
      state.dice.main.modifier.push(item);
      state.dice.main.modValues.push(2);
    }
  }

  sendGameState(roomId);

  setTimeout(() => {
    state.turn.phaseChanged = true;
    state.turn.phase = 'modify';
    state.turn.isRolling = false;
    sendGameState(roomId);
  }, 3000);
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
    boards[i].heroCards.forEach(val => {
      if (val) {
        val.freeUse = false;
      }
    });
  }
}

export function addHero(roomId: string, playerNum: number, card: HeroCard) {
  const state = rooms[roomId].state;
  for (let i = 0; i < 5; i++) {
    if (state.board[playerNum].heroCards[i] === null) {
      card.player = playerNum;
      card.abilityUsed = false;
      state.board[playerNum].heroCards[i] = card;
      return;
    }
  }
}

export function removeHero(
  roomId: string,
  playerNum: number,
  cardId: string
): HeroCard | null {
  const state = rooms[roomId].state;
  for (let i = 0; i < 5; i++) {
    const card = state.board[playerNum].heroCards[i];
    if (card !== null && card.id === cardId) {
      state.board[playerNum].heroCards[i] = null;
      return card;
    }
  }
  return null;
}
