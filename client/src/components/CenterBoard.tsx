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
  const { state, credentials, showHand, shownCard, chosenCard } =
    useClientContext();

  function drawTwo() {
    if (
      state.val.turn.phase !== 'draw' ||
      state.val.turn.player !== state.val.playerNum ||
      state.val.turn.pause
    )
      return;

    socket.emit('draw-two', credentials.roomId, credentials.userId);
    popupHand(showHand);
  }
  function drawOne() {
    if (
      state.val.turn.phase !== 'play' ||
      state.val.turn.player !== state.val.playerNum ||
      state.val.turn.pause
    )
      return;

    chosenCard.setShow(true);
    chosenCard.setCustomText('Draw');
  }
  function drawEffect() {
    if (state.val.turn.effect) {
      socket.emit(
        'use-effect',
        credentials.roomId,
        credentials.userId,
        state.val.turn.effect.card
      );
    }
  }
  function attackMonster(card: MonsterCard) {
    if (
      state.val.turn.phase === 'play' &&
      state.val.turn.player === state.val.playerNum &&
      !state.val.turn.pause &&
      meetsRequirements(card, state.val) &&
      state.val.turn.movesLeft >= 2
    ) {
      chosenCard.set(card);
      chosenCard.setShow(true);
      chosenCard.setCustomText('Attack');
    }
  }

  return (
    <div className='mat'>
      <div className='background'></div>
      <div className='cards'>
        {state.val.mainDeck.monsters.map(card => (
          <div
            className='large'
            key={card.id}
            onMouseEnter={() => {
              shownCard.set(card);
              shownCard.setPos('left');
            }}
            onMouseLeave={() => {
              shownCard.set(null);
              shownCard.setPos(null);
            }}
            onClick={() => attackMonster(card)}
            style={{
              cursor:
                state.val.turn.phase === 'play' &&
                state.val.turn.player === state.val.playerNum &&
                !state.val.turn.pause
                  ? meetsRequirements(card, state.val) &&
                    state.val.turn.movesLeft >= 2
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
            />
          </div>
        ))}
        {Array.from(Array(3 - state.val.mainDeck.monsters.length), (_, i) => (
          <div className='large' key={i}></div>
        ))}

        <div className='small-cards'>
          <div className='small deck'>
            <img
              src='./assets/back/back-creme.png'
              alt='flipped card'
              className={`small-card ${
                (state.val.turn.phase === 'draw' &&
                  state.val.turn.player === state.val.playerNum) ||
                (state.val.turn.phase === 'use-effect' &&
                  state.val.turn.effect &&
                  state.val.turn.effect.action === 'draw' &&
                  state.val.turn.effect.players.some(
                    val => val === state.val.playerNum
                  ))
                  ? 'glow click'
                  : state.val.turn.player === state.val.playerNum &&
                    state.val.turn.phase === 'play'
                  ? 'click'
                  : ''
              }`}
              onClick={
                state.val.turn.phase === 'draw'
                  ? drawTwo
                  : state.val.turn.phase === 'play'
                  ? drawOne
                  : state.val.turn.phase === 'use-effect' &&
                    state.val.turn.effect &&
                    state.val.turn.effect.action === 'draw'
                  ? drawEffect
                  : () => {}
              }
              draggable='false'
            />
          </div>
          <div className='small discard'>
            {state.val.mainDeck.discardPile.length > 0 && (
              <img
                src={getImage(
                  state.val.mainDeck.discardPile[
                    state.val.mainDeck.discardPile.length - 1
                  ]
                )}
                alt={
                  state.val.mainDeck.discardPile[
                    state.val.mainDeck.discardPile.length - 1
                  ].name
                }
                className='small-card click'
                onClick={() => {
                  setShowDiscardPile(true);
                }}
                draggable='false'
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CenterBoard;
