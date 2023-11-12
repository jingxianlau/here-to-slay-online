import React, { useEffect, useState } from 'react';
import { CardType, GameState, ModifierCard } from '../types';
import { Socket } from 'socket.io-client';
import { getImage } from '../helpers/getImage';
import Dice from './Dice';
import useClientContext from '../hooks/useClientContext';
import { showText } from '../helpers/showText';
import ChooseModify from './ChooseModify';

const Popup: React.FC<{
  socket: Socket;
  activeDice: 0 | 1;
  setActiveDice: React.Dispatch<React.SetStateAction<0 | 1>>;
}> = ({ socket, activeDice, setActiveDice }) => {
  const {
    state: { val: state },
    credentials: { roomId, userId },
    allowedCards,
    showPopup,
    showRoll,
    hasRolled,
    showHelperText,
    shownCard,
    showHand
  } = useClientContext();

  const [activeModifier, setActiveModifier] = useState(0);
  const [modifiers, setModifiers] = useState<ModifierCard[]>([]);
  const [show, setShow] = useState(false);

  const preppedCard = state.mainDeck.preparedCard;

  useEffect(() => {
    if (!state.dice.defend) return;
    if (activeDice === 0) {
      setModifiers(state.dice.main.modifier);
      setActiveModifier(state.dice.main.modifier.length - 1);
    } else {
      setModifiers(state.dice.defend.modifier);
      setActiveModifier(state.dice.defend.modifier.length - 1);
    }
  }, [activeDice, state.dice.main.modifier, state.dice.defend?.modifier]);

  useEffect(() => {
    if (shownCard.val && shownCard.val.type === CardType.modifier) {
      if (shownCard.val.modifier.length === 2) {
        setShow(true);
      } else {
        socket.emit(
          'modify-roll',
          roomId,
          userId,
          {
            modifier: shownCard.val,
            effect: 0,
            dice: activeDice
          },
          true
        );
        shownCard.set(null);
        showHand.setLocked(false);
      }
    } else {
      setShow(false);
      showHand.setLocked(false);
    }
  }, [shownCard.val]);

  useEffect(() => {
    if (showPopup.val) {
      if (state.turn.phase === 'challenge') {
        if (state.mainDeck.preparedCard?.successful) {
          allowedCards.set([]);
          showText(showHelperText, 'Card Success', 500);
        } else {
          if (
            state.turn.player === state.playerNum ||
            state.match.isReady[state.playerNum] != null
          ) {
            allowedCards.set([]);
          } else {
            allowedCards.set([CardType.challenge]);
          }

          if (state.turn.phaseChanged) {
            showText(showHelperText, 'Challenge');
          }
        }
      } else if (state.turn.phase === 'challenge-roll') {
        allowedCards.set([]);

        if (state.turn.phaseChanged) {
          showText(showHelperText, 'Roll');
        }
      } else if (state.turn.phase === 'modify') {
        allowedCards.set([CardType.modifier]);
        showRoll.set(false);

        if (state.turn.phaseChanged) {
          showText(showHelperText, 'Modify');
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    showPopup.val,
    state.mainDeck.preparedCard?.successful,
    state.turn.phase
  ]);

  function roll() {
    if (
      !state ||
      !socket ||
      hasRolled.val ||
      (!state.dice.main.total &&
        activeDice === 0 &&
        state.turn.challenger !== state.playerNum) ||
      (state.dice.main.total &&
        activeDice === 1 &&
        state.turn.player !== state.playerNum)
    )
      return;

    socket.emit('challenge-roll', roomId, userId);
    hasRolled.set(true);
  }

  return (
    <div className={'popup'} style={{ opacity: showPopup.val ? 1 : 0 }}>
      {preppedCard &&
        (state.turn.phase === 'challenge' ? (
          <div className='challenge-popup'>
            <div className='img-container left'>
              <img
                src={getImage(preppedCard.card)}
                alt={preppedCard.card.name}
                className='small-lg'
                draggable='false'
              />
            </div>
            <div
              className={`img-container ${
                state.turn.player === state.playerNum ||
                state.match.isReady[state.playerNum] != null
                  ? ''
                  : 'cross'
              }`}
              onClick={() => {
                if (state.match.isReady[state.playerNum] == null) {
                  socket.emit('challenge', roomId, userId, false);
                  allowedCards.set([]);
                }
              }}
            >
              <img
                src='./assets/challenge/challenge.png'
                alt='challenge'
                className='small-md center-img'
                draggable='false'
              />
            </div>
            <div
              className='side-list'
              style={{ height: `${state.match.isReady.length * 5}vh` }}
            >
              {state.match.isReady.map((val, i) => {
                return i !== state.turn.player ? (
                  <div key={i}>
                    <span className='name'>{state.match.players[i]}: </span>
                    <span className='res'>
                      {val === null ? (
                        '(Waiting...)'
                      ) : (
                        <div className={val ? 'tick' : 'cross'}></div>
                      )}
                    </span>
                  </div>
                ) : (
                  <React.Fragment key={i}></React.Fragment>
                );
              })}
            </div>
          </div>
        ) : state.turn.phase === 'challenge-roll' ||
          state.turn.phase === 'modify' ? (
          state.turn.challenger && (
            <>
              <div className='challenge-roll-popup'>
                <div className='img-container left'>
                  <img
                    src={getImage(preppedCard.card)}
                    alt={preppedCard.card.name}
                    className='small-lg'
                    draggable='false'
                  />
                </div>

                <div className='dice-box'>
                  {state.turn.phase === 'modify' && (
                    <div className='cancel-container'>
                      <div
                        className='cancel-button'
                        onClick={() =>
                          socket.emit(
                            'modify-dice',
                            roomId,
                            userId,
                            null,
                            false
                          )
                        }
                      >
                        <div className='button'></div>
                      </div>
                      <h5>Don't Modify</h5>
                    </div>
                  )}
                  <img
                    src={
                      activeDice === 0
                        ? './assets/sword.png'
                        : './assets/shield.png'
                    }
                    alt={''}
                  />
                  <div className='arrows'>
                    <span
                      className={`material-symbols-outlined${
                        activeDice === 1 &&
                        state.dice.defend &&
                        (!state.turn.isRolling ||
                          (!state.dice.defend?.total &&
                            !hasRolled.val &&
                            showRoll.val) ||
                          (state.dice.defend?.total &&
                            !hasRolled.val &&
                            !showRoll.val))
                          ? ' show'
                          : ' hide'
                      }`}
                      onClick={() => {
                        if (
                          activeDice === 1 &&
                          state.dice.defend &&
                          (!state.turn.isRolling ||
                            (!state.dice.defend?.total &&
                              !hasRolled.val &&
                              showRoll.val) ||
                            (state.dice.defend?.total &&
                              !hasRolled.val &&
                              !showRoll.val))
                        ) {
                          setActiveDice(0);
                        }
                      }}
                    >
                      chevron_left
                    </span>
                    <span
                      className='name'
                      style={{
                        color:
                          state.turn.phase === 'challenge-roll' &&
                          (((!state.dice.main.total || hasRolled.val) &&
                            activeDice === 0 &&
                            state.turn.challenger === state.playerNum) ||
                            (state.dice.main.total &&
                              activeDice === 1 &&
                              state.turn.player === state.playerNum))
                            ? '#fc7c37'
                            : 'white'
                      }}
                    >
                      {activeDice === 0
                        ? state.match.players[state.turn.challenger]
                        : state.match.players[state.turn.player]}
                    </span>
                    <span
                      className={`material-symbols-outlined${
                        activeDice === 0 &&
                        state.dice.defend &&
                        (!state.turn.isRolling ||
                          (!state.dice.defend?.total &&
                            !hasRolled.val &&
                            showRoll.val) ||
                          (state.dice.defend?.total &&
                            !hasRolled.val &&
                            !showRoll.val))
                          ? ' show'
                          : ' hide'
                      }`}
                      onClick={() => {
                        if (
                          activeDice === 0 &&
                          state.dice.defend &&
                          (!state.turn.isRolling ||
                            (!state.dice.defend?.total &&
                              !hasRolled.val &&
                              showRoll.val) ||
                            (state.dice.defend?.total &&
                              !hasRolled.val &&
                              !showRoll.val))
                        ) {
                          setActiveDice(1);
                        }
                      }}
                    >
                      chevron_right
                    </span>
                  </div>
                  <div
                    onClick={
                      state.turn.isRolling &&
                      state.turn.phase === 'challenge-roll' &&
                      ((!state.dice.main.total &&
                        activeDice === 0 &&
                        state.turn.challenger === state.playerNum) ||
                        (state.dice.main.total &&
                          activeDice === 1 &&
                          state.turn.player === state.playerNum))
                        ? roll
                        : () => {}
                    }
                    className={`challenge-dice ${
                      state.turn.phase === 'challenge-roll' &&
                      ((!state.dice.main.total &&
                        activeDice === 0 &&
                        state.turn.challenger === state.playerNum) ||
                        (state.dice.main.total &&
                          activeDice === 1 &&
                          state.turn.player === state.playerNum))
                        ? 'active'
                        : ''
                    }`}
                  >
                    {activeDice === 0 ? (
                      <div className='dices'>
                        <Dice
                          roll1={state.dice.main.roll[0]}
                          roll2={state.dice.main.roll[1]}
                        />
                      </div>
                    ) : (
                      state.dice.defend && (
                        <div className='dices'>
                          <Dice
                            roll1={state.dice.defend.roll[0]}
                            roll2={state.dice.defend.roll[1]}
                          />
                        </div>
                      )
                    )}
                  </div>
                  <h1
                    style={{
                      color:
                        state.dice.defend &&
                        state.dice.defend.total > 0 &&
                        ((activeDice === 0 &&
                          state.dice.main.total >= state.dice.defend.total &&
                          state.dice.main.modifier.length === 0) ||
                          (activeDice === 1 &&
                            state.dice.defend.total > state.dice.main.total &&
                            state.dice.defend.modifier.length === 0))
                          ? '#fc7c37'
                          : 'white'
                    }}
                  >
                    {/* Very readable conditional (good luck deciphering this) */}
                    {(state.dice.main.total > 0 &&
                      state.dice.defend?.total === 0 &&
                      showRoll.val &&
                      activeDice === 0) ||
                    (state.dice.defend &&
                      state.dice.defend.total > 0 &&
                      activeDice === 0) ||
                    (state.turn.phase === 'modify' && activeDice === 0)
                      ? state.dice.main.roll[0] + state.dice.main.roll[1]
                      : (state.dice.defend &&
                          activeDice === 1 &&
                          state.dice.defend.total > 0 &&
                          showRoll.val) ||
                        (state.turn.phase === 'modify' &&
                          state.dice.defend &&
                          activeDice === 1)
                      ? state.dice.defend.roll[0] + state.dice.defend.roll[1]
                      : ''}
                  </h1>
                  <h2>
                    {state.turn.phase === 'modify' &&
                      state.dice.defend &&
                      (activeDice === 0
                        ? state.dice.main.modValues.map(val => (
                            <>
                              <span
                                style={{
                                  color: val > 0 ? '#2eee9b' : '#f95151'
                                }}
                              >
                                {val > 0 ? `+${val}` : val}
                              </span>{' '}
                            </>
                          ))
                        : state.dice.defend.modValues.map(val => (
                            <>
                              <span
                                style={{
                                  color: val > 0 ? '#2eee9b' : '#f95151'
                                }}
                              >
                                {val > 0 ? `+${val}` : val}
                              </span>{' '}
                            </>
                          )))}
                  </h2>
                  <h3
                    style={{
                      color:
                        state.dice.defend &&
                        ((activeDice === 0 &&
                          state.dice.main.total >= state.dice.defend.total) ||
                          (activeDice === 1 &&
                            state.dice.defend.total > state.dice.main.total))
                          ? '#fc7c37'
                          : 'white'
                    }}
                  >
                    {state.turn.phase === 'modify' &&
                      (activeDice === 0 && state.dice.main.modifier.length > 0
                        ? state.dice.main.total
                        : activeDice === 1 &&
                          state.dice.defend &&
                          state.dice.defend.modifier.length > 0
                        ? state.dice.defend.total
                        : '')}
                  </h3>
                </div>

                <div className='side-modifier'>
                  {state.turn.phase === 'modify' && modifiers.length ? (
                    <div className='has-modifier'>
                      <h3>
                        {
                          state.match.players[
                            modifiers[activeModifier].player as number
                          ]
                        }
                      </h3>
                      <div className='img-container'>
                        <img
                          src={getImage(modifiers[activeModifier])}
                          alt={modifiers[activeModifier].name}
                          className='small-lg'
                          draggable='false'
                        />
                      </div>
                      <div className='arrows'>
                        <span
                          className={`material-symbols-outlined ${
                            (activeDice === 0 && activeModifier >= 1) ||
                            (activeDice === 1 &&
                              state.dice.defend &&
                              activeModifier >= 1)
                              ? 'show'
                              : 'hide'
                          }`}
                          onClick={() => {
                            if (
                              (activeDice === 0 && activeModifier >= 1) ||
                              (activeDice === 1 &&
                                state.dice.defend &&
                                activeModifier >= 1)
                            ) {
                              setActiveModifier(activeModifier - 1);
                            }
                          }}
                        >
                          chevron_left
                        </span>
                        <span
                          className='name'
                          style={{
                            fontSize: '5vh',
                            color:
                              activeDice === 0
                                ? state.dice.main.modValues[activeModifier] > 0
                                  ? '#2eee9b'
                                  : '#f95151'
                                : state.dice.defend &&
                                  state.dice.defend.modValues[activeModifier] >
                                    0
                                ? '#2eee9b'
                                : '#f95151'
                          }}
                        >
                          {activeDice === 0
                            ? state.dice.main.modValues[activeModifier] > 0 &&
                              '+'
                            : (state.dice.defend as GameState['dice']['main'])
                                .modValues[activeModifier] > 0 && '+'}
                          {activeDice === 0
                            ? state.dice.main.modValues[activeModifier]
                            : state.dice.defend?.modValues[activeModifier]}
                        </span>
                        <span
                          className={`material-symbols-outlined ${
                            (activeDice === 0 &&
                              activeModifier <
                                state.dice.main.modifier.length - 1) ||
                            (activeDice === 1 &&
                              state.dice.defend &&
                              activeModifier <
                                state.dice.defend.modifier.length - 1)
                              ? 'show'
                              : 'hide'
                          }`}
                          onClick={() => {
                            if (
                              (activeDice === 0 &&
                                activeModifier <
                                  state.dice.main.modifier.length - 1) ||
                              (activeDice === 1 &&
                                state.dice.defend &&
                                activeModifier <
                                  state.dice.defend.modifier.length - 1)
                            ) {
                              setActiveModifier(activeModifier + 1);
                            }
                          }}
                        >
                          chevron_right
                        </span>
                      </div>
                    </div>
                  ) : (
                    <h3 style={{ color: '#aaa' }}>No Modifiers</h3>
                  )}
                </div>
              </div>
              <ChooseModify
                socket={socket}
                dice={activeDice}
                card={shownCard.val as ModifierCard}
                show={show}
                setShow={setShow}
              />
            </>
          )
        ) : (
          <></>
        ))}
    </div>
  );
};

export default Popup;
