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
    state: { val: state },
    shownCard,
    credentials: { roomId, userId }
  } = useClientContext();

  return state.board[playerNum].largeCards.length > 0 ? (
    <div
      className={`mat ${
        (state.board[playerNum].largeCards[0] as LeaderCard).class
      } ${playerNum === state.turn.player ? 'active' : 'inactive'}`}
    >
      <div className='background'></div>
      <div className='cards'>
        <div className='top-row'>
          {state.board[playerNum].heroCards.map(card => (
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
                  state.turn.player === state.playerNum &&
                  state.playerNum === playerNum &&
                  (card.freeUse || state.turn.movesLeft > 0) &&
                  !state.turn.pause &&
                  state.turn.phase === 'play' &&
                  !card.abilityUsed
                ) {
                  socket.emit('use-effect-roll', roomId, userId, card);
                }
              }}
            >
              <img
                src={getImage(card)}
                alt={card.name}
                className={`small-card ${
                  card.id === state.mainDeck.preparedCard?.card.id ||
                  (state.turn.player === state.playerNum &&
                    card.freeUse &&
                    state.playerNum === playerNum &&
                    state.turn.phase === 'play')
                    ? 'glow'
                    : ''
                } ${
                  !state.mainDeck.preparedCard &&
                  state.turn.player === state.playerNum &&
                  state.playerNum === playerNum &&
                  state.turn.phase === 'play' &&
                  !card.abilityUsed
                    ? 'click'
                    : playerNum === state.playerNum
                    ? 'deny'
                    : ''
                }`}
                draggable='false'
              />
            </div>
          ))}

          {Array.from(
            Array(5 - state.board[playerNum].heroCards.length),
            (_, i) => (
              <div className='small' key={i}></div>
            )
          )}
        </div>

        <div className='bottom-row'>
          {state.board[playerNum].largeCards.map(card => (
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
            Array(4 - state.board[playerNum].largeCards.length),
            (_, i) => (
              <div className='large' key={i}></div>
            )
          )}
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
};

export default PlayerBoard;
