import React from 'react';
import { Socket } from 'socket.io-client';
import { CardType, ModifierCard } from '../types';
import { getImage } from '../helpers/getImage';
import useClientContext from '../hooks/useClientContext';
import { dropHand } from '../helpers/dropHand';

interface ConfirmCardProps {
  socket: Socket;
}

const ConfirmCard: React.FC<ConfirmCardProps> = ({ socket }) => {
  const {
    showHand,
    credentials: { roomId, userId },
    chosenCard: { val: card, set: setCard, show, setShow },
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
            !(
              card.type === CardType.hero &&
              state.board[state.playerNum].heroCards.length >= 5
            )
          ) {
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
      }

      setShow(false);
      showHand.setLocked(false);
      setTimeout(() => {
        setCard(null);
      }, 200);
    }
  };

  return (
    <div className={`confirm-card${show ? ' show' : ' hide'}`}>
      {card && state.turn.phase !== 'modify' && (
        <>
          <div className='left' onClick={playCard}>
            <h1>Play</h1>
          </div>
          <div className='img-container'>
            <img
              src={getImage(card)}
              alt={card.name}
              className='small-xl'
              draggable='false'
            />
          </div>
          <div
            className='right'
            onClick={() => {
              setShow(false);
              showHand.setLocked(false);
              setTimeout(() => {
                setCard(null);
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
