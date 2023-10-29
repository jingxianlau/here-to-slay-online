import { nextPlayer } from '../../../functions/game';
import { validSender } from '../../../functions/helpers';
import { rooms } from '../../../rooms';
import { sendGameState } from '../../../server';
import { AnyCard } from '../../../types';

export const drawTwo = (roomId: string, userId: string) => {
  const playerNum = validSender(roomId, userId);
  const gameState = rooms[roomId].state;
  if (playerNum === -1 || gameState.turn.phase !== 'draw') return;

  for (let i = 0; i < 2; i++) {
    let card = gameState.secret.deck.pop() as AnyCard;
    card.player = playerNum;
    gameState.players[playerNum].hand.push(card);
  }

  gameState.turn.phase = 'play';
  sendGameState(roomId);
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
      gameState.secret.discardPile.push(card);
      gameState.mainDeck.discardTop = card;
    }
    sendGameState(roomId);
  }

  for (let i = 0; i < 5; i++) {
    let card = gameState.secret.deck.pop() as AnyCard;
    card.player = playerNum;
    gameState.players[playerNum].hand.push(card);
  }

  if (hasCards) {
    nextPlayer(roomId);
  }
  sendGameState(roomId);
};
