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
  show,
  showBoard,
  socket
}) => {
  const {
    state: { val: state },
    credentials: { roomId, userId }
  } = useClientContext();

  return (
    <div
      className={`effect-cover${show && state.turn.effect ? ' show' : ' hide'}`}
      style={{
        opacity: show && state.turn.effect && !showBoard ? 1 : 0
      }}
    >
      {state.turn.effect &&
        (state.turn.effect.action === 'choose-hand' ? (
          <div className='content'>
            <div className='top'>
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
        ) : state.turn.effect.action === 'choose-other-hand-hide' ? (
          <div className='content'>
            <div className='top'>
              <div className='img-container'>
                <img
                  src={getImage(state.turn.effect.card)}
                  alt={state.turn.effect.card.name}
                  className='small-lg'
                />
              </div>
              <h2>{state.match.players[state.turn.effect.active.num]}</h2>
              <h1>{state.turn.effect.purpose}</h1>
            </div>
            <div
              className={`bottom${
                state.players[state.playerNum].numCards *
                  ((19 / 100) * window.innerHeight) >
                window.innerWidth
                  ? ' cover'
                  : ' list'
              }`}
            >
              {Array.from(
                Array(state.players[state.turn.effect.active.num].numCards),
                (_, i) => (
                  <img
                    key={i}
                    src='https://jingxianlau.github.io/here-to-slay/assets/back/back-creme.png'
                    alt='card'
                    onClick={
                      state.turn.effect?.players.some(
                        val => val === state.playerNum
                      )
                        ? () => {
                            socket.emit(
                              'use-effect',
                              roomId,
                              userId,
                              state.turn.effect?.card,
                              i
                            );
                          }
                        : () => {}
                    }
                    className={`small-md ${
                      state.turn.effect?.players.some(
                        val => val === state.playerNum
                      )
                        ? 'active'
                        : state.turn.effect?.choice &&
                          state.turn.effect.choice[0] === i
                        ? 'chosen'
                        : ''
                    }`}
                  />
                )
              )}
            </div>
          </div>
        ) : (
          <></>
        ))}
    </div>
  );
};

export default EffectPopup;
