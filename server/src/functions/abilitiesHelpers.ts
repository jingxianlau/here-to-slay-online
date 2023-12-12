import {
  endTurnDiscard,
  useEffect
} from '../controllers/socketio/game/useEffect';
import { rooms } from '../rooms';
import { sendGameState } from '../server';
import { AnyCard, CardType, HeroClass, allCards } from '../types';
import { heroAbilities } from './abilities';
import {
  addCards,
  destroyCard,
  discardCard,
  drawCards,
  playCard,
  removeCardIndex,
  stealCard
} from './game';

interface returnType {
  card?: AnyCard;
  num?: number;
}

export const endEffect = (
  roomId: string,
  playerNum: number,
  updatePhase = true
) => {
  const state = rooms[roomId].state;
  state.turn.effect = null;
  if (updatePhase) {
    if (state.turn.movesLeft > 0) {
      state.turn.phase = 'play';
      state.turn.phaseChanged = true;
      sendGameState(roomId);
    } else endTurnDiscard(roomId, state.secret.playerIds[playerNum]);
  }
};

export const choosePlayer = (
  roomId: string,
  playerNum: number,
  text = 'Choose Player'
) => {
  const state = rooms[roomId].state;
  if (!state.turn.effect) return;

  state.turn.effect.action = 'choose-player';
  state.turn.effect.actionChanged = true;
  state.turn.effect.val = { min: 1, max: 1, curr: 0 };
  state.turn.effect.allowedCards = [];
  state.turn.effect.players = [playerNum];
  state.turn.effect.purpose = text;
  sendGameState(roomId);
};
export const receivePlayer = (
  roomId: string,
  playerNum: number,
  returnVal?: returnType
) => {
  const state = rooms[roomId].state;
  if (!state.turn.effect || !returnVal || !returnVal.num) return;
  state.turn.effect.choice = [returnVal.num];
  state.turn.effect.val.curr++;
  sendGameState(roomId);
};

export const pickCard = (roomId: string, playerNum: number) => {
  const state = rooms[roomId].state;
  if (
    !state.turn.effect ||
    !state.turn.effect.choice ||
    typeof state.turn.effect.choice[0] !== 'number'
  )
    return;

  state.turn.effect.action = 'choose-other-hand-hide';
  state.turn.effect.actionChanged = true;
  state.turn.effect.val = { min: 1, max: 1, curr: 0 };
  state.turn.effect.allowedCards = [];
  state.turn.effect.players = [playerNum];
  state.turn.effect.purpose = 'Choose Card';
  state.turn.effect.active = {
    num: [
      state.turn.effect.choice[0],
      state.players[state.turn.effect.choice[0]].numCards
    ]
  };
  state.turn.effect.choice = null;
  sendGameState(roomId);
};
export const addCard = (
  roomId: string,
  playerNum: number,
  returnVal?: returnType
) => {
  const state = rooms[roomId].state;
  if (
    !state.turn.effect ||
    !returnVal ||
    !returnVal.num ||
    !state.turn.effect.active ||
    !state.turn.effect.active.num
  )
    return;

  state.turn.effect.choice = [returnVal.num];
  state.turn.effect.val.curr++;
  sendGameState(roomId);

  const card = removeCardIndex(
    roomId,
    state.turn.effect.active.num[0],
    returnVal.num
  );
  if (card === -1) return;
  addCards(roomId, [card], playerNum);

  setTimeout(() => {
    sendGameState(roomId);
    if (state.turn.effect?.active) {
      delete state.turn.effect.active.num;
    }
  }, 400);
};
export const pickFromHand = [
  (roomId: string, playerNum: number) => choosePlayer(roomId, playerNum),
  receivePlayer,
  pickCard,
  addCard
];

export const ifMayPlay = (
  type: CardType.hero | CardType.item | CardType.magic
) => {
  return [
    (roomId: string, playerNum: number) => {
      const state = rooms[roomId].state;
      if (!state.turn.effect || state.players[playerNum].numCards <= 0) return;

      setTimeout(() => {
        if (state.turn.effect) {
          state.turn.effect.action = 'play';
          state.turn.effect.actionChanged = true;
          state.turn.effect.val = { min: 1, max: 1, curr: 0 };
          state.turn.effect.allowedCards = [];
          state.turn.effect.players = [playerNum];
          state.turn.effect.purpose = 'Play';
          state.turn.effect.active = {
            num: [
              state.players[playerNum].hand[
                state.players[playerNum].numCards - 1
              ].type === type
                ? 1
                : 0
            ],
            card: [
              state.players[playerNum].hand[
                state.players[playerNum].numCards - 1
              ]
            ]
          };

          state.turn.effect.activeNumVisible = [];
          state.turn.effect.activeCardVisible = [];
          for (let i = 0; i < rooms[roomId].numPlayers; i++) {
            state.turn.effect.activeNumVisible.push(i === playerNum);
            state.turn.effect.activeCardVisible.push(i === playerNum);
          }

          sendGameState(roomId);
        }
      }, 1200);
    },
    (roomId: string, playerNum: number, returnVal?: returnType) => {
      const state = rooms[roomId].state;
      if (
        !state.turn.effect ||
        !state.turn.effect.active ||
        !state.turn.effect.active.card ||
        !state.turn.effect.active.num
      )
        return;

      if (
        state.turn.effect.active.num[0] === 0 ||
        (returnVal && returnVal.num === 0)
      ) {
        state.turn.effect.val.curr++;
        endEffect(roomId, playerNum);
      } else if (
        state.turn.effect.active.num[0] === 1 &&
        returnVal &&
        returnVal.num === 1 &&
        state.turn.effect.active.card[0].type === type
      ) {
        playCard(roomId, playerNum, state.turn.effect.active.card[0], true);
        state.turn.effect.val.curr++;
      }
    }
  ];
};

export const drawCard = (num = 1) => [
  (roomId: string, playerNum: number) => {
    const state = rooms[roomId].state;
    if (!state.turn.effect) return;
    state.turn.effect.action = 'draw';
    state.turn.effect.actionChanged = true;
    state.turn.effect.allowedCards = [];
    state.turn.effect.val = { min: 1, max: 1, curr: 0 };
    state.turn.effect.players = [playerNum];
    state.turn.effect.purpose = 'Draw Card';
    sendGameState(roomId);
  },
  (roomId: string, playerNum: number) => {
    const state = rooms[roomId].state;
    if (!state.turn.effect) return;
    drawCards(roomId, playerNum, num);
    state.turn.effect.val.curr++;
    sendGameState(roomId);
  }
];

export const playFromHand = (
  type: CardType.hero | CardType.magic | CardType.item
) => [
  (roomId: string, playerNum: number) => {
    const state = rooms[roomId].state;
    if (!state.turn.effect) return;
    state.turn.effect.action = 'choose-hand';
    state.turn.effect.actionChanged = true;
    state.turn.effect.allowedCards = [type];
    state.turn.effect.val = { min: 1, max: 1, curr: 0 };
    state.turn.effect.players = [playerNum];
    state.turn.effect.purpose = `Play ${
      type.charAt(0).toUpperCase() + type.slice(1)
    }`;
    sendGameState(roomId);
  },
  (roomId: string, playerNum: number, returnVal?: returnType) => {
    const state = rooms[roomId].state;
    if (!state.turn.effect) return;

    if (!returnVal?.card) {
      state.turn.effect.choice = [0];
      state.turn.effect.val.curr++;
      sendGameState(roomId);
      endEffect(roomId, playerNum);
    } else if (returnVal && returnVal.card && returnVal.card.type === type) {
      state.turn.effect.choice = [returnVal.card];
      playCard(roomId, playerNum, returnVal.card, true);
      state.turn.effect.val.curr++;
    }
  }
];

export const chooseStealHero = (roomId: string, playerNum: number) => {
  const state = rooms[roomId].state;
  if (!state.turn.effect) return;

  state.turn.effect.action = 'choose-other-boards';
  state.turn.effect.actionChanged = true;
  state.turn.effect.val = { min: 1, max: 1, curr: 0 };
  state.turn.effect.allowedCards = [];
  state.turn.effect.players = [playerNum];
  state.turn.effect.purpose = 'Steal Hero';
  sendGameState(roomId);
};
export const receiveStealHero = (
  roomId: string,
  playerNum: number,
  returnVal?: returnType
) => {
  const state = rooms[roomId].state;
  if (
    !state.turn.effect ||
    !returnVal ||
    !returnVal.card ||
    returnVal.card.player === undefined ||
    returnVal.card.type !== CardType.hero ||
    returnVal.card.player === playerNum
  )
    return;

  state.turn.effect.choice = [returnVal.card];
  state.turn.effect.val.curr++;
  sendGameState(roomId);

  stealCard(roomId, playerNum, returnVal.card.player, returnVal.card);
  setTimeout(() => {
    sendGameState(roomId);
  }, 1200);
};
export const stealHero = [chooseStealHero, receiveStealHero];

export const chooseDestroyHero = (roomId: string, playerNum: number) => {
  const state = rooms[roomId].state;
  if (!state.turn.effect) return;

  state.turn.effect.action = 'choose-other-boards';
  state.turn.effect.actionChanged = true;
  state.turn.effect.val = { min: 1, max: 1, curr: 0 };
  state.turn.effect.allowedCards = [];
  state.turn.effect.players = [playerNum];
  state.turn.effect.purpose = 'Destroy Hero';
  state.turn.effect.active = { num: [playerNum] };
  sendGameState(roomId);
};
export const receiveDestroyHero = (
  roomId: string,
  playerNum: number,
  returnVal?: returnType
) => {
  const state = rooms[roomId].state;
  if (
    !state.turn.effect ||
    !returnVal ||
    !returnVal.card ||
    returnVal.card.player === undefined ||
    returnVal.card.type !== CardType.hero ||
    !state.turn.effect.active ||
    !state.turn.effect.active.num ||
    returnVal.card.player === state.turn.effect.active.num[0]
  )
    return;

  state.turn.effect.choice = [returnVal.card];
  state.turn.effect.val.curr++;
  sendGameState(roomId);

  destroyCard(roomId, returnVal.card.player, returnVal.card);
  setTimeout(() => {
    sendGameState(roomId);
  }, 1200);
};
export const destroyHero = [chooseDestroyHero, receiveDestroyHero];

export const chooseDiscardCard =
  (num: number) => (roomId: string, playerNum: number) => {
    const state = rooms[roomId].state;
    if (!state.turn.effect || !state.turn.effect.choice) return;

    state.turn.effect.action = 'choose-hand';
    state.turn.effect.actionChanged = true;
    state.turn.effect.val = { min: num, max: num, curr: 0 };
    state.turn.effect.allowedCards = allCards;
    state.turn.effect.players = [playerNum];
    state.turn.effect.purpose = num === 1 ? 'Discard Card' : 'Discard Cards';
    state.turn.effect.active = {
      num: [playerNum, num]
    };
    state.turn.effect.choice = [];
    sendGameState(roomId);
  };
export const receiveDiscardCard = (
  roomId: string,
  playerNum: number,
  returnVal?: returnType
) => {
  const state = rooms[roomId].state;
  if (
    !state.turn.effect ||
    !returnVal ||
    !returnVal.card ||
    !state.turn.effect ||
    !state.turn.effect.active ||
    !state.turn.effect.active.num ||
    returnVal.card.player !== state.turn.effect.active.num[0] ||
    !state.turn.effect.choice
  )
    return;

  if (++state.turn.effect.val.curr < state.turn.effect.val.max) {
    state.turn.effect.players = [state.turn.effect.active.num[0]];
  }

  state.turn.effect.choice = [
    ...(state.turn.effect.choice as AnyCard[]),
    returnVal.card
  ];

  discardCard(roomId, state.turn.effect.active.num[0], returnVal.card.id);
  sendGameState(roomId);
};
export const discardCards = (num: number) => [
  chooseDiscardCard(num),
  receiveDiscardCard
];

export const pullIfPull = (cardType: CardType) => [
  ...pickFromHand,
  (roomId: string, playerNum: number) => {
    const state = rooms[roomId].state;
    if (
      !state.turn.effect ||
      !state.turn.effect.active ||
      !state.turn.effect.active.num
    )
      return;

    const playerPick = state.turn.effect.active.num[0];

    setTimeout(() => {
      if (!state.turn.effect || state.players[playerNum].numCards <= 0) return;
      console.log('hi bro');
      if (
        state.players[playerNum].hand[state.players[playerNum].numCards - 1]
          .type === cardType
      ) {
        state.turn.effect.choice = [playerPick];
        state.turn.effect.players = [playerNum];
        const cardName = state.turn.effect.card.name
          .replaceAll(' ', '-')
          .toLowerCase();
        heroAbilities[cardName][++state.turn.effect.step](roomId, playerNum);
      } else {
        endEffect(roomId, playerNum);
      }
    }, 1200);
  },
  pickCard,
  addCard,
  (roomId: string, playerNum: number) =>
    setTimeout(() => {
      endEffect(roomId, playerNum);
    }, 1200)
];

export const chooseCard = (roomId: string, playerNum: number) => {
  const state = rooms[roomId].state;
  if (
    !state.turn.effect ||
    !state.turn.effect.active ||
    !state.turn.effect.active.card
  )
    return;

  state.turn.effect.action = 'choose-cards';
  state.turn.effect.actionChanged = true;
  state.turn.effect.val = { min: 1, max: 1, curr: 0 };
  state.turn.effect.allowedCards = [];
  state.turn.effect.players = [playerNum];
  state.turn.effect.purpose = 'Add Card';
  state.turn.effect.active.num = [
    playerNum,
    state.turn.effect.active.card.length
  ];
  state.turn.effect.choice = null;
  setTimeout(() => {
    sendGameState(roomId);
  }, 2000);
};
export const receiveCard = (
  roomId: string,
  playerNum: number,
  returnVal?: returnType
) => {
  const state = rooms[roomId].state;
  if (
    !state.turn.effect ||
    !returnVal ||
    !returnVal.card ||
    !state.turn.effect.active ||
    !state.turn.effect.active.card
  )
    return;

  state.turn.effect.choice = [returnVal.card];
  state.turn.effect.val.curr++;
  sendGameState(roomId);

  addCards(roomId, [returnVal.card], playerNum);
  state.mainDeck.discardPile = state.mainDeck.discardPile.filter(
    card => card.id !== returnVal.card?.id
  );

  setTimeout(() => {
    sendGameState(roomId);
  }, 1200);
};
export const chooseToAdd = [chooseCard, receiveCard];
