import {
  hasCard,
  nextPlayer,
  playCard,
  discardCard,
  rollDice,
  removeFreeUse
} from '../../../functions/game';
import { checkCredentials, validSender } from '../../../functions/helpers';
import { rooms } from '../../../rooms';
import { sendGameState } from '../../../server';
import { AnyCard, CardType, HeroCard } from '../../../types';

export const prepareCard = (
  roomId: string,
  userId: string,
  card: AnyCard,

  // item card's hero
  heroCard?: HeroCard
) => {
  const playerNum = validSender(roomId, userId);
  const gameState = rooms[roomId].state;
  if (
    gameState.turn.phase !== 'play' ||
    playerNum === -1 ||
    card.player !== playerNum ||
    !gameState.players[playerNum].hand.some(val => card.id === val.id) ||
    (card.type !== CardType.hero &&
      card.type !== CardType.item &&
      card.type !== CardType.magic) ||
    (card.type === CardType.hero &&
      gameState.board[playerNum].heroCards.length >= 5) ||
    (card.type === CardType.item &&
      heroCard?.player &&
      gameState.board[heroCard.player].heroCards.some(
        val => val.id === heroCard.id
      ) &&
      !heroCard.item)
  ) {
    return;
  }
  removeFreeUse(roomId);
  if (heroCard) {
    playCard(roomId, playerNum, card, false, heroCard);
  } else {
    playCard(roomId, playerNum, card);
  }
};

export const challenge = (
  roomId: string,
  userId: string,
  challenged: boolean,
  cardId: string | undefined
) => {
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
  sendGameState(roomId);

  if (gameState.match.isReady.every(val => val === false)) {
    gameState.mainDeck.preparedCard.successful = true;
    sendGameState(roomId);

    setTimeout(() => {
      gameState.match.isReady.fill(null);
      if (gameState.mainDeck.preparedCard?.card.type === CardType.hero) {
        gameState.mainDeck.preparedCard.card.freeUse = true;
      }
      gameState.mainDeck.preparedCard = null;

      if (gameState.turn.movesLeft > 0) {
        gameState.turn.phase = 'play';
        gameState.turn.phaseChanged = true;
        sendGameState(roomId);
        gameState.turn.phaseChanged = false;
      } else {
        nextPlayer(roomId);
        sendGameState(roomId);
        gameState.turn.phaseChanged = false;
      }
    }, 1200);
  } else if (challenged && cardId) {
    if (!discardCard(roomId, playerNum, cardId)) {
      return;
    }
    sendGameState(roomId);
    gameState.match.isReady.fill(null);

    setTimeout(() => {
      gameState.dice.main.roll = [1, 1];
      gameState.dice.main.total = 0;
      gameState.dice.main.modifier = [];

      gameState.turn.phase = 'challenge-roll';
      gameState.turn.phaseChanged = true;
      gameState.turn.challenger = playerNum;
      gameState.turn.isRolling = true;
      sendGameState(roomId);
      gameState.turn.phaseChanged = false;
    }, 1200);
  }
};

export const challengeRoll = (roomId: string, userId: string) => {
  const playerNum = validSender(roomId, userId);
  const gameState = rooms[roomId].state;
  if (
    playerNum === -1 ||
    gameState.turn.phase !== 'challenge-roll' ||
    !gameState.mainDeck.preparedCard ||
    (gameState.dice.main.total === 0 &&
      gameState.turn.challenger !== playerNum) ||
    (gameState.dice.main.total > 0 && gameState.turn.player !== playerNum)
  ) {
    return;
  }

  const roll = rollDice();
  const val = roll[0] + roll[1];
  if (gameState.dice.main.total === 0) {
    gameState.dice.main.roll = roll;
    gameState.dice.main.total = val;
    gameState.dice.defend = {
      roll: [1, 1],
      total: 0,
      modifier: [],
      modValues: []
    };
  } else if (gameState.dice.defend !== null) {
    gameState.dice.defend.roll = roll;
    gameState.dice.defend.total = val;
  }
  sendGameState(roomId);

  if (gameState.dice.defend && gameState.dice.defend.total > 0) {
    setTimeout(() => {
      gameState.turn.phaseChanged = true;
      gameState.turn.phase = 'modify';
      gameState.turn.isRolling = false;
      sendGameState(roomId);
      gameState.turn.phaseChanged = false;
    }, 3000);
  }
};
