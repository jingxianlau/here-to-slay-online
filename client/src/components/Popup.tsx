import React, { ReactNode } from 'react';
import { Credentials, GameState } from '../types';
import { Socket } from 'socket.io-client';
import { getImage } from '../helpers/getImage';

interface PopupProps {
  type: 'challenge' | 'challenge-roll' | 'modify';
  state: GameState;
  socket: Socket;
  credentials: Credentials;
  setShowHand: React.SetStateAction<React.Dispatch<boolean>>;
}

const Popup: React.FC<PopupProps> = ({
  type,
  state,
  socket,
  credentials,
  setShowHand
}) => {
  const preppedCard = state.mainDeck.preparedCard;
  return (
    <>
      {preppedCard && (
        <div className='challenge-popup'>
          <div className='side-card'>
            <img src={getImage(preppedCard.card)} className='small-card glow' />
          </div>
          <div className='dice'></div>
          <div className='side-modifier'></div>
        </div>
      )}
    </>
  );
};

export default Popup;
