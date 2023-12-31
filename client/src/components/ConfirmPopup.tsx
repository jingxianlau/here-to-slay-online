import React from 'react';
import { Socket } from 'socket.io-client';
import { CardType } from '../types';
import { getImage } from '../helpers/getImage';
import useClientContext from '../hooks/useClientContext';

interface ConfirmCardProps {
  socket: Socket;
}

const ConfirmCard: React.FC<ConfirmCardProps> = ({ socket }) => {
  const {
    credentials: { roomId, userId },
    chosenCard: {
      val: card,
      set: setCard,
      show,
      setShow,
      customText,
      setCustomText,
      customCenter
    },
    shownCard,
    state: { val: state }
  } = useClientContext();

  const playCard = () => {
    if (card && !state.turn.pause) {
      switch (state.turn.phase) {
        case 'play':
          if (
            state.turn.player === state.playerNum &&
            (card.type === CardType.hero ||
              card.type === CardType.item ||
              card.type === CardType.magic) &&
            !state.turn.pause &&
            !state.board[state.playerNum].heroCards.some(
              val => val && val.id === card.id
            ) &&
            (card.type !== CardType.hero ||
              state.board[state.playerNum].heroCards.some(
                val => val === null
              )) &&
            state.turn.movesLeft
          ) {
            socket.emit('prepare-card', roomId, userId, card);
          } else if (
            state.turn.player === state.playerNum &&
            card.type === CardType.hero &&
            state.board[state.playerNum].heroCards.some(
              val => val && val.id === card.id
            ) &&
            (state.turn.movesLeft || card.freeUse) &&
            !card.abilityUsed
          ) {
            socket.emit('use-effect-roll', roomId, userId, card);
          } else if (
            state.turn.player === state.playerNum &&
            card.type === CardType.large &&
            card.player === undefined &&
            state.turn.movesLeft >= 2
          ) {
            socket.emit('attack-roll', roomId, userId, card);
          }
          break;

        case 'choose-hero':
          if (card.type === CardType.hero && !card.item) {
            socket.emit('prepare-card', roomId, userId, card);
          }
          break;

        case 'challenge':
          if (card.type === CardType.challenge && !state.turn.pause) {
            socket.emit('challenge', roomId, userId, true, card.id);
          }
          break;

        case 'use-effect':
          if (
            state.turn.effect &&
            state.turn.effect.players.some(val => val === state.playerNum)
          ) {
            socket.emit(
              'use-effect',
              roomId,
              userId,
              state.turn.effect.card,
              card
            );
          }
          break;

        case 'end-turn-discard':
          if (
            state.turn.player === state.playerNum &&
            state.players[state.turn.player].numCards > 7
          ) {
            socket.emit('end-turn-discard', roomId, userId, card);
            shownCard.set(null);
            shownCard.setPos(null);
          }
          break;
      }

      setShow(false);
      setTimeout(() => {
        setCard(null);
      }, 200);
    } else if (customText === 'Draw') {
      if (
        state.turn.player === state.playerNum &&
        state.turn.movesLeft >= 1 &&
        state.turn.phase === 'play'
      ) {
        socket.emit('draw-one', roomId, userId);
      }
    } else if (customText === 'Redraw') {
      if (!state || !socket || state.turn.movesLeft === 0) return;
      if (state.turn.player === state.playerNum) {
        socket.emit('draw-five', roomId, userId);
      }
    } else if (customText === 'Pass') {
      if (state.turn.phase === 'draw' || state.turn.phase === 'play') {
        socket.emit('pass', roomId, userId);
      }
    } else if (customText === 'Skip') {
      if (
        state.turn.effect &&
        state.turn.effect.players.some(val => val === state.playerNum)
      ) {
        socket.emit('use-effect', roomId, userId, state.turn.effect.card, -2);
      }
    }

    setCard(null);
    setShow(false);
    setCustomText('');
  };

  return (
    <div className={`confirm-card${show ? ' show' : ' hide'}`}>
      {(card ||
        customText === 'Draw' ||
        customText === 'Redraw' ||
        customText === 'Pass' ||
        customText === 'Skip') &&
        state.turn.phase !== 'modify' && (
          <>
            {customText || !state.turn.effect ? (
              <div className='left' onClick={playCard}>
                <h1>{customText ? customText : 'Play'}</h1>
              </div>
            ) : (
              <div className='left' onClick={playCard}>
                <h1>{state.turn.effect.purpose.split(' ')[0]}</h1>
              </div>
            )}

            {card ? (
              card.type !== CardType.large ? (
                <div className='img-container'>
                  <img
                    src={getImage(card)}
                    alt={card.name}
                    className='small-xl'
                    draggable='false'
                  />
                </div>
              ) : (
                <div className='img-container'>
                  <img
                    src={getImage(card)}
                    alt={card.name}
                    className='large-lg'
                    draggable='false'
                  />
                </div>
              )
            ) : customText && customCenter ? (
              customCenter.includes(
                'https://jingxianlau.github.io/here-to-slay/'
              ) ? (
                <div className='img-container'>
                  <img
                    src={customCenter}
                    alt={customText}
                    className='small-xl'
                    draggable='false'
                  />
                </div>
              ) : (
                <div className='icon'>
                  <span className='image material-symbols-outlined'>
                    {customCenter}
                  </span>
                </div>
              )
            ) : (
              <></>
            )}

            <div
              className='right'
              onClick={() => {
                setShow(false);
                setTimeout(() => {
                  setCard(null);
                  setCustomText('');
                }, 200);
              }}
            >
              <h1>Cancel</h1>
            </div>
          </>
        )}
    </div>
  );
};

export default ConfirmCard;
