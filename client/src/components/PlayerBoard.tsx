import React from 'react';
import { GameState } from '../types';

interface PlayerBoardProps {
  state: GameState;
  playerNum: number;
}

const PlayerBoard: React.FC<PlayerBoardProps> = ({ state, playerNum }) => {
  return (
    <div className='mat'>
      <div className='top-row'>
        {state.board[playerNum].heroCards.map(card => (
          <div className='small' key={card.id}>
            {card.name}
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
          <div className='large' key={card.id}>
            {card.name}
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
  );
};

export default PlayerBoard;
