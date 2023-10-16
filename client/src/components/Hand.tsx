import React from 'react';
import { GameState } from '../types';

interface HandProps {
  state: GameState;
  playerNum: number;
}

const Hand: React.FC<HandProps> = ({ state, playerNum }) => {
  return (
    <div className='hand'>
      {state.players[playerNum]?.hand.map((card, i) => (
        <div className='card' key={i}>
          <div>{card.type}</div>
          <div>{card.name}</div>
        </div>
      ))}
    </div>
  );
};

export default Hand;
