import { monsterRequirements } from '../../../functions/abilities';
import { removeFreeUse, rollDice } from '../../../functions/gameHelpers';
import { validSender } from '../../../functions/helpers';
import { rooms } from '../../../rooms';
import { sendGameState } from '../../../server';
import {
  CardType,
  GameState,
  HeroClass,
  LargeCard,
  LeaderCard,
  MonsterCard
} from '../../../types';

const restOfCards = (
  requirements: { req: number; hero: HeroClass | 'hero' }[],
  state: GameState
) => {
  let usedCards = 0;
  for (let i = 0; i < requirements.length; i++) {
    const heroClass = requirements[i].hero;
    if (heroClass !== 'hero') {
      let num = state.board[state.turn.player].classes[heroClass];
      if (
        heroClass ===
        (state.board[state.turn.player].largeCards[0] as LeaderCard).class
      ) {
        num--;
      }
      usedCards += num > requirements[i].req ? requirements[i].req : num;
    }
  }
  return (
    state.board[state.turn.player].heroCards.filter(val => val !== null)
      .length - usedCards
  );
};
const meetsRequirements = (monster: LargeCard, state: GameState) => {
  for (const requirement of monsterRequirements[
    monster.name.replaceAll(' ', '-').toLowerCase()
  ]) {
    if (requirement.hero !== 'hero') {
      if (
        state.board[state.turn.player].classes[requirement.hero] <
        requirement.req
      ) {
        return false;
      }
    } else {
      if (
        restOfCards(
          monsterRequirements[monster.name.replaceAll(' ', '-').toLowerCase()],
          state
        ) < requirement.req
      ) {
        return false;
      }
    }
  }
  return true;
};

export const attackRoll = (
  roomId: string,
  userId: string,
  monster: MonsterCard
) => {
  const playerNum = validSender(roomId, userId);
  const gameState = rooms[roomId].state;
  if (
    playerNum === -1 ||
    gameState.dice.main.total !== 0 ||
    gameState.turn.player !== playerNum ||
    (gameState.turn.phase !== 'play' &&
      gameState.turn.phase !== 'attack-roll') ||
    !meetsRequirements(monster, gameState) ||
    !gameState.mainDeck.monsters.some(val => val.id === monster.id)
  ) {
    return;
  }

  if (
    gameState.turn.phase === 'attack-roll' &&
    gameState.mainDeck.preparedCard &&
    gameState.mainDeck.preparedCard.card.type === CardType.large &&
    gameState.mainDeck.preparedCard.card.player === undefined &&
    gameState.mainDeck.preparedCard.card.id === monster.id
  ) {
    rollDice(roomId);
  } else {
    if (gameState.turn.movesLeft < 2) return;
    removeFreeUse(roomId);

    gameState.turn.phase = 'attack-roll';
    gameState.turn.phaseChanged = true;
    gameState.mainDeck.preparedCard = { card: monster, successful: null };
    gameState.turn.movesLeft -= 2;
    gameState.turn.isRolling = true;
    sendGameState(roomId);
  }
};
