import { nextPlayer, reshuffleDeck } from '../../../functions/game';
import { validSender } from '../../../functions/helpers';
import { rooms } from '../../../rooms';
import { sendGameState } from '../../../server';
import { AnyCard } from '../../../types';

export const drawOne = (roomId: string, userId: string) => {
  const playerNum = validSender(roomId, userId);
  const gameState = rooms[roomId].state;
  if (
    playerNum === -1 ||
    gameState.turn.movesLeft <= 0 ||
    gameState.turn.phase !== 'play'
  )
    return;

  let card = gameState.secret.deck.pop() as AnyCard;
  if (!card) {
    card = reshuffleDeck(roomId);
  }
  card.player = playerNum;
  gameState.players[playerNum].hand.push(card);
  gameState.players[playerNum].numCards++;
  gameState.turn.movesLeft--;

  if (gameState.turn.movesLeft <= 0) {
    nextPlayer(roomId);
  }

  sendGameState(roomId);
};

export const drawTwo = (roomId: string, userId: string) => {
  const playerNum = validSender(roomId, userId);
  const gameState = rooms[roomId].state;
  if (playerNum === -1 || gameState.turn.phase !== 'draw') return;

  for (let i = 0; i < 2; i++) {
    let card = gameState.secret.deck.pop() as AnyCard;

    if (!card) {
      card = reshuffleDeck(roomId);
    }

    card.player = playerNum;
    gameState.players[playerNum].hand.push(card);
  }

  gameState.players[playerNum].numCards += 2;
  gameState.turn.phase = 'play';
  gameState.turn.phaseChanged = true;
  sendGameState(roomId);
  gameState.turn.phaseChanged = false;
};

export const drawFive = (roomId: string, userId: string) => {
  const playerNum = validSender(roomId, userId);
  const gameState = rooms[roomId].state;
  if (playerNum === -1) return;

  const hasCards = gameState.players[playerNum].hand.length > 0;
  if (hasCards) {
    gameState.turn.movesLeft = 0;
    const numCards = gameState.players[playerNum].hand.length;
    for (let i = 0; i < numCards; i++) {
      let card = gameState.players[playerNum].hand.pop() as AnyCard;
      delete card.player;
      gameState.mainDeck.discardPile.push(card);
    }
    sendGameState(roomId);
  }

  for (let i = 0; i < 5; i++) {
    let card = gameState.secret.deck.pop() as AnyCard;

    if (!card) {
      card = reshuffleDeck(roomId);
    }

    card.player = playerNum;
    gameState.players[playerNum].hand.push(card);
  }

  if (hasCards) {
    nextPlayer(roomId);
  }
  gameState.players[playerNum].numCards = 5;
  sendGameState(roomId);
  gameState.turn.phaseChanged = false;
};
