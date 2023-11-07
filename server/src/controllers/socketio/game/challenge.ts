import {
  hasCard,
  nextPlayer,
  removeCard,
  rollDice
} from '../../../functions/game';
import { checkCredentials, validSender } from '../../../functions/helpers';
import { rooms } from '../../../rooms';
import { sendGameState } from '../../../server';
import { AnyCard, CardType } from '../../../types';

export const prepareCard = (roomId: string, userId: string, card: AnyCard) => {
  const playerNum = validSender(roomId, userId);
  const gameState = rooms[roomId].state;
  if (
    gameState.turn.phase !== 'play' ||
    playerNum === -1 ||
    card.player !== playerNum ||
    !gameState.players[playerNum].hand.some(val => card.id === val.id) ||
    (card.type !== CardType.hero &&
      card.type !== CardType.item &&
      card.type !== CardType.magic)
  ) {
    return;
  }

  if (card.type === CardType.hero) {
    gameState.board[playerNum].heroCards.push(card);
  }
  gameState.mainDeck.preparedCard = {
    card: card,
    successful: null
  };

  gameState.players[playerNum].hand = gameState.players[playerNum].hand.filter(
    c => c.id !== card.id
  );
  gameState.turn.movesLeft--;
  gameState.turn.phase = 'challenge';

  gameState.match.isReady = [];
  for (let i = 0; i < gameState.match.players.length; i++) {
    gameState.match.isReady.push(i === gameState.turn.player ? false : null);
  }

  sendGameState(roomId);
};

export const challenge = (
  roomId: string,
  userId: string,
  challenged: boolean,
  cardId: string | undefined
) => {
  console.log('challenge');
  const playerNum = checkCredentials(roomId, userId);
  const gameState = rooms[roomId].state;

  if (
    playerNum === -1 ||
    gameState.turn.phase !== 'challenge' ||
    !gameState.mainDeck.preparedCard ||
    (cardId && !hasCard(roomId, playerNum, cardId))
  ) {
    return;
  }

  gameState.match.isReady[playerNum] = challenged;

  if (gameState.match.isReady.every(val => val === false)) {
    gameState.mainDeck.preparedCard.successful = true;
    sendGameState(roomId);

    setTimeout(() => {
      gameState.turn.phase = 'play';
    }, 500);
  } else if (challenged && cardId) {
    if (!removeCard(roomId, playerNum, cardId)) {
      return;
    }

    gameState.dice.main.roll = [1, 1];
    gameState.dice.main.total = 0;
    gameState.dice.main.modifier = [];
    gameState.dice.defend = {
      roll: [1, 1],
      total: 0,
      modifier: []
    };

    gameState.turn.phase = 'challenge-roll';
    gameState.turn.challenger = playerNum;
    gameState.turn.isRolling = true;

    sendGameState(roomId);
  }
};

export const challengeRoll = (roomId: string, userId: string) => {
  const playerNum = validSender(roomId, userId);
  const gameState = rooms[roomId].state;
  if (
    playerNum === -1 ||
    gameState.turn.phase !== 'challenge-roll' ||
    !gameState.mainDeck.preparedCard ||
    (gameState.dice.main.total === 0 && gameState.turn.player !== playerNum) ||
    (gameState.dice.main.total > 0 &&
      gameState.turn.challenger !== playerNum) ||
    gameState.dice.defend === null
  ) {
    return;
  }

  const roll = rollDice();
  const val = roll[0] + roll[1];
  if (gameState.dice.main.total === 0) {
    gameState.dice.main.roll = roll;
    gameState.dice.main.total = val;
  } else {
    gameState.dice.defend.roll = roll;
    gameState.dice.defend.total = val;
    gameState.turn.phase = 'modify';
  }
  sendGameState(roomId);
};

export const confirmChallenge = (
  roomId: string,
  userId: string,
  useEffect?: boolean
) => {
  const playerNum = validSender(roomId, userId);
  const gameState = rooms[roomId].state;
  if (
    playerNum === -1 ||
    !gameState.mainDeck.preparedCard ||
    gameState.mainDeck.preparedCard.successful === null
  ) {
    return;
  }

  if (gameState.mainDeck.preparedCard.successful) {
    // no more moves
    if (
      gameState.mainDeck.preparedCard.card.type === CardType.hero &&
      !useEffect &&
      gameState.turn.movesLeft === 0
    ) {
      nextPlayer(roomId);
    }

    // USE CARD EFFECT
    if (useEffect) {
      gameState.mainDeck.preparedCard = null;
    }
  } else {
    // DESTROY CARD
    gameState.mainDeck.preparedCard = null;
  }

  gameState.dice.main.roll = [1, 1];
  gameState.dice.main.total = 0;
  gameState.dice.main.modifier = [];
  gameState.dice.defend = null;
  gameState.turn.phase = 'play';
  delete gameState.turn.challenger;
  gameState.turn.isRolling = false;

  sendGameState(roomId);
};
