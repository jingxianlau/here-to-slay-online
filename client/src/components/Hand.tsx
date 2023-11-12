import React from 'react';
import { AnyCard, CardType } from '../types';
import { getImage } from '../helpers/getImage';
import { Socket } from 'socket.io-client';
import useClientContext from '../hooks/useClientContext';
import { allowedCard } from '../helpers/allowedCard';
import { dropHand } from '../helpers/dropHand';

interface HandProps {
  socket: Socket;
}

const Hand: React.FC<HandProps> = ({ socket }) => {
  const {
    state: { val: state },
    showHand,
    allowedCards,
    credentials: { roomId, userId },
    shownCard
  } = useClientContext();

  // useEffect(() => {
  //   if (state.turn.phase === 'challenge') {
  //   }
  // }, [state.turn.phase]);

  const drawFive = () => {
    if (!state || !socket || state.turn.movesLeft === 0) return;
    if (state.turn.player === state.playerNum) {
      socket.emit('draw-five', roomId, userId);
    }
  };

  const playCard = (card: AnyCard) => {
    if (!state || !socket) return;

    switch (state.turn.phase) {
      case 'play':
        if (
          state.turn.player === state.playerNum &&
          (card.type === CardType.hero ||
            card.type === CardType.item ||
            card.type === CardType.magic)
        ) {
          socket.emit('prepare-card', roomId, userId, card);
          dropHand(showHand, shownCard);
        }
        break;

      case 'challenge':
        if (card.type === CardType.challenge) {
          socket.emit('challenge', roomId, userId, true, card.id);
          dropHand(showHand, shownCard);
        }
        break;

      case 'modify':
        if (card.type === CardType.modifier) {
          shownCard.set(card);
          showHand.set(false);
          showHand.setLocked(true);
        }
    }
  };

  return (
    <div
      className='hand-trigger'
      onMouseOver={() => {
        if (!showHand.locked) {
          showHand.set(true);
        }
      }}
      onMouseOut={() => {
        if (!showHand.locked) {
          showHand.set(false);
        }
      }}
    >
      {!showHand.val && (
        <>
          <h5>
            <span>Hand</span>
            <span className='material-symbols-outlined arrow-down'>
              keyboard_double_arrow_down
            </span>
          </h5>
        </>
      )}
      <div
        className='bottomMenu'
        style={{ bottom: showHand.val ? 0 : '-30vh' }}
      >
        {state.turn.player === state.playerNum &&
          state.turn.movesLeft === 3 &&
          state.turn.phase === 'play' && (
            <div className='discard' onClick={drawFive}>
              <span className='material-symbols-outlined'>delete_forever</span>
            </div>
          )}
        <div className='hand'>
          {state.players[state.playerNum]?.hand.map((card, i) => (
            <div
              key={i}
              onMouseEnter={() => {
                if (!shownCard.locked) {
                  shownCard.set(card);
                  shownCard.setPos('top');
                }
              }}
              onMouseLeave={() => {
                if (!shownCard.locked) {
                  shownCard.set(null);
                  shownCard.setPos(null);
                }
              }}
            >
              <img
                src={getImage(card)}
                alt={card.name}
                className={`small-md ${
                  allowedCards.val.length === 5
                    ? 'active'
                    : allowedCard(allowedCards.val, card.type) &&
                      (state.turn.phase === 'challenge' ||
                        state.turn.phase === 'challenge-roll' ||
                        state.turn.phase === 'modify')
                    ? 'active glow'
                    : allowedCard(allowedCards.val, card.type)
                    ? 'active'
                    : 'inactive'
                }`}
                onClick={() => {
                  if (allowedCard(allowedCards.val, card.type)) playCard(card);
                }}
                draggable='false'
              />
            </div>
          ))}
          {state.players[state.playerNum]?.hand.length === 0 && (
            <div style={{ marginBottom: '5vh' }}>
              <h2>No Cards :(</h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hand;
