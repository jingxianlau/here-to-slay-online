import { createContext, useState } from 'react';
import {
  AnyCard,
  CardType,
  ClientStateObj,
  GameState,
  allCards
} from '../types';
import { getCredentials } from '../helpers/getJSON';
import useEventTimer from '../hooks/useEventTimer';

export const ClientStateContext = createContext<ClientStateObj>(
  {} as ClientStateObj
);

const ClientContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [credentials, setCredentials] = useState(getCredentials());
  const [playerNum, setPlayerNum] = useState(-1);
  const [state, setState] = useState<GameState>({} as GameState);
  const [allowedCards, setAllowedCards] = useState<CardType[]>(allCards);
  const [showRoll, setShowRoll] = useState(false);
  const [hasRolled, setHasRolled] = useState(false);
  const [showHand, setShowHand] = useState(false);
  const [handLock, setHandLock] = useState(false);
  const [shownCard, setShownCard] = useState<AnyCard | null>(null);
  const [pos, setPos] = useState<'left' | 'right' | 'top' | null>(null);
  const [shownCardLock, setShownCardLock] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const { timer, targetAchieved, onEnd } = useEventTimer(1);
  const [helperText, setHelperText] = useState('');
  const [showHelperText, setShowHelperText] = useState(false);
  const [showText, setShowText] = useState(false);

  const initVal: ClientStateObj = {
    credentials,
    setCredentials,
    playerNum: {
      val: playerNum,
      set: setPlayerNum
    },
    state: {
      val: state,
      set: setState
    },
    allowedCards: {
      val: allowedCards,
      set: setAllowedCards
    },
    showRoll: {
      val: showRoll,
      set: setShowRoll
    },
    hasRolled: {
      val: hasRolled,
      set: setHasRolled
    },
    showPopup: {
      val: showPopup,
      set: setShowPopup
    },
    showHand: {
      val: showHand,
      set: setShowHand,
      locked: handLock,
      setLocked: setHandLock
    },
    shownCard: {
      val: shownCard,
      set: setShownCard,
      pos: pos,
      setPos: setPos,
      locked: shownCardLock,
      setLocked: setShownCardLock
    },
    timer: {
      settings: timer,
      targetAchieved,
      onEnd
    },
    showHelperText: {
      val: showHelperText,
      set: setShowHelperText,
      text: helperText,
      setText: setHelperText,
      showText: showText,
      setShowText: setShowText
    }
  };

  return (
    <ClientStateContext.Provider value={initVal}>
      {children}
    </ClientStateContext.Provider>
  );
};

export default ClientContextProvider;

/* 

export interface ClientStateObj {
  // player state
  credentials: {
    val: {
      roomId: string;
      userId: string;
    };
    set: React.Dispatch<
      React.SetStateAction<{
        roomId: string;
        userId: string;
      }>
    >;
  };
  playerNum: { val: number; set: React.Dispatch<React.SetStateAction<number>> };

  // gameplay state
  state: {
    val: GameState;
    set: React.Dispatch<React.SetStateAction<GameState>>;
  };

  allowedCards: {
    val: CardType[];
    set: React.Dispatch<React.SetStateAction<CardType[]>>;
  };

  showRoll: {
    val: boolean;
    set: React.Dispatch<React.SetStateAction<boolean>>;
  };
  hasRolled: {
    val: boolean;
    set: React.Dispatch<React.SetStateAction<boolean>>;
  };

  showPopup: {
    val: boolean;
    set: React.Dispatch<React.SetStateAction<boolean>>;
  };

  showHand: {
    val: boolean;
    set: React.Dispatch<React.SetStateAction<boolean>>;
    locked: boolean;
    setLocked: React.Dispatch<React.SetStateAction<boolean>>;
  };

  shownCard: {
    val: AnyCard | null;
    set: React.Dispatch<React.SetStateAction<AnyCard | null>>;
    pos: 'left' | 'right' | 'top' | null;
    setPos: React.Dispatch<
      React.SetStateAction<'left' | 'right' | 'top' | null>
    >;
    locked: boolean;
    setLocked: React.Dispatch<React.SetStateAction<boolean>>;
  };

  timer: {
    settings: Timer;
    targetAchieved: boolean;
    onEnd: (cb: () => void) => void;
  };
}

*/
