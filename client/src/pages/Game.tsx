import React, { useEffect, useState } from 'react';
import '../style/game.css';
import { useNavigate } from 'react-router-dom';
import { Socket, io } from 'socket.io-client';
import { getJSON } from '../helpers/getJSON';
import { GameState, Credentials } from '../types';
import Dice from '../components/Dice';

const Game: React.FC = () => {
  const navigate = useNavigate();

  // variables
  const [socket, setSocket] = useState<Socket | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [phase, setPhase] = useState('start-roll');

  const [showRoll, setShowRoll] = useState(false);
  const [rollSummary, setRollSummary] = useState<number[]>([]);

  // credentials
  const [playerNum, setPlayerNum] = useState(-1);
  const credentials = getJSON('credentials');
  const username = localStorage.getItem('username') as string;

  useEffect(() => {
    if (!credentials) {
      navigate('/');
      return;
    } else {
      // create socket connection
      let socket = io('http://localhost:4000');
      socket.on('connect', () => {});
      setSocket(socket);
      socket.emit(
        'enter-match',
        credentials.roomId,
        credentials.userId,
        username,
        (successful: boolean, playerNum: number) => {
          if (!successful) {
            localStorage.removeItem('credentials');
            navigate('/');
          } else {
            if (playerNum !== -1) {
              setPlayerNum(playerNum);
            } else {
              navigate('/');
            }
          }
        }
      );

      socket.on('game-state', (state: GameState) => {
        setState(state);

        /* PHASES */
        if (
          phase === 'start-roll' &&
          state.match.startRolls.rolls[state.turn.player] !== 0
        ) {
          setPhase(state.turn.phase);
          setTimeout(() => {
            getRollData();
            setShowRoll(true);
          }, 1000);
          setTimeout(() => setShowRoll(false), 3000);
        } else if (phase === 'start-roll') {
          setPhase(state.turn.phase);
          getRollData();
        } else {
          setPhase(state.turn.phase);
        }

        /* HELPER FUNCTIONS */
        function getRollData() {
          setRollSummary([]);
          state.match.startRolls.inList.map(playerNum => {
            if (state.match.startRolls.rolls[playerNum] !== 0) {
              setRollSummary(e => [...e, playerNum]);
            }
          });
        }
      });

      socket.emit('start-match', credentials.roomId, credentials.userId);
      return () => {
        if (socket) socket.disconnect();
      };
    }
  }, []);

  function roll() {
    if (!state || !socket) return;
    if (state.turn.player === playerNum) {
      socket.emit('roll', credentials.roomId, credentials.userId);
    }
  }

  return (
    credentials &&
    state && (
      <div onClick={state.turn.isRolling ? roll : () => {}}>
        <div className='game'>
          {phase === 'start-roll' ? (
            <>
              <div className='summary'>
                <div className='turn-order'>
                  {state.match.startRolls.inList.map(num => (
                    <>
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
                    </>
                  ))}
                </div>
                <div className='start-roll_summary'>
                  {rollSummary.length === 0 && <h4>ㅤ</h4>}
                  {rollSummary.map(
                    playerNum =>
                      state.match.startRolls.rolls[playerNum] !== 0 && (
                        <h4 className='summary-player' key={playerNum}>
                          {state.match.players[playerNum]}:{' '}
                          <span>{state.match.startRolls.rolls[playerNum]}</span>
                        </h4>
                      )
                  )}
                </div>
              </div>

              <div className='active-player'>
                <h2
                  style={{
                    color:
                      state.turn.player === playerNum ? '#11b56b' : 'black',
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
                      {showRoll &&
                        state.dice.main.roll[0] + state.dice.main.roll[1]}
                    </h1>
                  </>
                )}
              </div>
            </>
          ) : (
            <>{/* GAME BOARD */}</>
          )}
        </div>
      </div>
    )
  );
};

export default Game;
