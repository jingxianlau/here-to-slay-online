import React, { ReactNode, useEffect } from 'react';
import { CardType, Credentials, GameState } from '../types';
import { Socket } from 'socket.io-client';
import { getImage } from '../helpers/getImage';
import Dice from './Dice';
import TopMenu from './TopMenu';

interface PopupProps {
  phase: 'challenge' | 'challenge-roll' | 'modify';
  playerNum: number;
  state: GameState;
  socket: Socket;
  credentials: Credentials;
  setShowHand: React.Dispatch<React.SetStateAction<boolean>>;
  setHandLock: React.Dispatch<React.SetStateAction<boolean>>;
  setShownCardLock: React.Dispatch<React.SetStateAction<boolean>>;
  setAllowedCards: React.Dispatch<React.SetStateAction<CardType[] | null>>;
  show: boolean;
}

const Popup: React.FC<PopupProps> = ({
  phase,
  state,
  playerNum,
  socket,
  credentials,
  setShowHand,
  setHandLock,
  setShownCardLock,
  setAllowedCards,
  show
}) => {
  const preppedCard = state.mainDeck.preparedCard;

  useEffect(() => {
    setHandLock(true);
    setShowHand(true);
    setShownCardLock(true);

    if (state.turn.player === playerNum) {
      setAllowedCards(null);
    } else if (phase === 'challenge') {
      setAllowedCards([CardType.challenge]);
    }
  }, []);

  return (
    <div className={'popup'} style={{ opacity: show ? 1 : 0 }}>
      <div className='popup_summary'></div>

      {preppedCard &&
        (phase === 'challenge' ? (
          <div className='challenge-popup'>
            <img
              src={getImage(preppedCard.card)}
              className='small-lg'
              draggable='false'
            />

            <div className='center'>
              <TopMenu state={state} />
              <img
                src='./assets/challenge/challenge.png'
                className='small-md center-img'
                draggable='false'
              />
            </div>

            <div className='side-modifier'></div>
          </div>
        ) : phase === 'challenge-roll' || phase === 'modify' ? (
          <div className='challenge-roll-popup'>
            <img
              src={getImage(preppedCard.card)}
              className='small-card glow'
              draggable='false'
            />
            <div className='dice-box'>
              {!state.dice.defend ? (
                <Dice
                  roll1={state.dice.main.roll[0]}
                  roll2={state.dice.main.roll[1]}
                />
              ) : (
                <Dice
                  roll1={state.dice.defend.roll[0]}
                  roll2={state.dice.defend.roll[1]}
                />
              )}
            </div>
            <div className='side-modifier'></div>
          </div>
        ) : (
          <></>
        ))}
    </div>
  );
};

export default Popup;
