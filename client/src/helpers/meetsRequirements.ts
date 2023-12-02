import {
  GameState,
  HeroClass,
  LargeCard,
  LeaderCard,
  monsterRequirements
} from '../types';
import { shortenName } from './getImage';

export const restOfCards = (
  requirements: { req: number; hero: HeroClass | 'hero' }[],
  state: GameState
) => {
  let usedCards = 0;
  for (let i = 0; i < requirements.length; i++) {
    const heroClass = requirements[i].hero;
    if (heroClass !== 'hero') {
      let num = state.board[state.playerNum].classes[heroClass];
      if (
        heroClass ===
        (state.board[state.playerNum].largeCards[0] as LeaderCard).class
      ) {
        num--;
      }
      usedCards += num > requirements[i].req ? requirements[i].req : num;
    }
  }
  return state.board[state.playerNum].heroCards.length - usedCards;
};

export const meetsRequirements = (monster: LargeCard, state: GameState) => {
  for (const requirement of monsterRequirements[shortenName(monster)]) {
    if (requirement.hero !== 'hero') {
      if (
        state.board[state.playerNum].classes[requirement.hero] < requirement.req
      ) {
        return false;
      }
    } else {
      if (
        restOfCards(monsterRequirements[shortenName(monster)], state) <
        requirement.req
      ) {
        return false;
      }
    }
  }
  return true;
};
