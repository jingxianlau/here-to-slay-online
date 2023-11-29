import { AnyCard } from '../types';

// ONLY FOR USE EFFECT
export function isCard(object: AnyCard | number | null): object is AnyCard {
  return typeof object !== 'number' && object !== null;
}
