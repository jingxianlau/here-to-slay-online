import { CardType, ClientStateObj } from '../types';

export function allowedCard(
  allowedCards: ClientStateObj['allowedCards']['val'],
  cardType: CardType
) {
  return allowedCards.some(val => val === cardType);
}
