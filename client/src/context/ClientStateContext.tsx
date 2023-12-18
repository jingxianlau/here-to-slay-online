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
  const [state, setState] = useState<GameState>({} as GameState);
  const [allowedCards, setAllowedCards] = useState<CardType[]>(allCards);
  const [showRoll, setShowRoll] = useState(false);
  const [hasRolled, setHasRolled] = useState(false);
  const [showHand, setShowHand] = useState(false);
  const [handLock, setHandLock] = useState(false);
  const [handAnimation, setHandAnimation] = useState(false);
  const [shownCard, setShownCard] = useState<AnyCard | null>(null);
  const [chosenCard, setChosenCard] = useState<AnyCard | null>(null);
  const [showChosenCard, setShowChosenCard] = useState(false);
  const [chosenCardCustomText, setChosenCardCustomText] = useState('');
  const [chosenCardCustomCenter, setChosenCardCustomCenter] = useState('');
  const [pos, setPos] = useState<'left' | 'right' | 'top' | 'center' | null>(
    null
  );
  const [shownCardLock, setShownCardLock] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  // const { timer, setTargetAchieved } = useEventTimer();
  // const [maxTime, setMaxTime] = useState(30);
  const [helperText, setHelperText] = useState('');
  const [showHelperText, setShowHelperText] = useState(false);
  const [showText, setShowText] = useState(false);
  const [loadedCards, setLoadedCards] = useState(0);

  const initVal: ClientStateObj = {
    credentials,
    setCredentials,
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
    chosenCard: {
      val: chosenCard,
      set: setChosenCard,
      show: showChosenCard,
      setShow: setShowChosenCard,
      customText: chosenCardCustomText,
      setCustomText: setChosenCardCustomText,
      customCenter: chosenCardCustomCenter,
      setCustomCenter: setChosenCardCustomCenter
    },
    showHand: {
      val: showHand,
      set: setShowHand,
      locked: handLock,
      setLocked: setHandLock,
      animation: handAnimation,
      setAnimation: setHandAnimation
    },
    shownCard: {
      val: shownCard,
      set: setShownCard,
      pos: pos,
      setPos: setPos,
      locked: shownCardLock,
      setLocked: setShownCardLock
    },
    // timer: {
    //   settings: timer,
    //   setTargetAchieved,
    //   maxTime: {
    //     val: maxTime,
    //     set: setMaxTime
    //   }
    // },
    showHelperText: {
      val: showHelperText,
      set: setShowHelperText,
      text: helperText,
      setText: setHelperText,
      showText,
      setShowText
    },

    loadedCards: {
      val: loadedCards,
      set: setLoadedCards
    }
  };

  return (
    <ClientStateContext.Provider value={initVal}>
      {children}
    </ClientStateContext.Provider>
  );
};

export default ClientContextProvider;
