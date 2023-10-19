import React, { useContext } from 'react';
import { CardContext } from '../context/CardContext';

const useCardContext = () => {
  return useContext(CardContext);
};

export default useCardContext;
