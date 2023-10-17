import React from 'react';
import { GameState } from '../types';
import PlayerBoard from './PlayerBoard';
import CenterBoard from './CenterBoard';

interface MainBoardProps {
  state: GameState;
}

const MainBoard: React.FC<MainBoardProps> = ({ state }) => {
  return (
    <>
      <div className='turn-order'>
        {state.match.players.map((name, num) => (
          <div key={num}>
            <span
              style={{
                fontWeight: state.turn.player === num ? 700 : 500,
                fontSize: state.turn.player === num ? '20px' : '16px',
                color: state.turn.player === num ? 'black' : '#555'
              }}
            >
              {name}
            </span>
            {state.match.players[state.match.players.length - 1] !== name &&
              ' → '}
          </div>
        ))}
      </div>

      <div className='board'>
        {state.match.players.map((name, num) => (
          <div className='player-board' key={num}>
            <h4>{name}</h4>
            <PlayerBoard state={state} playerNum={num} />
          </div>
        ))}
        <div className='center-board'>
          <CenterBoard state={state} />
        </div>
      </div>
    </>
  );
};

export default MainBoard;
