import React from 'react';
import { LeaderCard } from '../types';
import { getImage } from '../helpers/getImage';
import { Socket } from 'socket.io-client';
import useClientContext from '../hooks/useClientContext';

interface PlayerBoardProps {
  playerNum: number;
  col: number;
  socket: Socket;
}

const PlayerBoard: React.FC<PlayerBoardProps> = ({
  playerNum,
  col,
  socket
}) => {
  const { state, shownCard } = useClientContext();

  return state.val.board[playerNum].largeCards.length > 0 ? (
    <div
      className={`mat ${
        (state.val.board[playerNum].largeCards[0] as LeaderCard).class
      }`}
    >
      <div className='top-row'>
        {state.val.board[playerNum].heroCards.map(card => (
          <div
            className='small'
            key={card.id}
            onMouseEnter={() => {
              if (!shownCard.locked) {
                shownCard.set(card);
                shownCard.setPos(col === 0 ? 'right' : 'left');
              }
            }}
            onMouseLeave={() => {
              shownCard.set(null);
              shownCard.setPos(null);
            }}
          >
            <img
              src={getImage(card)}
              alt={card.name}
              className={
                card.id === state.val.mainDeck.preparedCard?.card.id
                  ? 'small-card glow'
                  : 'small-card'
              }
              draggable='false'
            />
          </div>
        ))}

        {Array.from(
          Array(5 - state.val.board[playerNum].heroCards.length),
          (_, i) => (
            <div className='small' key={i}></div>
          )
        )}
      </div>

      <div className='bottom-row'>
        {state.val.board[playerNum].largeCards.map(card => (
          <div
            className='large'
            key={card.id}
            onMouseEnter={() => {
              if (!shownCard.locked) {
                shownCard.set(card);
                shownCard.setPos(col === 0 ? 'right' : 'left');
              }
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

        {Array.from(
          Array(4 - state.val.board[playerNum].largeCards.length),
          (_, i) => (
            <div className='large' key={i}></div>
          )
        )}
      </div>
    </div>
  ) : (
    <></>
  );
};

export default PlayerBoard;
