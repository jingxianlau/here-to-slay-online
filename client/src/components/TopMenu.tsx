import React from 'react';
import useClientContext from '../hooks/useClientContext';

const TopMenu: React.FC = () => {
  const { state } = useClientContext();

  return (
    <div className='top-menu'>
      <div className='turn-order'>
        {state.val.match.players.map((name, num) => (
          <div key={num}>
            <span
              style={{
                fontWeight: state.val.turn.player === num ? 700 : 500,
                fontSize: state.val.turn.player === num ? '2.2vh' : '1.8vh',
                color: state.val.turn.player === num ? 'white' : '#bbb'
              }}
            >
              {name}
            </span>
            <span style={{ fontSize: '2.5vh' }}>
              {state.val.match.players[state.val.match.players.length - 1] !==
                name && ' → '}
            </span>
          </div>
        ))}
      </div>
      <div className='turn-circles'>
        <div
          className={
            state.val.turn.movesLeft >= 1
              ? 'turn-circle active'
              : 'turn-circle inactive'
          }
        >
          <img src='./assets/circle-star.svg' />
        </div>
        <div
          className={
            state.val.turn.movesLeft >= 2
              ? 'turn-circle active'
              : 'turn-circle inactive'
          }
        >
          <img src='./assets/circle-star.svg' />
        </div>
        <div
          className={
            state.val.turn.movesLeft >= 3
              ? 'turn-circle active'
              : 'turn-circle inactive'
          }
        >
          <img src='./assets/circle-star.svg' />
        </div>
      </div>
    </div>
  );
};

export default TopMenu;
