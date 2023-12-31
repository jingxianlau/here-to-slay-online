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
import { addHero, removeHero, reshuffleDeck } from './gameHelpers';
import {
  endTurnDiscard,
  useEffect
} from '../controllers/socketio/game/useEffect';

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
  rooms[roomId].state.players[playerNum].numCards--;
  return rooms[roomId].state.players[playerNum].hand.splice(cardIndex, 1)[0];
}
export function removeCardIndex(
  roomId: string,
  playerNum: number,
  cardIndex: number
): -1 | AnyCard {
  rooms[roomId].state.players[playerNum].numCards--;
  return rooms[roomId].state.players[playerNum].hand.splice(cardIndex, 1)[0];
}
export function addCards(roomId: string, cards: AnyCard[], playerNum: number) {
  const length = cards.length;
  for (let i = 0; i < length; i++) {
    cards[i].player = playerNum;
    rooms[roomId].state.players[playerNum].hand.push(cards[i]);
  }
  rooms[roomId].state.players[playerNum].numCards += length;
}

export function playCard(
  roomId: string,
  playerNum: number,
  card: HeroCard | MagicCard | ItemCard,
  free = false
) {
  const state = rooms[roomId].state;
  if (card.type === CardType.hero) {
    addHero(roomId, playerNum, card);
    state.board[playerNum].classes[card.class]++;
  }

  state.players[playerNum].hand = state.players[playerNum].hand.filter(
    c => c.id !== card.id
  );
  state.players[playerNum].numCards--;
  if (!free) {
    state.turn.movesLeft--;
  }

  // CHALLENGE PROTECTION
  if (
    state.players[state.turn.player].protection.some(
      val => val.type === 'challenge'
    )

    // DEV
    // true
  ) {
    if (card.type === CardType.hero) {
      card.freeUse = true;
    } else if (card.type === CardType.magic) {
      useEffect(roomId, state.secret.playerIds[playerNum], card);
      return;
    }

    if (state.turn.movesLeft > 0) {
      if (!state.turn.cachedEvent || state.turn.cachedEvent.length < 1) {
        state.turn.phase = 'play';
        state.turn.phaseChanged = true;
      } else {
        const cached = state.turn.cachedEvent.pop();
        if (!cached) return;
        state.turn.phase = cached.phase;
        state.turn.effect = cached.effect;
        state.turn.cachedEvent = [];
      }
      sendGameState(roomId);
    } else {
      endTurnDiscard(roomId, state.secret.playerIds[state.turn.player]);
    }

    state.match.isReady = [];
    for (let i = 0; i < state.match.players.length; i++) {
      state.match.isReady.push(null);
    }
    return;
  }

  state.mainDeck.preparedCard = {
    card: card,
    successful: null
  };
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

export function destroyCard(roomId: string, playerNum: number, card: HeroCard) {
  const state = rooms[roomId].state;

  if (!card.item || card.item.name !== 'Decoy Doll') {
    const heroCard = removeHero(roomId, playerNum, card.id);
    if (!heroCard) return;
    delete heroCard.player;
    if (heroCard.item && heroCard.item.name.includes('Mask')) {
      state.board[playerNum].classes[
        heroCard.item.name.split(' ')[0].toLowerCase() as HeroClass
      ]--;
    } else {
      state.board[playerNum].classes[card.class]--;
    }
  }

  card.freeUse = false;
  card.abilityUsed = false;
  if (card.item) {
    delete card.item.heroId;
    delete card.item.heroPlayer;
    delete card.item.player;
    state.mainDeck.discardPile.push(card.item);
  }

  if (!card.item || card.item.name !== 'Decoy Doll') {
    state.mainDeck.discardPile.push(card);
  }
  delete card.item;
}

export function stealCard(
  roomId: string,
  stealer: number,
  stealee: number,
  card: HeroCard
): HeroCard | null {
  const state = rooms[roomId].state;

  const heroCard = removeHero(roomId, stealee, card.id);
  if (!heroCard) return null;
  addHero(roomId, stealer, heroCard);

  if (heroCard.item && heroCard.item.name.includes('Mask')) {
    state.board[stealee].classes[
      heroCard.item.name.split(' ')[0].toLowerCase() as HeroClass
    ]--;
    state.board[stealer].classes[
      heroCard.item.name.split(' ')[0].toLowerCase() as HeroClass
    ]++;
  } else {
    state.board[stealee].classes[card.class]--;
    state.board[stealer].classes[card.class]++;
  }

  return card;
}

export function swapCard(
  roomId: string,
  player1: number,
  card1: HeroCard,
  player2: number,
  card2: HeroCard
) {
  const state = rooms[roomId].state;

  const heroCard1 = removeHero(roomId, player1, card1.id);
  const heroCard2 = removeHero(roomId, player2, card2.id);
  if (!heroCard1 || !heroCard2) return;
  addHero(roomId, player1, heroCard2);
  addHero(roomId, player2, heroCard1);

  if (heroCard1.item && heroCard1.item.name.includes('Mask')) {
    state.board[player1].classes[
      heroCard1.item.name.split(' ')[0].toLowerCase() as HeroClass
    ]--;
    state.board[player2].classes[
      heroCard1.item.name.split(' ')[0].toLowerCase() as HeroClass
    ]++;
  } else {
    state.board[player1].classes[heroCard1.class]--;
    state.board[player2].classes[heroCard1.class]++;
  }
  if (heroCard2.item && heroCard2.item.name.includes('Mask')) {
    state.board[player2].classes[
      heroCard2.item.name.split(' ')[0].toLowerCase() as HeroClass
    ]--;
    state.board[player1].classes[
      heroCard2.item.name.split(' ')[0].toLowerCase() as HeroClass
    ]++;
  } else {
    state.board[player2].classes[heroCard2.class]--;
    state.board[player1].classes[heroCard2.class]++;
  }
}

export function destroyItem(roomId: string, itemCard: ItemCard) {
  const state = rooms[roomId].state;
  let cardIndex: number | undefined;
  const boardIndex = state.board.findIndex(val =>
    val.heroCards.some((val, i) => {
      const hero = val && val.item && val.item.id === itemCard.id;
      if (hero) {
        cardIndex = i;
      }
      return hero;
    })
  );
  if (boardIndex === -1 || cardIndex === undefined) return;

  const card = state.board[boardIndex].heroCards[cardIndex]?.item;
  if (!card) return;

  delete card.player;
  delete card.heroId;

  state.mainDeck.discardPile.push(card);

  delete state.board[boardIndex].heroCards[cardIndex]?.item;
}

export function drawCards(roomId: string, playerNum: number, num: number) {
  const state = rooms[roomId].state;

  for (let i = 0; i < num; i++) {
    let card = state.secret.deck.pop();
    if (!card) {
      card = reshuffleDeck(roomId);
    }
    card.player = playerNum;
    state.players[playerNum].hand.push(card);
    state.players[playerNum].numCards++;
  }
}
