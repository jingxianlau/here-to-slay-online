import React from 'react';
import { getImage } from '../helpers/getImage';
import { Socket } from 'socket.io-client';
import useClientContext from '../hooks/useClientContext';

interface CenterBoardProps {
  socket: Socket;
}

const CenterBoard: React.FC<CenterBoardProps> = ({ socket }) => {
  const { state, credentials, showHand, playerNum, shownCard } =
    useClientContext();

  function drawTwo() {
    if (
      state.val.turn.phase !== 'draw' ||
      state.val.turn.player !== playerNum.val
    )
      return;
    socket.emit('draw-two', credentials.roomId, credentials.userId);
    showHand.set(true);
    setTimeout(() => {
      showHand.set(false);
    }, 1000);
  }

  return (
    <div className='mat'>
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
              state.val.turn.phase === 'draw' &&
              state.val.turn.player === playerNum.val
                ? 'glow click'
                : ''
            }`}
            onClick={drawTwo}
            draggable='false'
          />
        </div>
        <div className='small discard'>
          {state.val.mainDeck.discardTop && (
            <img
              src={getImage(state.val.mainDeck.discardTop)}
              alt={state.val.mainDeck.discardTop.name}
              className='small-card'
              draggable='false'
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CenterBoard;
