import { Credentials } from '../types';

export const getCredentials = (): Credentials => {
  return JSON.parse(localStorage.getItem('credentials') as string);
};
