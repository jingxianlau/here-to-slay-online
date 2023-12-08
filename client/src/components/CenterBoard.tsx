import React from 'react';
import { getImage } from '../helpers/getImage';
import { Socket } from 'socket.io-client';
import useClientContext from '../hooks/useClientContext';
import { popupHand } from '../helpers/popupHand';
import { meetsRequirements } from '../helpers/meetsRequirements';
import { MonsterCard } from '../types';

interface CenterBoardProps {
  socket: Socket;
  setShowDiscardPile: React.Dispatch<React.SetStateAction<boolean>>;
}

const CenterBoard: React.FC<CenterBoardProps> = ({
  socket,
  setShowDiscardPile
}) => {
  const {
    state: { val: state },
    credentials,
    showHand,
    shownCard,
    chosenCard
  } = useClientContext();

  function drawTwo() {
    if (
      state.turn.phase !== 'draw' ||
      state.turn.player !== state.playerNum ||
      state.turn.pause
    )
      return;

    socket.emit('draw-two', credentials.roomId, credentials.userId);
    popupHand(showHand);
  }
  function drawOne() {
    if (
      state.turn.phase !== 'play' ||
      state.turn.player !== state.playerNum ||
      state.turn.pause
    )
      return;

    chosenCard.setShow(true);
    chosenCard.setCustomText('Draw');
    chosenCard.setCustomCenter(
      'https://jingxianlau.github.io/here-to-slay/assets/back/back-creme.png'
    );
  }
  function drawEffect() {
    if (state.turn.effect) {
      socket.emit(
        'use-effect',
        credentials.roomId,
        credentials.userId,
        state.turn.effect.card
      );
    }
  }
  function attackMonster(card: MonsterCard) {
    if (
      state.turn.phase === 'play' &&
      state.turn.player === state.playerNum &&
      !state.turn.pause &&
      meetsRequirements(card, state) &&
      state.turn.movesLeft >= 2
    ) {
      chosenCard.set(card);
      chosenCard.setShow(true);
      chosenCard.setCustomText('Attack');
    }
  }

  return (
    <>
      <h1
        className={`purpose ${
          state.turn.phase === 'use-effect' &&
          state.turn.effect &&
          (state.turn.effect.action === 'choose-boards' ||
            state.turn.effect.action === 'choose-own-board' ||
            state.turn.effect.action === 'choose-other-boards' ||
            state.turn.effect.action === 'choose-player' ||
            state.turn.effect.action === 'none')
            ? 'show'
            : 'hide'
        }`}
      >
        {state.turn.effect && state.turn.effect.purpose}
      </h1>

      <div
        className={`mat ${
          state.turn.phase === 'use-effect' &&
          state.turn.effect &&
          (state.turn.effect.action === 'choose-boards' ||
            state.turn.effect.action === 'choose-own-board' ||
            state.turn.effect.action === 'choose-other-boards' ||
            state.turn.effect.action === 'choose-player' ||
            state.turn.effect.action === 'none')
            ? 'hide'
            : 'show'
        }`}
      >
        <div className='background'></div>
        <div className='cards'>
          {state.mainDeck.monsters.map(card => (
            <div
              className='large'
              key={card.id}
              onMouseEnter={() => {
                if (!shownCard.locked) {
                  shownCard.set(card);
                  shownCard.setPos('left');
                }
              }}
              onMouseLeave={() => {
                if (!shownCard.locked) {
                  shownCard.set(null);
                  shownCard.setPos(null);
                }
              }}
              onClick={() => attackMonster(card)}
              style={{
                cursor:
                  state.turn.phase === 'play' &&
                  state.turn.player === state.playerNum &&
                  !state.turn.pause
                    ? meetsRequirements(card, state) &&
                      state.turn.movesLeft >= 2
                      ? 'pointer'
                      : 'not-allowed'
                    : 'default'
              }}
            >
              <img
                src={getImage(card)}
                alt={card.name}
                className='large-card'
                draggable='false'
                style={{
                  filter:
                    state.turn.phase === 'choose-hero' &&
                    state.turn.player === state.playerNum
                      ? 'brightness(35%)'
                      : 'none'
                }}
              />
            </div>
          ))}
          {Array.from(Array(3 - state.mainDeck.monsters.length), (_, i) => (
            <div className='large' key={i}></div>
          ))}

          <div className='small-cards'>
            <div className='small deck'>
              <img
                src='https://jingxianlau.github.io/here-to-slay/assets/back/back-creme.png'
                alt='flipped card'
                className={`small-card ${
                  (state.turn.phase === 'draw' &&
                    state.turn.player === state.playerNum) ||
                  (state.turn.phase === 'use-effect' &&
                    state.turn.effect &&
                    state.turn.effect.action === 'draw' &&
                    state.turn.effect.players.some(
                      val => val === state.playerNum
                    ))
                    ? 'glow click'
                    : state.turn.player === state.playerNum &&
                      state.turn.phase === 'play'
                    ? 'click'
                    : ''
                }`}
                onClick={
                  state.turn.phase === 'draw'
                    ? drawTwo
                    : state.turn.phase === 'play'
                    ? drawOne
                    : state.turn.phase === 'use-effect' &&
                      state.turn.effect &&
                      state.turn.effect.action === 'draw'
                    ? drawEffect
                    : () => {}
                }
                draggable='false'
                style={{
                  filter:
                    state.turn.phase === 'choose-hero' &&
                    state.turn.player === state.playerNum
                      ? 'brightness(35%)'
                      : 'none'
                }}
              />
            </div>
            <div className='small discard'>
              {state.mainDeck.discardPile.length > 0 && (
                <img
                  src={getImage(
                    state.mainDeck.discardPile[
                      state.mainDeck.discardPile.length - 1
                    ]
                  )}
                  alt={
                    state.mainDeck.discardPile[
                      state.mainDeck.discardPile.length - 1
                    ].name
                  }
                  onMouseEnter={() => {
                    if (!shownCard.locked) {
                      shownCard.set(
                        state.mainDeck.discardPile[
                          state.mainDeck.discardPile.length - 1
                        ]
                      );
                      shownCard.setPos('left');
                    }
                  }}
                  onMouseLeave={() => {
                    if (!shownCard.locked) {
                      shownCard.set(null);
                      shownCard.setPos(null);
                    }
                  }}
                  className='small-card click'
                  onClick={() => {
                    setShowDiscardPile(true);
                  }}
                  draggable='false'
                  style={{
                    filter:
                      state.turn.phase === 'choose-hero' &&
                      state.turn.player === state.playerNum
                        ? 'brightness(35%)'
                        : 'none'
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CenterBoard;
