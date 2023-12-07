import { rooms } from '../rooms';
import {
  AnyCard,
  GameState,
  HeroCard,
  MagicCard,
  ItemCard,
  CardType,
  HeroClass
} from '../types';
import { sendGameState } from '../server';
import { reshuffleDeck } from './gameHelpers';

function findCard(roomId: string, playerNum: number, cardId: string) {
  return rooms[roomId].state.players[playerNum].hand.findIndex(
    c => c.id === cardId
  );
}
export function hasCard(roomId: string, playerNum: number, cardId: string) {
  return rooms[roomId].state.players[playerNum].hand.some(c => c.id === cardId);
}

export function discardCard(roomId: string, playerNum: number, cardId: string) {
  const cardIndex = findCard(roomId, playerNum, cardId);
  if (cardIndex === -1) {
    return false;
  } else {
    delete rooms[roomId].state.players[playerNum].hand[cardIndex].player;
    rooms[roomId].state.mainDeck.discardPile.push(
      rooms[roomId].state.players[playerNum].hand.splice(cardIndex, 1)[0]
    );
    rooms[roomId].state.players[playerNum].numCards--;
    return true;
  }
}

export function removeCard(
  roomId: string,
  playerNum: number,
  cardId: string
): -1 | AnyCard {
  const cardIndex = findCard(roomId, playerNum, cardId);
  if (cardIndex === -1) return -1;
  return rooms[roomId].state.players[playerNum].hand.splice(cardIndex, 1)[0];
}
export function removeCardIndex(
  roomId: string,
  playerNum: number,
  cardIndex: number
): -1 | AnyCard {
  return rooms[roomId].state.players[playerNum].hand.splice(cardIndex, 1)[0];
}
export function addCards(roomId: string, cards: AnyCard[], playerNum: number) {
  const length = cards.length;
  for (let i = 0; i < length; i++) {
    rooms[roomId].state.players[playerNum].hand.push(cards[i]);
  }
  rooms[roomId].state.players[playerNum].numCards += length;
}

export function swapHands(state: GameState, player1: number, player2: number) {
  const hand = state.players[player2].hand;
  const numCards = state.players[player2].numCards;
  state.players[player2].hand = state.players[player1].hand;
  state.players[player2].numCards = state.players[player1].numCards;
  state.players[player1].hand = hand;
  state.players[player1].numCards = numCards;
}

export function playCard(
  roomId: string,
  playerNum: number,
  card: HeroCard | MagicCard | ItemCard,
  free = false
) {
  const state = rooms[roomId].state;
  if (card.type === CardType.hero) {
    state.board[playerNum].heroCards.push(card);
    state.board[playerNum].classes[card.class]++;
  }

  state.mainDeck.preparedCard = {
    card: card,
    successful: null
  };

  state.players[playerNum].hand = state.players[playerNum].hand.filter(
    c => c.id !== card.id
  );
  state.players[playerNum].numCards--;

  if (!free) {
    state.turn.movesLeft--;
  }

  state.match.isReady = [];
  for (let i = 0; i < state.match.players.length; i++) {
    state.match.isReady.push(i === state.turn.player ? false : null);
  }

  state.turn.pause = true;
  sendGameState(roomId);
  state.turn.pause = false;

  setTimeout(() => {
    state.turn.phase =
      card.type !== CardType.item ? 'challenge' : 'choose-hero';
    state.turn.phaseChanged = true;
    sendGameState(roomId);
  }, 1200);
}

export function removeBoard(roomId: string, playerNum: number, card: HeroCard) {
  const state = rooms[roomId].state;
  const heroCard = state.board[playerNum].heroCards.find(
    val => val.id === card.id
  );
  if (!heroCard) return;
  delete heroCard.player;
  if (heroCard.item && heroCard.item.name.includes('Mask')) {
    state.board[playerNum].classes[
      heroCard.item.name.split(' ')[0].toLowerCase() as HeroClass
    ]--;
  } else {
    state.board[playerNum].classes[card.class]--;
  }

  heroCard.freeUse = false;
  heroCard.abilityUsed = false;
  if (heroCard.item) {
    delete heroCard.item.heroId;
    delete heroCard.item.heroPlayer;
    delete heroCard.item.player;
    state.mainDeck.discardPile.push(heroCard.item);
  }
  state.mainDeck.discardPile.push(heroCard);

  state.board[playerNum].heroCards = state.board[playerNum].heroCards.filter(
    val => val.id !== card.id
  );
}

export function removeItem(roomId: string, itemCard: ItemCard) {
  const state = rooms[roomId].state;
  let cardIndex: number | undefined;
  const boardIndex = state.board.findIndex(val =>
    val.heroCards.some((val, i) => {
      const hero = val.item && val.item.id === itemCard.id;
      if (hero) {
        cardIndex = i;
      }
      return hero;
    })
  );
  if (boardIndex === -1 || cardIndex === undefined) return;

  const card = state.board[boardIndex].heroCards[cardIndex].item;
  if (!card) return;

  delete card.player;
  delete card.heroId;

  state.mainDeck.discardPile.push(card);

  delete state.board[boardIndex].heroCards[cardIndex].item;
}

export function drawCards(roomId: string, playerNum: number, num: number) {
  const state = rooms[roomId].state;

  for (let i = 0; i < num; i++) {
    let card = state.secret.deck.pop() as AnyCard;
    if (!card) {
      card = reshuffleDeck(roomId);
    }
    card.player = playerNum;
    state.players[playerNum].hand.push(card);
    state.players[playerNum].numCards++;
  }
}
