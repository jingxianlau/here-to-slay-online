import React from 'react';
import { GameState } from '../types';
import Dice from './Dice';

interface StartRollProps {
  state: GameState;
  rollSummary: number[];
  playerNum: number;
  showRoll: boolean;
}

const StartRoll: React.FC<StartRollProps> = ({
  state,
  rollSummary,
  playerNum,
  showRoll
}) => {
  return (
    <>
      <div className='summary'>
        <div className='turn-order'>
          {state.match.startRolls.inList.map(num => (
            <div key={num}>
              <span
                style={{
                  color: num === state.turn.player ? '#11b56b' : 'black'
                }}
              >
                {state.match.players[num]}
              </span>
              {state.match.startRolls.inList[
                state.match.startRolls.inList.length - 1
              ] !== num && ' → '}
            </div>
          ))}
        </div>
        <div className='start-roll_summary'>
          {rollSummary.length === 0 && <h4>ㅤ</h4>}
          {rollSummary.map(
            num =>
              state.match.startRolls.rolls[num] !== 0 && (
                <h4 className='summary-player' key={num}>
                  {state.match.players[num]}:{' '}
                  <span>{state.match.startRolls.rolls[num]}</span>
                </h4>
              )
          )}
        </div>
      </div>

      <div className='active-player'>
        <h2
          style={{
            color: state.turn.player === playerNum ? '#11b56b' : 'black',
            fontWeight: state.turn.player === playerNum ? 800 : 500
          }}
        >
          {state.match.players[state?.turn.player]}
        </h2>
      </div>

      <br />

      <div className='content'>
        {state.turn.isRolling && (
          <>
            <div className='dice-box'>
              <Dice
                roll1={state.dice.main.roll[0]}
                roll2={state.dice.main.roll[1]}
              />
            </div>
            <h1>
              {showRoll && state.dice.main.roll[0] + state.dice.main.roll[1]}
            </h1>
          </>
        )}
      </div>
    </>
  );
};

export default StartRoll;
