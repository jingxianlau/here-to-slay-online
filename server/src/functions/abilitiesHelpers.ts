import { endTurnDiscard } from '../controllers/socketio/game/useEffect';
import { rooms } from '../rooms';
import { sendGameState } from '../server';
import {
  AnyCard,
  CardType,
  GameState,
  HeroCard,
  HeroClass,
  MagicCard,
  MonsterCard,
  allCards
} from '../types';
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
export interface Effect {
  action:
    | 'none' // DONE
    | 'draw' // DONE
    | 'choose-two' // DONE
    | 'reveal' // DONE
    | 'choose-boards' // DONE
    | 'choose-own-board' // DONE
    | 'choose-other-boards' // DONE
    | 'choose-player' // DONE
    | 'choose-hand' // DONE
    | 'choose-other-hand-hide' // DONE
    | 'choose-other-hand-show' // DONE
    | 'choose-discard'
    | 'choose-cards'; // DONE
  actionChanged: boolean;
  players: number[]; // active players who can choose
  val: { min: number; max: number; curr: number }; // num of items to choose
  goNext: boolean;
  step: number; // to access functions in ability array
  card: HeroCard | MagicCard | MonsterCard; // card in use
  choice: AnyCard[] | number[] | null; // player's chosen option(s) (to display)
  active?: {
    num?: number[];
    card?: AnyCard[];
  };
  activeNumVisible: boolean[];
  activeCardVisible: boolean[];
  purpose: string; // message (e.g. destroy, swap deck etc.)
  allowedCards?: CardType[];
}

export const endEffect = (
  roomId: string,
  state: GameState,
  effect: Effect,
  updatePhase = true
) => {
  state.turn.effect = null;
  if (updatePhase) {
    if (state.turn.movesLeft > 0) {
      if (state.turn.cachedEvent) {
        state.turn.phase = state.turn.cachedEvent.phase;
        state.turn.effect = state.turn.cachedEvent.effect;
        state.turn.cachedEvent = null;
      }
      state.turn.phase = 'play';
      state.turn.phaseChanged = true;
      sendGameState(roomId);
    } else endTurnDiscard(roomId, state.secret.playerIds[state.turn.player]);
  }
};

export const choosePlayer = (
  roomId: string,
  state: GameState,
  effect: Effect,
  text = 'Choose Player'
) => {
  effect.action = 'choose-player';
  effect.actionChanged = true;
  effect.val = { min: 1, max: 1, curr: 0 };
  effect.allowedCards = [];
  effect.players = [state.turn.player];
  effect.purpose = text;
  sendGameState(roomId);
};
export const receivePlayer = (
  roomId: string,
  state: GameState,
  effect: Effect,
  returnVal?: returnType
) => {
  if (!state.turn.effect || !returnVal || !returnVal.num) return;
  effect.choice = [returnVal.num];
  effect.val.curr++;
  sendGameState(roomId);
};
export const pickPlayer = (text = 'Choose Player') => [
  (roomId: string, state: GameState, effect: Effect) =>
    choosePlayer(roomId, state, effect, text),
  receivePlayer
];

export const pickCard = (roomId: string, state: GameState, effect: Effect) => {
  if (!effect.choice || typeof effect.choice[0] !== 'number') return;

  effect.action = 'choose-other-hand-hide';
  effect.actionChanged = true;
  effect.val = { min: 1, max: 1, curr: 0 };
  effect.allowedCards = [];
  effect.players = [state.turn.player];
  effect.purpose = 'Choose Card';
  effect.active = {
    num: [effect.choice[0], state.players[effect.choice[0]].numCards]
  };
  effect.choice = null;
  setTimeout(() => {
    sendGameState(roomId);
  }, 1200);
};
export const addCard = (
  roomId: string,
  state: GameState,
  effect: Effect,
  returnVal?: returnType
) => {
  if (!returnVal || !returnVal.num || !effect.active || !effect.active.num)
    return;

  effect.choice = [returnVal.num];
  effect.val.curr++;
  sendGameState(roomId);

  const card = removeCardIndex(roomId, effect.active.num[0], returnVal.num);
  if (card === -1) return;
  addCards(roomId, [card], state.turn.player);

  setTimeout(() => {
    sendGameState(roomId);
    if (effect.active) {
      delete effect.active.num;
    }
  }, 400);
};
export const pickFromHand = [
  (roomId: string, state: GameState, effect: Effect) =>
    choosePlayer(roomId, state, effect),
  receivePlayer,
  pickCard,
  addCard
];

export const ifMayPlay = (
  num: number,
  type: CardType.hero | CardType.item | CardType.magic
) => {
  return [
    (roomId: string, state: GameState, effect: Effect) => {
      if (!state.turn.effect || state.players[state.turn.player].numCards <= 0)
        return;

      setTimeout(() => {
        if (state.turn.effect) {
          effect.action = 'choose-two';
          effect.actionChanged = true;
          effect.val = { min: 1, max: 1, curr: 0 };
          effect.allowedCards = [];
          effect.players = [state.turn.player];
          effect.purpose = 'Play Cancel';
          effect.active = {};
          effect.active.card = [];
          effect.active.num = [];

          for (let i = num; i >= 1; i--) {
            const card =
              state.players[state.turn.player].hand[
                state.players[state.turn.player].numCards - i
              ];
            effect.active.card.push(card);
          }

          for (let i = 0; i < num; i++) {
            effect.active.num.push(effect.active.card[i].type === type ? 1 : 0);
          }

          effect.activeNumVisible = [];
          effect.activeCardVisible = [];
          for (let i = 0; i < rooms[roomId].numPlayers; i++) {
            effect.activeNumVisible.push(i === state.turn.player);
            effect.activeCardVisible.push(i === state.turn.player);
          }

          sendGameState(roomId);
        }
      }, 1200);
    },
    (
      roomId: string,
      state: GameState,
      effect: Effect,
      returnVal?: returnType
    ) => {
      if (!effect.active || !effect.active.card || !effect.active.num) return;

      effect.val.curr++;
      if (effect.active.num[0] === 0 || (returnVal && returnVal.num === -1)) {
        endEffect(roomId, state, effect);
      } else if (
        effect.active.num[0] === 1 &&
        returnVal &&
        returnVal.num === 0 &&
        effect.active.card[0].type === type
      ) {
        playCard(roomId, state.turn.player, effect.active.card[0], true);
      }
    }
  ];
};

export const drawCard = (num = 1) => [
  (roomId: string, state: GameState, effect: Effect) => {
    effect.action = 'draw';
    effect.actionChanged = true;
    effect.allowedCards = [];
    effect.val = { min: 1, max: 1, curr: 0 };
    effect.players = [state.turn.player];
    effect.purpose = 'Draw Card';
    sendGameState(roomId);
  },
  (roomId: string, state: GameState, effect: Effect) => {
    drawCards(roomId, state.turn.player, num);
    effect.val.curr++;
    sendGameState(roomId);
  }
];

export const playFromHand = (
  type: CardType.hero | CardType.magic | CardType.item
) => [
  (roomId: string, state: GameState, effect: Effect) => {
    effect.action = 'choose-hand';
    effect.actionChanged = true;
    effect.allowedCards = [type];
    effect.val = { min: 1, max: 1, curr: 0 };
    effect.players = [state.turn.player];
    effect.purpose = `Play ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    sendGameState(roomId);
  },
  (
    roomId: string,
    state: GameState,
    effect: Effect,
    returnVal?: returnType
  ) => {
    if (!returnVal?.card) {
      effect.choice = [0];
      effect.val.curr++;
      sendGameState(roomId);
      endEffect(roomId, state, effect);
    } else if (returnVal && returnVal.card && returnVal.card.type === type) {
      effect.choice = [returnVal.card];
      playCard(roomId, state.turn.player, returnVal.card, true);
      effect.val.curr++;
    }
  }
];

export const chooseStealHero = (
  roomId: string,
  state: GameState,
  effect: Effect
) => {
  effect.action = 'choose-other-boards';
  effect.actionChanged = true;
  effect.val = { min: 1, max: 1, curr: 0 };
  effect.allowedCards = [];
  effect.players = [state.turn.player];
  effect.purpose = 'Steal Hero';
  sendGameState(roomId);
};
export const receiveStealHero = (
  roomId: string,
  state: GameState,
  effect: Effect,
  returnVal?: returnType
) => {
  if (
    !returnVal ||
    !returnVal.card ||
    returnVal.card.player === undefined ||
    returnVal.card.type !== CardType.hero ||
    returnVal.card.player === state.turn.player
  )
    return;

  effect.choice = [returnVal.card];
  effect.val.curr++;
  sendGameState(roomId);

  stealCard(roomId, state.turn.player, returnVal.card.player, returnVal.card);
  setTimeout(() => {
    sendGameState(roomId);
  }, 1200);
};
export const stealHero = [chooseStealHero, receiveStealHero];

export const chooseDestroyHero = (
  roomId: string,
  state: GameState,
  effect: Effect
) => {
  effect.action = 'choose-other-boards';
  effect.actionChanged = true;
  effect.val = { min: 1, max: 1, curr: 0 };
  effect.allowedCards = [];
  effect.players = [state.turn.player];
  effect.purpose = 'Destroy Hero';
  effect.active = { num: [state.turn.player] };
  sendGameState(roomId);
};
export const receiveDestroyHero = (
  roomId: string,
  state: GameState,
  effect: Effect,
  returnVal?: returnType
) => {
  if (
    !returnVal ||
    !returnVal.card ||
    returnVal.card.player === undefined ||
    returnVal.card.type !== CardType.hero ||
    !effect.active ||
    !effect.active.num ||
    returnVal.card.player === effect.active.num[0]
  )
    return;

  effect.choice = [returnVal.card];
  effect.val.curr++;
  sendGameState(roomId);

  destroyCard(roomId, returnVal.card.player, returnVal.card);
  setTimeout(() => {
    sendGameState(roomId);
  }, 1200);
};
export const destroyHero = [chooseDestroyHero, receiveDestroyHero];

export const chooseDiscardCard =
  (min: number, max: number) =>
  (roomId: string, state: GameState, effect: Effect) => {
    effect.action = 'choose-hand';
    effect.actionChanged = true;
    effect.val = { min, max, curr: 0 };
    effect.allowedCards = allCards;
    effect.players = [state.turn.player];
    effect.purpose = max === 1 ? 'Discard Card' : 'Discard Cards';
    effect.active = {
      num: [state.turn.player, min]
    };
    effect.choice = [];
    sendGameState(roomId);
  };
export const receiveDiscardCard = (
  roomId: string,
  state: GameState,
  effect: Effect,
  returnVal?: returnType
) => {
  if (
    !returnVal ||
    !returnVal.card ||
    !effect.active ||
    !effect.active.num ||
    returnVal.card.player !== effect.active.num[0] ||
    !effect.choice
  )
    return;

  if (++effect.val.curr < effect.val.max) {
    effect.players = [effect.active.num[0]];
  }

  effect.choice = [...(effect.choice as AnyCard[]), returnVal.card];

  discardCard(roomId, effect.active.num[0], returnVal.card.id);
  sendGameState(roomId);
};
export const discardCards = (min: number, max = min) => [
  chooseDiscardCard(min, max),
  receiveDiscardCard
];

export const pullIfPull = (cardType: CardType) => [
  ...pickFromHand,
  (roomId: string, state: GameState, effect: Effect) => {
    if (!effect.active || !effect.active.num) return;

    const playerPick = effect.active.num[0];

    setTimeout(() => {
      if (!state.turn.effect || state.players[state.turn.player].numCards <= 0)
        return;
      console.log('hi bro');
      if (
        state.players[state.turn.player].hand[
          state.players[state.turn.player].numCards - 1
        ].type === cardType
      ) {
        effect.choice = [playerPick];
        effect.players = [state.turn.player];
        const cardName = effect.card.name.replaceAll(' ', '-').toLowerCase();
        heroAbilities[cardName][++effect.step](roomId, state, effect);
      } else {
        endEffect(roomId, state, effect);
      }
    }, 1200);
  },
  pickCard,
  addCard,
  (roomId: string, state: GameState, effect: Effect) =>
    setTimeout(() => {
      endEffect(roomId, state, effect);
    }, 1200)
];

export const chooseCard = (
  roomId: string,
  state: GameState,
  effect: Effect
) => {
  if (!effect.active || !effect.active.card) return;

  effect.action = 'choose-cards';
  effect.actionChanged = true;
  effect.val = { min: 1, max: 1, curr: 0 };
  effect.allowedCards = [];
  effect.players = [state.turn.player];
  effect.purpose = 'Add Card';
  effect.active.num = [state.turn.player, effect.active.card.length];
  effect.choice = null;
  setTimeout(() => {
    sendGameState(roomId);
  }, 2000);
};
export const receiveCard = (
  roomId: string,
  state: GameState,
  effect: Effect,
  returnVal?: returnType
) => {
  if (!returnVal || !returnVal.card || !effect.active || !effect.active.card)
    return;

  effect.choice = [returnVal.card];
  effect.val.curr++;
  sendGameState(roomId);

  addCards(roomId, [returnVal.card], state.turn.player);
  state.mainDeck.discardPile = state.mainDeck.discardPile.filter(
    card => card.id !== returnVal.card?.id
  );

  setTimeout(() => {
    sendGameState(roomId);
  }, 1200);
};
export const chooseToAdd = [chooseCard, receiveCard];

export const revealCard = [
  (roomId: string, state: GameState, effect: Effect) => {
    if (!effect.active || !effect.active.card) return;
    effect.action = 'reveal';
    effect.actionChanged = true;
    effect.allowedCards = [];
    effect.val = { min: 0, max: 0, curr: 0 };

    // everyone (but owner) must confirm
    effect.players = [];
    for (let i = 0; i < rooms[roomId].numPlayers; i++) {
      effect.players.push(i);
    }

    // every can see
    effect.activeCardVisible = [];
    for (let i = 0; i < rooms[roomId].numPlayers; i++) {
      effect.activeCardVisible.push(true);
    }

    sendGameState(roomId);
  },
  (roomId: string, state: GameState, effect: Effect) => sendGameState(roomId)
];

export const chooseReveal = (num: number, type: CardType) => [
  (roomId: string, state: GameState, effect: Effect) => {
    effect.action = 'choose-two';
    effect.actionChanged = true;
    effect.allowedCards = [];
    effect.val = { min: 1, max: 1, curr: 0 };
    effect.players = [state.turn.player];
    effect.active = {};
    effect.active.card = [];
    effect.active.num = [];
    effect.purpose = 'Reveal Cancel';

    for (let i = num; i >= 1; i--) {
      const card =
        state.players[state.turn.player].hand[
          state.players[state.turn.player].numCards - i
        ];
      effect.active.card.push(card);
    }

    for (let i = 0; i < num; i++) {
      effect.active.num.push(effect.active.card[i].type === type ? 1 : 0);
    }

    effect.activeCardVisible = [];
    effect.activeNumVisible = [];
    for (let i = 0; i < rooms[roomId].numPlayers; i++) {
      effect.activeCardVisible.push(i === state.turn.player);
      effect.activeNumVisible.push(i === state.turn.player);
    }

    setTimeout(() => {
      sendGameState(roomId);
    }, 1200);
  },
  (
    roomId: string,
    state: GameState,
    effect: Effect,
    returnVal?: returnType
  ) => {
    if (
      !returnVal ||
      returnVal.num === undefined ||
      !effect.active ||
      !effect.active.card
    )
      return;

    if (
      returnVal.num !== -1 &&
      effect.active.card[returnVal.num].type === type
    ) {
      effect.active = {
        card: [effect.active.card[returnVal.num]]
      };

      effect.activeCardVisible = [];
      effect.activeNumVisible = [];
      for (let i = 0; i < rooms[roomId].numPlayers; i++) {
        effect.activeCardVisible.push(true);
        effect.activeNumVisible.push(true);
      }

      effect.val.curr++;
    } else {
      endEffect(roomId, state, effect);
    }
  },
  ...revealCard
];

export const eachOtherWithHeroInBoardDiscard = (heroClass: HeroClass) => [
  (roomId: string, state: GameState, effect: Effect) => {
    effect.action = 'choose-hand';
    effect.actionChanged = true;
    effect.val = { min: 1, max: 1, curr: 0 };
    effect.allowedCards = allCards;
    effect.purpose = 'Discard Card';

    effect.active = {};
    effect.active.num = [state.turn.player, 1, 3];

    for (let i = 0; i < rooms[roomId].numPlayers; i++) {
      if (
        state.board[i].heroCards.some(val => val?.class === heroClass) &&
        i !== state.turn.player
      ) {
        effect.active.num.push(i);
      }
    }

    if (effect.active.num.length - 3 > 0) {
      effect.active.num[0] = effect.active.num[3];
      effect.players = [effect.active.num[effect.active.num[2]]];
      effect.choice = [];
    } else {
      endEffect(roomId, state, effect);
    }
    sendGameState(roomId);
  },
  (
    roomId: string,
    state: GameState,
    effect: Effect,
    returnVal?: returnType
  ) => {
    if (
      !returnVal ||
      !returnVal.card ||
      !effect.active ||
      !effect.active.num ||
      returnVal.card.player !== effect.active.num[0]
    )
      return;

    effect.choice = [returnVal.card];
    discardCard(roomId, effect.active.num[0], returnVal.card.id);

    sendGameState(roomId);

    console.log(
      effect.active.num[2] - 2 < effect.active.num.length - 3,
      effect.active.num[2] - 3,
      effect.active.num.length - 3
    );
    if (effect.active.num[2] - 2 < effect.active.num.length - 3) {
      const next = effect.active.num[++effect.active.num[2]];
      effect.players = [next];
      effect.active.num[0] = next;
      effect.val = {
        min: 1,
        max: 1,
        curr: 0
      };
      effect.choice = null;
    } else {
      effect.val.curr++;
    }

    setTimeout(() => {
      sendGameState(roomId);
    }, 1200);
  },
  (roomId: string, state: GameState, effect: Effect) =>
    setTimeout(() => {
      endEffect(roomId, state, effect);
    }, 1500)
];

export const searchDiscard = (type: CardType) => [
  (roomId: string, state: GameState, effect: Effect) => {
    effect.action = 'choose-discard';
    effect.actionChanged = true;
    effect.val = { min: 1, max: 1, curr: 0 };
    effect.allowedCards = [type];
    effect.players = [state.turn.player];
    effect.purpose = 'Add Card';
    effect.choice = null;
    sendGameState(roomId);
  },
  (
    roomId: string,
    state: GameState,
    effect: Effect,
    returnVal?: returnType
  ) => {
    if (!returnVal || !returnVal.card || returnVal.card.type !== type) return;
    effect.val.curr++;
    effect.choice = [returnVal.card];
    state.mainDeck.discardPile = state.mainDeck.discardPile.filter(
      val => val.id !== returnVal.card?.id
    );
    addCards(roomId, [returnVal.card], state.turn.player);
    sendGameState(roomId);
  },
  (roomId: string, state: GameState, effect: Effect) =>
    setTimeout(() => {
      endEffect(roomId, state, effect);
    }, 1200)
];
