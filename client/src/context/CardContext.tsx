import { createContext, useState } from 'react';
import { AnyCard, CardContextObj } from '../types';

export const CardContext = createContext<CardContextObj>({} as CardContextObj);

const CardContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [shownCard, setShownCard] = useState<AnyCard | null>(null);
  const [pos, setPos] = useState<CardContextObj['pos']>(null);

  return (
    <CardContext.Provider
      value={{
        shownCard,
        setShownCard,
        pos,
        setPos
      }}
    >
      {children}
    </CardContext.Provider>
  );
};

export default CardContextProvider;
