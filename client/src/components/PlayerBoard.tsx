import React from 'react';
import { GameState, LeaderCard } from '../types';
import { getImage } from '../helpers/getImage';
import useCardContext from '../hooks/useCardContext';

interface PlayerBoardProps {
  state: GameState;
  playerNum: number;
  col: number;
}

const PlayerBoard: React.FC<PlayerBoardProps> = ({ state, playerNum, col }) => {
  const { setShownCard, setPos } = useCardContext();

  return state.board[playerNum].largeCards.length > 0 ? (
    <div
      className={`mat ${
        (state.board[playerNum].largeCards[0] as LeaderCard).class
      }`}
    >
      <div className='top-row'>
        {state.board[playerNum].heroCards.map(card => (
          <div
            className='small'
            key={card.id}
            onMouseEnter={() => {
              setShownCard(card);
              setPos(col === 0 ? 'right' : 'left');
            }}
            onMouseLeave={() => {
              setShownCard(null);
              setPos(null);
            }}
          >
            <img
              src={getImage(card.name, card.type, card.class)}
              alt={card.name}
              className='small-card'
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
              setShownCard(card);
              setPos(col === 0 ? 'right' : 'left');
            }}
            onMouseLeave={() => {
              setShownCard(null);
              setPos(null);
            }}
          >
            <img
              src={getImage(card.name, card.type)}
              alt={card.name}
              className='large-card'
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
  ) : (
    <></>
  );
};

export default PlayerBoard;
