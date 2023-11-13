import React from 'react';
import { getImage } from '../helpers/getImage';
import { Socket } from 'socket.io-client';
import useClientContext from '../hooks/useClientContext';

interface CenterBoardProps {
  socket: Socket;
}

const CenterBoard: React.FC<CenterBoardProps> = ({ socket }) => {
  const { state, credentials, showHand, shownCard } = useClientContext();

  function drawTwo() {
    if (
      state.val.turn.phase !== 'draw' ||
      state.val.turn.player !== state.val.playerNum
    )
      return;

    socket.emit('draw-two', credentials.roomId, credentials.userId);
    showHand.set(true);
    setTimeout(() => {
      showHand.set(false);
    }, 1200);
  }
  function drawOne() {
    if (
      state.val.turn.phase !== 'play' ||
      state.val.turn.player !== state.val.playerNum
    )
      return;

    socket.emit('draw-one', credentials.roomId, credentials.userId);
    showHand.set(true);
    setTimeout(() => {
      showHand.set(false);
    }, 1200);
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
              state.val.turn.player === state.val.playerNum
                ? 'glow click'
                : ''
            }`}
            onClick={
              state.val.turn.phase === 'draw'
                ? drawTwo
                : state.val.turn.phase === 'play'
                ? drawOne
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
