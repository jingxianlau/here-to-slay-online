import React from 'react';
import { GameState } from '../types';

const TopMenu: React.FC<{ state: GameState }> = ({ state }) => {
  return (
    <div className='top-menu'>
      <div className='turn-order'>
        {state.match.players.map((name, num) => (
          <div key={num}>
            <span
              style={{
                fontWeight: state.turn.player === num ? 700 : 500,
                fontSize: state.turn.player === num ? '20px' : '16px',
                color: state.turn.player === num ? 'white' : '#bbb'
              }}
            >
              {name}
            </span>
            {state.match.players[state.match.players.length - 1] !== name &&
              ' → '}
          </div>
        ))}
      </div>
      <div className='turn-circles'>
        <div
          className={
            state.turn.movesLeft >= 1 ? 'turn-circle active' : 'turn-circle'
          }
        ></div>
        <div
          className={
            state.turn.movesLeft >= 2 ? 'turn-circle active' : 'turn-circle'
          }
        ></div>
        <div
          className={
            state.turn.movesLeft >= 3 ? 'turn-circle active' : 'turn-circle'
          }
        ></div>
      </div>
    </div>
  );
};

export default TopMenu;
