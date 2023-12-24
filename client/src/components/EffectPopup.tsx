import React, { useEffect, useState } from 'react';
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
    credentials: { roomId, userId },
    shownCard,
    chosenCard,
    mode
  } = useClientContext();

  const [revealActiveCard, setRevealActiveCard] = useState(0);
  useEffect(() => {
    if (state.turn.effect && state.turn.effect.actionChanged) {
      if (
        state.turn.effect.action === 'choose-two' ||
        state.turn.effect.action === 'choose-discard'
      ) {
        setRevealActiveCard(0);
      }
    }
  }, [state.turn.effect]);

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
        (state.turn.effect.action === 'choose-hand' &&
        !state.turn.effect.purpose.includes('Discard') ? (
          // CHOOSE HAND (NOT DISCARD)
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
          state.turn.effect.active.num.length >= 2 ? (
          // PICK FROM HAND
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
        ) : state.turn.effect.action === 'choose-other-hand-show' &&
          state.turn.effect.active &&
          state.turn.effect.active.num &&
          state.turn.effect.active.num.length === 2 &&
          (!state.turn.effect.activeCardVisible[state.playerNum] ||
            state.turn.effect.active.card) ? (
          // PEEK AND PICK
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
              {!state.turn.effect.active.card
                ? Array.from(Array(state.turn.effect.active.num[1]), (_, i) => (
                    <img
                      key={i}
                      src='https://jingxianlau.github.io/here-to-slay/assets/back/back-creme.png'
                      alt='card'
                      className={`small-md ${
                        state.turn.effect?.choice &&
                        state.turn.effect.choice[0] === i
                          ? 'chosen'
                          : ''
                      }`}
                    />
                  ))
                : state.turn.effect.active.card.map((val, i) => (
                    <>
                      <img
                        key={val.id}
                        src={getImage(val)}
                        alt={val.name}
                        onClick={() => {
                          if (
                            state.turn.effect?.players.some(
                              val => val === state.playerNum
                            ) &&
                            state.turn.effect.val.max &&
                            (mode.val !== 'touch' ||
                              shownCard.val?.id === val.id)
                          ) {
                            socket.emit(
                              'use-effect',
                              roomId,
                              userId,
                              state.turn.effect.card,
                              i
                            );
                          }
                        }}
                        onMouseEnter={() => {
                          shownCard.set(val);
                          shownCard.setPos('top');
                        }}
                        onMouseLeave={() => {
                          shownCard.set(null);
                          shownCard.set(null);
                        }}
                        className={`small-md ${
                          state.turn.effect?.players.some(
                            val => val === state.playerNum
                          ) && state.turn.effect.val.max
                            ? 'active'
                            : state.turn.effect?.choice &&
                              state.turn.effect.choice[0] === i
                            ? 'chosen'
                            : ''
                        }`}
                      />
                    </>
                  ))}
            </div>
          </div>
        ) : state.turn.effect.action === 'choose-cards' &&
          state.turn.effect.active &&
          state.turn.effect.active.num &&
          state.turn.effect.active.num.length === 2 &&
          (!state.turn.effect.activeCardVisible[state.playerNum] ||
            state.turn.effect.active.card) ? (
          // CHOOSE CARDS
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

            <div
              className={`bottom${
                state.turn.effect.active.num[1] *
                  ((19 / 100) * window.innerHeight) >
                window.innerWidth
                  ? ' cover'
                  : ' list'
              }`}
              style={{
                bottom: '1vh'
              }}
            >
              {!state.turn.effect.active.card
                ? Array.from(Array(state.turn.effect.active.num[1]), (_, i) => (
                    <img
                      key={i}
                      src='https://jingxianlau.github.io/here-to-slay/assets/back/back-creme.png'
                      alt='card'
                      className={`small-md ${
                        state.turn.effect &&
                        state.turn.effect.choice &&
                        state.turn.effect.choice.length > 0 &&
                        typeof state.turn.effect.choice[0] === 'number' &&
                        state.turn.effect.choice[0] === i
                          ? 'chosen'
                          : ''
                      }`}
                    />
                  ))
                : state.turn.effect.active.card.map((val, i) => (
                    <img
                      key={val.id}
                      src={getImage(val)}
                      alt={val.name}
                      onMouseEnter={() => {
                        shownCard.set(val);
                        shownCard.setPos('top');
                      }}
                      onMouseLeave={() => {
                        shownCard.set(null);
                        shownCard.setPos(null);
                      }}
                      onClick={
                        state.turn.effect?.players.some(
                          val => val === state.playerNum
                        ) &&
                        (mode.val !== 'touch' || shownCard.val?.id === val.id)
                          ? () => {
                              chosenCard.set(val);
                              chosenCard.setShow(true);
                            }
                          : () => {}
                      }
                      className={`small-md  ${
                        state.turn.effect?.players.some(
                          val => val === state.playerNum
                        )
                          ? 'active'
                          : state.turn.effect &&
                            state.turn.effect.choice &&
                            state.turn.effect.choice.length > 0 &&
                            ((typeof state.turn.effect.choice[0] !== 'number' &&
                              state.turn.effect.choice[0].id === val.id) ||
                              (typeof state.turn.effect.choice[0] ===
                                'number' &&
                                state.turn.effect.choice[0] === i))
                          ? 'chosen'
                          : ''
                      }`}
                    />
                  ))}
            </div>
          </div>
        ) : state.turn.effect.action === 'choose-two' &&
          state.turn.effect.active &&
          ((state.turn.effect.active.num &&
            state.turn.effect.active.card &&
            state.turn.effect.active.num.length ===
              state.turn.effect.active.card.length &&
            state.turn.effect.active.card.length > 0) ||
            state.turn.player !== state.playerNum) ? (
          // CHOOSE CARD(S) TO REVEAL/PLAY/ETC
          <div className='choose-cover' style={{ justifyContent: 'center' }}>
            {state.turn.player === state.playerNum &&
            state.turn.effect.active.num &&
            state.turn.effect.active.num[revealActiveCard] ? (
              <div
                className='left active'
                onClick={() => {
                  socket.emit(
                    'use-effect',
                    roomId,
                    userId,
                    state.turn.effect?.card,
                    revealActiveCard
                  );
                }}
              >
                {state.turn.effect.purpose.split(' ')[0]}
              </div>
            ) : (
              state.turn.player === state.playerNum && (
                <div className='left inactive' style={{ opacity: 0 }}></div>
              )
            )}

            <div
              className={`arrow ${
                state.turn.player === state.playerNum &&
                state.turn.effect &&
                state.turn.effect.active &&
                state.turn.effect.active.card &&
                revealActiveCard !== 0
                  ? 'active'
                  : 'inactive'
              }`}
              onClick={() => {
                if (
                  state.turn.player === state.playerNum &&
                  state.turn.effect &&
                  state.turn.effect.active &&
                  state.turn.effect.active.card &&
                  revealActiveCard !== 0
                ) {
                  setRevealActiveCard(val => --val);
                }
              }}
            >
              <span className='material-symbols-outlined icon'>
                chevron_left
              </span>
            </div>

            {state.turn.effect.active && state.turn.effect.active.card ? (
              <div className='img-container center'>
                <img
                  src={getImage(
                    state.turn.effect.active.card[revealActiveCard]
                  )}
                  alt={state.turn.effect.active.card[revealActiveCard].name}
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

            <div
              className={`arrow ${
                state.turn.player === state.playerNum &&
                state.turn.effect &&
                state.turn.effect.active &&
                state.turn.effect.active.card &&
                state.turn.effect.active.card.length !== revealActiveCard + 1
                  ? 'active'
                  : 'inactive'
              }`}
              onClick={() => {
                if (
                  state.turn.player === state.playerNum &&
                  state.turn.effect &&
                  state.turn.effect.active &&
                  state.turn.effect.active.card &&
                  state.turn.effect.active.card.length !== revealActiveCard + 1
                ) {
                  setRevealActiveCard(val => ++val);
                }
              }}
            >
              <span className='material-symbols-outlined icon'>
                chevron_right
              </span>
            </div>

            {state.turn.player === state.playerNum &&
            state.turn.effect.active.num &&
            state.turn.effect.active.card?.length === revealActiveCard + 1 ? (
              <div
                className='right active'
                onClick={() => {
                  if (
                    revealActiveCard + 1 ===
                    state.turn.effect?.active?.card?.length
                  ) {
                    socket.emit(
                      'use-effect',
                      roomId,
                      userId,
                      state.turn.effect?.card,
                      -1
                    );
                  } else {
                    setRevealActiveCard(val => ++val);
                  }
                }}
              >
                {state.turn.effect.purpose.split(' ')[1]}
              </div>
            ) : (
              state.turn.player === state.playerNum && (
                <div
                  className='right inactive'
                  onClick={() => {}}
                  style={{ opacity: 0 }}
                ></div>
              )
            )}
          </div>
        ) : state.turn.effect.action === 'reveal' &&
          state.turn.effect.active &&
          state.turn.effect.active.card &&
          state.turn.effect.active.card.length === 1 ? (
          // REVEAL CARD
          <div className='choose-cover'>
            <div
              className='left inactive'
              onClick={() => {}}
              style={{ opacity: 0 }}
            ></div>

            <div className='center'>
              <h1
                style={
                  !state.turn.effect.players.some(
                    val => val === state.playerNum
                  )
                    ? {
                        marginTop: '-10vh',
                        marginBottom: '0.6vh',
                        marginRight: '0.8vh'
                      }
                    : {
                        marginTop: '-10vh',
                        marginBottom: '0.6vh',
                        marginRight: 0
                      }
                }
              >
                {!state.turn.effect.players.some(val => val === state.playerNum)
                  ? '...Waiting'
                  : 'Revealed'}
              </h1>
              <div className='img-container center'>
                <img
                  src={getImage(state.turn.effect.active.card[0])}
                  alt={state.turn.effect.active.card[0].name}
                  className='small-xl'
                  draggable='false'
                />
              </div>
            </div>

            {state.turn.effect.players.some(val => val === state.playerNum) ? (
              <div
                className='right active'
                onClick={() => {
                  socket.emit(
                    'use-effect',
                    roomId,
                    userId,
                    state.turn.effect?.card
                  );
                }}
              >
                Next
              </div>
            ) : (
              <div
                className='right inactive'
                onClick={() => {}}
                style={{ opacity: 0 }}
              ></div>
            )}
          </div>
        ) : state.turn.effect.action === 'choose-discard' ? (
          <div className='choose-cover' style={{ justifyContent: 'center' }}>
            {state.turn.player === state.playerNum &&
            state.turn.effect.allowedCards &&
            state.mainDeck.discardPile.slice().reverse()[revealActiveCard]
              .type === state.turn.effect.allowedCards[0] ? (
              <div
                className='left active'
                onClick={() => {
                  socket.emit(
                    'use-effect',
                    roomId,
                    userId,
                    state.turn.effect?.card,
                    state.mainDeck.discardPile.slice().reverse()[
                      revealActiveCard
                    ]
                  );
                }}
              >
                {state.turn.effect.purpose.split(' ')[0]}
              </div>
            ) : (
              state.turn.player === state.playerNum && (
                <div
                  className='left inactive'
                  onClick={() => {}}
                  style={{ opacity: 0 }}
                ></div>
              )
            )}

            <div
              className={`arrow ${
                !state.turn.effect.choice && revealActiveCard !== 0
                  ? 'active'
                  : 'inactive'
              }`}
              onClick={() => {
                if (!state.turn.effect?.choice && revealActiveCard !== 0) {
                  setRevealActiveCard(val => --val);
                }
              }}
            >
              <span className='material-symbols-outlined icon'>
                chevron_left
              </span>
            </div>

            <div className='center'>
              <h1
                style={{
                  marginTop: '-9vh',
                  marginBottom: '0.2vh',
                  marginRight: '0.8vh'
                }}
              >
                {state.turn.effect.choice
                  ? 'Chosen Card'
                  : state.turn.effect.purpose}
              </h1>
              <div className='img-container'>
                {state.turn.effect.choice &&
                typeof state.turn.effect.choice[0] !== 'number' ? (
                  <img
                    src={getImage(state.turn.effect.choice[0])}
                    alt={state.turn.effect.choice[0].name}
                    className='small-xl'
                    draggable='false'
                  />
                ) : (
                  <img
                    src={getImage(
                      state.mainDeck.discardPile.slice().reverse()[
                        revealActiveCard
                      ]
                    )}
                    alt={
                      state.mainDeck.discardPile.slice().reverse()[
                        revealActiveCard
                      ].name
                    }
                    className='small-xl'
                    draggable='false'
                  />
                )}
              </div>
            </div>

            <div
              className={`arrow ${
                !state.turn.effect.choice &&
                state.mainDeck.discardPile.length !== revealActiveCard + 1
                  ? 'active'
                  : 'inactive'
              }`}
              onClick={() => {
                if (
                  !state.turn.effect?.choice &&
                  state.mainDeck.discardPile.length !== revealActiveCard + 1
                ) {
                  setRevealActiveCard(val => ++val);
                }
              }}
            >
              <span className='material-symbols-outlined icon'>
                chevron_right
              </span>
            </div>

            {state.turn.player === state.playerNum && (
              <div className='right inactive' style={{ opacity: 0 }}></div>
            )}
          </div>
        ) : (
          <></>
        ))}
    </div>
  );
};

export default EffectPopup;
