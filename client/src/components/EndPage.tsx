import React from 'react';
import useClientContext from '../hooks/useClientContext';

const EndPage: React.FC<{ showBoard: boolean }> = ({ showBoard }) => {
  const {
    state: { val: state }
  } = useClientContext();

  return (
    <div
      className={`end-page ${
        state.turn.phase === 'end-game' && !showBoard ? 'show' : 'hide'
      }`}
    >
      {state.turn.phase === 'end-game' &&
        state.match.isReady.filter(val => val === true).length > 0 && (
          <>
            <div className='helper-text-container show' style={{ top: '10vh' }}>
              <h3 style={{ fontSize: '15vh', marginTop: '29vh' }}>
                {state.match.isReady.filter(val => val === true).length === 1
                  ? 'Victory!'
                  : 'Draw'}
              </h3>
            </div>
            <h1 style={{ marginTop: '50vh' }}>
              {state.match.players.map((val, i) =>
                state.match.isReady[i] ? (
                  <div key={i} style={{ color: '#fc7c37', fontSize: '8vh' }}>
                    {val}
                  </div>
                ) : (
                  <></>
                )
              )}
            </h1>
            <div className='timer'>
              <h1>{180 - state.match.startRolls.maxVal}s</h1>
              <h5>Lobby Closes</h5>
            </div>
          </>
        )}
    </div>
  );
};

export default EndPage;
