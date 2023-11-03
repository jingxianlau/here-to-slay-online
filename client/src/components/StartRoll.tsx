import React from 'react';
import Dice from './Dice';
import useClientContext from '../hooks/useClientContext';

interface StartRollProps {
  rollSummary: number[];
}

const StartRoll: React.FC<StartRollProps> = ({ rollSummary }) => {
  const { state, playerNum, showRoll } = useClientContext();

  return (
    <>
      <div className='summary'>
        <div className='turn-order'>
          {state.val.match.startRolls.inList.map(num => (
            <div key={num}>
              <span
                style={{
                  fontWeight: state.val.turn.player === num ? 700 : 500,
                  fontSize: state.val.turn.player === num ? '20px' : '16px',
                  color: state.val.turn.player === num ? 'white' : '#bbb'
                }}
              >
                {state.val.match.players[num]}
              </span>
              {state.val.match.startRolls.inList[
                state.val.match.startRolls.inList.length - 1
              ] !== num && ' → '}
            </div>
          ))}
        </div>
        <div className='roll-summary-container'>
          <div className='start-roll_summary'>
            {rollSummary.length === 0 && <h4>ㅤ</h4>}
            {rollSummary.map(
              num =>
                state.val.match.startRolls.rolls[num] !== 0 && (
                  <h4 className='summary-player' key={num}>
                    {state.val.match.players[num]}:{' '}
                    <span>{state.val.match.startRolls.rolls[num]}</span>
                  </h4>
                )
            )}
          </div>
        </div>
      </div>

      <div className='active-player'>
        <h2
          style={{
            color:
              state.val.turn.player === playerNum.val ? '#fc7c37' : 'white',
            fontWeight: state.val.turn.player === playerNum.val ? 800 : 600
          }}
        >
          {state.val.match.players[state.val.turn.player]}
        </h2>
      </div>

      <br />

      <div className='roll-content'>
        {state.val.turn.isRolling && (
          <>
            <div className='dice-box'>
              <Dice
                roll1={state.val.dice.main.roll[0]}
                roll2={state.val.dice.main.roll[1]}
              />
            </div>
            <h1>
              {showRoll.val &&
                state.val.dice.main.roll[0] + state.val.dice.main.roll[1]}
            </h1>
          </>
        )}
      </div>
    </>
  );
};

export default StartRoll;
