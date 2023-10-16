import React from 'react';
import { GameState } from '../types';

interface CenterBoardProps {
  state: GameState;
}

const CenterBoard: React.FC<CenterBoardProps> = ({ state }) => {
  return (
    <div className='mat'>
      {state.mainDeck.monsters.map(card => (
        <div className='large' key={card.id}>
          {card.name}
        </div>
      ))}
      {Array.from(Array(3 - state.mainDeck.monsters.length), (_, i) => (
        <div className='large' key={i}></div>
      ))}

      <div className='small-cards'>
        <div className='small deck'>Deck</div>
        <div className='small discard'>Discard Pile</div>
      </div>
    </div>
  );
};

export default CenterBoard;
