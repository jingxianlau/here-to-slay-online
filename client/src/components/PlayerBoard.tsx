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
  const {
    state,
    shownCard,
    credentials: { roomId, userId }
  } = useClientContext();

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
            onClick={() => {
              if (
                state.val.turn.player === state.val.playerNum &&
                state.val.playerNum === playerNum &&
                (card.freeUse || state.val.turn.movesLeft > 0) &&
                !state.val.turn.pause
              ) {
                socket.emit('use-effect', roomId, userId, card);
              }
            }}
          >
            <img
              src={getImage(card)}
              alt={card.name}
              className={`small-card ${
                card.id === state.val.mainDeck.preparedCard?.card.id ||
                (state.val.turn.player === state.val.playerNum &&
                  card.freeUse &&
                  state.val.playerNum === playerNum)
                  ? 'glow'
                  : ''
              } ${
                !state.val.mainDeck.preparedCard &&
                state.val.turn.player === state.val.playerNum
                  ? 'click'
                  : ''
              }`}
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
