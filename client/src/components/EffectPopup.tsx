import React, { useEffect } from 'react';
import useClientContext from '../hooks/useClientContext';
import { getImage } from '../helpers/getImage';
import { Socket } from 'socket.io-client';

interface EffectPopupProps {
  socket: Socket;
  show: boolean;
  showBoard: boolean;
}

const EffectPopup: React.FC<EffectPopupProps> = ({
  socket,
  show,
  showBoard
}) => {
  const {
    state: { val: state },
    credentials: { roomId, userId }
  } = useClientContext();

  const choosePlayer = (playerNum: number) => {
    if (
      state.turn.effect &&
      state.turn.effect.players.some(val => val === state.playerNum)
    ) {
      socket.emit(
        'use-effect',
        roomId,
        userId,
        state.turn.effect.card,
        playerNum
      );
    }
  };

  return (
    state.turn.effect &&
    (state.turn.effect.action === 'choose-player' ? (
      <div
        className={`effect-popup${
          show && state.turn.effect ? ' show' : ' hide'
        }`}
        style={{
          top: showBoard ? '-73.4vh' : '10.5vh'
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
          <div className='options'>
            <h1>{state.turn.effect.purpose}</h1>
            <div
              className={`player-select ${
                state.turn.player === state.playerNum &&
                !state.turn.effect.choice
                  ? 'choose'
                  : 'watch'
              }`}
            >
              {state.match.players.map(
                (username, i) =>
                  i != state.turn.player && (
                    <div
                      key={i}
                      onClick={() => {
                        if (state.turn.player === state.playerNum) {
                          choosePlayer(i);
                        }
                      }}
                    >
                      <h3
                        className={
                          state.turn.effect?.choice?.some(val => val === i)
                            ? 'chosen'
                            : ''
                        }
                      >
                        {username}
                      </h3>
                    </div>
                  )
              )}
            </div>
          </div>
        </div>
      </div>
    ) : state.turn.effect.action === 'choose-hand' ? (
      <div
        className={`effect-cover${
          show && state.turn.effect ? ' show' : ' hide'
        }`}
        style={{
          opacity: !showBoard ? 1 : 0,
          top: !showBoard ? 0 : '100vh'
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
    ))
  );
};

export default EffectPopup;
