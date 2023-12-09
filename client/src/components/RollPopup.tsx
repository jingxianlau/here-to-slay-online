import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import useClientContext from '../hooks/useClientContext';
import { getImage } from '../helpers/getImage';
import { CardType, ModifierCard } from '../types';
import Dice from './Dice';
import { showText } from '../helpers/showText';
import ChooseModify from './ChooseModify';
import { meetsRollRequirements } from '../helpers/meetsRequirements';

interface RollPopupProps {
  socket: Socket;
  showBoard: boolean;
}

const RollPopup: React.FC<RollPopupProps> = ({ socket, showBoard }) => {
  const {
    state: { val: state },
    credentials: { userId, roomId },
    allowedCards,
    hasRolled,
    showRoll,
    showHelperText,
    chosenCard
  } = useClientContext();

  const [activeModifier, setActiveModifier] = useState(0);
  const [modifiers, setModifiers] = useState<ModifierCard[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (state.turn.phase === 'modify' && state.turn.challenger === undefined) {
      setModifiers(state.dice.main.modifier);
      setActiveModifier(state.dice.main.modifier.length - 1);
    }
  }, [state.dice.main.modifier]);

  useEffect(() => {
    if (
      chosenCard.val &&
      chosenCard.val.type === CardType.modifier &&
      !showBoard
    ) {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [chosenCard.val]);

  useEffect(() => {
    if (
      state.turn.phase === 'use-effect-roll' ||
      state.turn.phase === 'attack-roll'
    ) {
      allowedCards.set([]);

      if (state.turn.phaseChanged) {
        showText(showHelperText, 'Roll');
      }
    } else if (
      state.turn.phase === 'modify' &&
      state.turn.challenger === undefined
    ) {
      showRoll.set(false);

      if (state.turn.phaseChanged) {
        showText(showHelperText, 'Modify');
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.mainDeck.preparedCard?.successful, state.turn.phase]);

  function roll() {
    if (
      !state ||
      !socket ||
      hasRolled.val ||
      state.dice.main.total !== 0 ||
      state.turn.player !== state.playerNum
    )
      return;

    if (state.mainDeck.preparedCard?.card.type === CardType.hero) {
      socket.emit(
        'use-effect-roll',
        roomId,
        userId,
        state.mainDeck.preparedCard.card
      );
    } else if (state.mainDeck.preparedCard?.card.type === CardType.large) {
      socket.emit(
        'attack-roll',
        roomId,
        userId,
        state.mainDeck.preparedCard.card
      );
    }
    hasRolled.set(true);
  }

  return (
    <>
      {state.mainDeck.preparedCard &&
        (state.mainDeck.preparedCard.card.type === CardType.hero ||
          state.mainDeck.preparedCard.card.type === CardType.large) && (
          <div
            className={`popup ${
              state.turn.challenger === undefined &&
              (state.turn.phase === 'use-effect-roll' ||
                state.turn.phase === 'attack-roll' ||
                state.turn.phase === 'modify')
                ? 'show'
                : 'hide'
            }`}
            style={{
              top: showBoard ? '-79vh' : '9.5vh'
            }}
          >
            {(state.turn.phase === 'use-effect-roll' ||
              state.turn.phase === 'attack-roll' ||
              state.turn.phase === 'modify') &&
              state.turn.challenger === undefined && (
                <>
                  <div className='roll-popup'>
                    <div className='img-container'>
                      <img
                        src={getImage(state.mainDeck.preparedCard.card)}
                        alt={state.mainDeck.preparedCard.card.name}
                        className={
                          state.mainDeck.preparedCard.card.type ===
                          CardType.hero
                            ? 'small-xl'
                            : 'large-lg'
                        }
                        draggable='false'
                      />
                    </div>

                    <div
                      className='dice-box'
                      style={{
                        marginTop:
                          state.turn.phase === 'attack-roll' ||
                          state.turn.phase === 'use-effect-roll'
                            ? '24vh'
                            : 'auto'
                      }}
                    >
                      {state.turn.phase === 'modify' &&
                        (state.match.isReady[state.playerNum] !== false ? (
                          <div className='cancel-container'>
                            <button
                              className='cancel circular danger'
                              onClick={() => {
                                socket.emit(
                                  'modify-roll',
                                  roomId,
                                  userId,
                                  null,
                                  false
                                );
                                allowedCards.set([]);
                              }}
                            >
                              <span className='material-symbols-outlined'>
                                close
                              </span>
                            </button>
                            <h5>Don't Modify</h5>
                          </div>
                        ) : (
                          <div className='cancel-container'>
                            <h2
                              style={{
                                marginTop: '5vh',
                                marginBottom: '1.6vh'
                              }}
                            >
                              ...Waiting for Players
                            </h2>
                            <h5></h5>
                          </div>
                        ))}

                      <span
                        className='name'
                        style={{
                          color:
                            (state.turn.phase === 'use-effect-roll' ||
                              state.turn.phase === 'attack-roll') &&
                            (!state.dice.main.total || hasRolled.val) &&
                            state.turn.player === state.playerNum
                              ? '#fc7c37'
                              : 'white'
                        }}
                      >
                        {state.match.players[state.turn.player]}
                      </span>

                      <div
                        onClick={
                          state.turn.isRolling &&
                          (state.turn.phase === 'use-effect-roll' ||
                            state.turn.phase === 'attack-roll') &&
                          !state.dice.main.total &&
                          state.turn.player === state.playerNum
                            ? roll
                            : () => {}
                        }
                        className={`challenge-dice ${
                          (state.turn.phase === 'use-effect-roll' ||
                            state.turn.phase === 'attack-roll') &&
                          !state.dice.main.total &&
                          state.turn.player === state.playerNum
                            ? 'active'
                            : ''
                        }`}
                        style={{
                          marginTop: '2vh'
                        }}
                      >
                        <div className='dices'>
                          <Dice
                            roll1={state.dice.main.roll[0]}
                            roll2={state.dice.main.roll[1]}
                            total={state.dice.main.total}
                          />
                        </div>
                      </div>
                      <h1
                        style={{
                          color:
                            modifiers.length === 0
                              ? state.mainDeck.preparedCard.card.type ===
                                CardType.hero
                                ? meetsRollRequirements(
                                    'pass',
                                    state.mainDeck.preparedCard.card,
                                    state.dice.main.total
                                  )
                                  ? '#2eee9b'
                                  : '#f95151'
                                : meetsRollRequirements(
                                    'pass',
                                    state.mainDeck.preparedCard.card,
                                    state.dice.main.total
                                  )
                                ? '#2eee9b'
                                : meetsRollRequirements(
                                    'fail',
                                    state.mainDeck.preparedCard.card,
                                    state.dice.main.total
                                  )
                                ? '#f95151'
                                : 'white'
                              : 'white'
                        }}
                      >
                        {(state.dice.main.total > 0 && showRoll.val) ||
                        state.turn.phase === 'modify'
                          ? state.dice.main.roll[0] + state.dice.main.roll[1]
                          : ''}
                      </h1>
                      <h2>
                        {state.turn.phase === 'modify' &&
                          state.dice.main.modValues.map((val, i) => (
                            <React.Fragment key={i}>
                              <span
                                style={{
                                  color: val > 0 ? '#2eee9b' : '#f95151'
                                }}
                              >
                                {val > 0 ? `+${val}` : val}
                              </span>{' '}
                            </React.Fragment>
                          ))}
                      </h2>
                      <h3
                        style={{
                          color:
                            state.mainDeck.preparedCard.card.type ===
                            CardType.hero
                              ? meetsRollRequirements(
                                  'pass',
                                  state.mainDeck.preparedCard.card,
                                  state.dice.main.total
                                )
                                ? '#2eee9b'
                                : '#f95151'
                              : meetsRollRequirements(
                                  'pass',
                                  state.mainDeck.preparedCard.card,
                                  state.dice.main.total
                                )
                              ? '#2eee9b'
                              : meetsRollRequirements(
                                  'fail',
                                  state.mainDeck.preparedCard.card,
                                  state.dice.main.total
                                )
                              ? '#f95151'
                              : 'white'
                        }}
                      >
                        {state.turn.phase === 'modify' &&
                          state.dice.main.modifier.length > 0 &&
                          state.dice.main.total}
                      </h3>
                    </div>

                    <div
                      className='side-modifier'
                      style={{
                        marginLeft: '1.2vh'
                      }}
                    >
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
                              className='small-xl'
                              draggable='false'
                            />
                          </div>
                          <div className='arrows'>
                            <span
                              className={`material-symbols-outlined ${
                                activeModifier >= 1 ? 'show' : 'hide'
                              }`}
                              onClick={() => {
                                if (activeModifier >= 1) {
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
                                  state.dice.main.modValues[activeModifier] > 0
                                    ? '#2eee9b'
                                    : '#f95151'
                              }}
                            >
                              {state.dice.main.modValues[activeModifier] > 0 &&
                                '+'}

                              {state.dice.main.modValues[activeModifier]}
                            </span>
                            <span
                              className={`material-symbols-outlined ${
                                activeModifier <
                                state.dice.main.modifier.length - 1
                                  ? 'show'
                                  : 'hide'
                              }`}
                              onClick={() => {
                                if (
                                  activeModifier <
                                  state.dice.main.modifier.length - 1
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
                    dice={0}
                    card={chosenCard.val as ModifierCard}
                    show={show}
                    setShow={setShow}
                  />
                </>
              )}
          </div>
        )}
    </>
  );
};

export default RollPopup;
