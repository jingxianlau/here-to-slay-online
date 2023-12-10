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
      className={`effect-cover${
        show && state.turn.effect && !showBoard ? ' show' : ' hide'
      }`}
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
        ) : state.turn.effect.action === 'choose-other-hand-hide' &&
          state.turn.effect.active &&
          state.turn.effect.active.num &&
          state.turn.effect.active.num.length === 2 ? (
          <div className='content'>
            <div className='top'>
              <div className='img-container'>
                <img
                  src={getImage(state.turn.effect.card)}
                  alt={state.turn.effect.card.name}
                  className='small-lg'
                />
              </div>
              <h2>{state.match.players[state.turn.effect.active.num[0]]}</h2>
              <h1>{state.turn.effect.purpose}</h1>
            </div>
            <div
              className={`bottom${
                state.turn.effect.active.num[1] *
                  ((19 / 100) * window.innerHeight) >
                window.innerWidth
                  ? ' cover'
                  : ' list'
              }`}
            >
              {state.turn.effect.active.num[0] !== state.playerNum
                ? Array.from(Array(state.turn.effect.active.num[1]), (_, i) => (
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
                  ))
                : state.players[state.playerNum].hand.map((val, i) => (
                    <>
                      <img
                        key={val.id}
                        src={getImage(val)}
                        alt={val.name}
                        className={`small-md ${
                          state.turn.effect?.choice &&
                          state.turn.effect.choice[0] === i
                            ? 'chosen'
                            : ''
                        }`}
                      />
                    </>
                  ))}
            </div>
          </div>
        ) : state.turn.effect.action === 'play' &&
          state.turn.effect.active &&
          (!state.turn.effect.activeNumVisible[state.playerNum] ||
            state.turn.effect.active.num) &&
          (!state.turn.effect.activeCardVisible[state.playerNum] ||
            state.turn.effect.active.card) ? (
          <div className='choose-cover'>
            {state.turn.player === state.playerNum &&
              state.turn.effect.active.num &&
              (state.turn.effect.active.num[0] === 1 ? (
                <div
                  className='left active'
                  onClick={() => {
                    socket.emit(
                      'use-effect',
                      roomId,
                      userId,
                      state.turn.effect?.card,
                      1
                    );
                  }}
                >
                  {state.turn.effect.purpose}
                </div>
              ) : (
                <div
                  className='left inactive'
                  onClick={() => {}}
                  style={{ opacity: 0 }}
                >
                  {state.turn.effect.purpose}
                </div>
              ))}

            {state.turn.effect.active && state.turn.effect.active.card ? (
              <div className='img-container center'>
                <img
                  src={getImage(state.turn.effect.active.card[0])}
                  alt={state.turn.effect.active.card[0].name}
                  className='small-xl'
                  draggable='false'
                />
              </div>
            ) : (
              <div className='img-container center'>
                <img
                  src='https://jingxianlau.github.io/here-to-slay/assets/back/back-creme.png'
                  alt='hidden card'
                  className='small-xl'
                  draggable='false'
                />
              </div>
            )}

            {state.turn.player === state.playerNum &&
              state.turn.effect.active.num && (
                <div
                  className='right'
                  onClick={() => {
                    socket.emit(
                      'use-effect',
                      roomId,
                      userId,
                      state.turn.effect?.card,
                      0
                    );
                  }}
                >
                  {state.turn.effect.active.num[0] === 1 ? 'Cancel' : 'Next'}
                </div>
              )}
          </div>
        ) : (
          <></>
        ))}
    </div>
  );
};

export default EffectPopup;
