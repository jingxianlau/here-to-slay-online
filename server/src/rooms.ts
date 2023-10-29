import cloneDeep from 'lodash.clonedeep';
import { initialState } from './cards';
import { Room } from './types';

export const rooms: { [key: string]: Room } = {
  '999999': { numPlayers: 0, state: cloneDeep(initialState), private: false }
};
