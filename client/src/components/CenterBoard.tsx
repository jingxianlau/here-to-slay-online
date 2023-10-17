import React from 'react';
import { GameState } from '../types';
import { getImage } from '../helpers/getImage';

interface CenterBoardProps {
  state: GameState;
}

const CenterBoard: React.FC<CenterBoardProps> = ({ state }) => {
  return (
    <div className='mat'>
      {state.mainDeck.monsters.map(card => (
        <div className='large' key={card.id}>
          <img
            src={getImage(card.name, card.type)}
            alt={card.name}
            className='large-card'
          />
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
