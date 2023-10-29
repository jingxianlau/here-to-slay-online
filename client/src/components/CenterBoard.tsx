import React from 'react';
import { CardType, Credentials, GameState } from '../types';
import { getImage } from '../helpers/getImage';
import useCardContext from '../hooks/useCardContext';
import { Socket } from 'socket.io-client';

interface CenterBoardProps {
  state: GameState;
  socket: Socket;
  credentials: Credentials;
  setShowHand: React.Dispatch<React.SetStateAction<boolean>>;
  playerNum: number;
}

const CenterBoard: React.FC<CenterBoardProps> = ({
  state,
  socket,
  credentials,
  setShowHand,
  playerNum
}) => {
  const { setShownCard, setPos } = useCardContext();

  function drawTwo() {
    if (state.turn.phase !== 'draw' || state.turn.player !== playerNum) return;
    socket.emit('draw-two', credentials.roomId, credentials.userId);
    setShowHand(true);
    setTimeout(() => {
      setShowHand(false);
    }, 1000);
  }

  return (
    <div className='mat'>
      {state.mainDeck.monsters.map(card => (
        <div
          className='large'
          key={card.id}
          onMouseEnter={() => {
            setShownCard(card);
            setPos('left');
          }}
          onMouseLeave={() => {
            setShownCard(null);
            setPos(null);
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
      {Array.from(Array(3 - state.mainDeck.monsters.length), (_, i) => (
        <div className='large' key={i}></div>
      ))}

      <div className='small-cards'>
        <div className='small deck'>
          <img
            src='./assets/back/back-creme.png'
            alt='flipped card'
            className={`small-card ${
              state.turn.phase === 'draw' && state.turn.player === playerNum
                ? 'glow click'
                : ''
            }`}
            onClick={drawTwo}
            draggable='false'
          />
        </div>
        <div className='small discard'>
          {state.mainDeck.discardTop && (
            <img
              src={getImage(state.mainDeck.discardTop)}
              alt={state.mainDeck.discardTop.name}
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
