import React, { useEffect } from 'react';
import useClientContext from '../hooks/useClientContext';
import { getImage } from '../helpers/getImage';
import { Socket } from 'socket.io-client';

interface EffectPopupProps {
  socket: Socket;
  show: boolean;
  showBoard: boolean;
}

const EffectPopup: React.FC<EffectPopupProps> = ({ show, showBoard }) => {
  const {
    state: { val: state }
  } = useClientContext();

  return state.turn.effect && state.turn.effect.action === 'choose-hand' ? (
    <div
      className={`effect-cover${show && state.turn.effect ? ' show' : ' hide'}`}
      style={{
        opacity: show && state.turn.effect && !showBoard ? 1 : 0,
        top: show && state.turn.effect && !showBoard ? 0 : '100vh'
      }}
    >
      <div className='content'>
        <div className='img-container'>
          <img
            src={getImage(state.turn.effect.card)}
            alt={state.turn.effect.card.name}
            className='small-lg'
          />
        </div>
        <h1>{state.turn.effect.purpose}</h1>
      </div>
    </div>
  ) : (
    <div></div>
  );
};

export default EffectPopup;
