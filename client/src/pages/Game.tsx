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
  const [rollSummary, setRollSummary] = useState<
    {
      playerNum: number;
      roll: number;
    }[]
  >([]);

  // credentials
  const [playerNum, setPlayerNum] = useState(-1);
  const [credentials, setCredentials] = useState<Credentials>(
    getJSON('credentials')
  );
  const [username, setUsername] = useState(
    localStorage.getItem('username') as string
  );

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
        console.log(state);

        if (
          phase === 'start-roll' &&
          state.match.startRolls.rolls[state.turn.player] !== 0
        ) {
          setPhase(state.turn.phase);
          setTimeout(() => {
            setShowRoll(true);
            setRollSummary([]);
            state.match.startRolls.inList.map(playerNum => {
              if (state.match.startRolls.rolls[playerNum] !== 0) {
                setRollSummary(e => [
                  ...e,
                  {
                    playerNum: playerNum,
                    roll: state.match.startRolls.rolls[playerNum]
                  }
                ]);
              }
            });
          }, 1000);
          setTimeout(() => setShowRoll(false), 3000);
        } else setPhase(state.turn.phase);
      });

      socket.emit('start-match', credentials.roomId, credentials.userId);

      return () => {
        if (socket) socket.disconnect();
      };
    }
  }, []);

  function roll() {
    if (!state || !socket) return;

    switch (state.turn.phase) {
      case 'start-roll':
        if (state.turn.player === playerNum) {
          socket.emit('roll', credentials.roomId, credentials.userId);
        }
        break;
      default:
        break;
    }
  }

  return (
    credentials &&
    state && (
      <div onClick={state.turn.isRolling ? roll : () => {}}>
        <header>
          <img src='HTS_logo.png' />
          <p>{state?.match.players[playerNum]}</p>
          <p>Game Code: {credentials.roomId}</p>
        </header>

        <div className='game'>
          <div className='summary'>
            {phase === 'start-roll' && (
              <div className='start-roll_summary'>
                {rollSummary.map(
                  ({ playerNum, roll }) =>
                    state.match.startRolls.rolls[playerNum] !== 0 && (
                      <h4 className='summary-player' key={playerNum}>
                        {state.match.players[playerNum]}: <span>{roll}</span>
                      </h4>
                    )
                )}
              </div>
            )}
          </div>

          <div className='active-player'>
            <h2
              style={{
                color: state.turn.player === playerNum ? '#11b56b' : 'black'
              }}
            >
              {state.match.players[state?.turn.player]}
            </h2>
          </div>

          <br />

          <div className='content'>
            {phase === 'start-roll' && state.turn.isRolling && (
              <>
                <div className='dice-box'>
                  <Dice
                    roll1={state.dice.main.roll[0]}
                    roll2={state.dice.main.roll[1]}
                  />
                </div>
                <h3>
                  {showRoll &&
                    state.dice.main.roll[0] + state.dice.main.roll[1]}
                </h3>
              </>
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default Game;
