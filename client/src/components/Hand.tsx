import React from 'react';
import { AnyCard, CardType } from '../types';
import { getImage } from '../helpers/getImage';
import { Socket } from 'socket.io-client';
import useClientContext from '../hooks/useClientContext';
import { allowedCard } from '../helpers/allowedCard';

interface HandProps {
  socket: Socket;
}

const Hand: React.FC<HandProps> = ({ socket }) => {
  const {
    state: { val: state },
    playerNum,
    showHand,
    allowedCards,
    credentials,
    shownCard
  } = useClientContext();

  // useEffect(() => {
  //   if (state.turn.phase === 'challenge') {
  //   }
  // }, [state.turn.phase]);

  const drawFive = () => {
    if (!state || !socket || state.turn.movesLeft === 0) return;
    if (state.turn.player === playerNum.val) {
      socket.emit('draw-five', credentials.roomId, credentials.userId);
    }
  };

  const playCard = (card: AnyCard) => {
    if (!state || !socket || state.turn.movesLeft === 0) return;

    switch (state.turn.phase) {
      case 'play':
        if (
          state.turn.player === playerNum.val &&
          (card.type === CardType.hero ||
            card.type === CardType.item ||
            card.type === CardType.magic)
        ) {
          socket.emit(
            'prepare-card',
            credentials.roomId,
            credentials.userId,
            card
          );
          showHand.set(false);
        }
        break;
      case 'challenge':
        if (
          state.turn.player === playerNum.val &&
          card.type === CardType.challenge
        ) {
          socket.emit(
            'challenge',
            credentials.roomId,
            credentials.userId,
            card,
            true
          );
        }
        break;
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
        {state.turn.player === playerNum.val &&
          state.turn.movesLeft === 3 &&
          state.turn.phase === 'play' && (
            <div className='discard' onClick={drawFive}>
              <span className='material-symbols-outlined'>delete_forever</span>
            </div>
          )}
        <div className='hand'>
          {state.players[playerNum.val]?.hand.map((card, i) => (
            <div
              key={i}
              onMouseEnter={() => {
                if (
                  allowedCard(allowedCards.val, card.type) &&
                  !shownCard.locked
                ) {
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
                onClick={() => playCard(card)}
                draggable='false'
              />
            </div>
          ))}
          {state.players[playerNum.val]?.hand.length === 0 && (
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
