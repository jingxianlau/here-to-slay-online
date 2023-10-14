import React, { useEffect, useState } from 'react';
import '../style/game.css';
import { useNavigate } from 'react-router-dom';
import { Socket, io } from 'socket.io-client';
import { getJSON } from '../helpers/getJSON';
import { GameState, Credentials } from '../types';

const Game: React.FC = () => {
  const navigate = useNavigate();

  // variables
  const [socket, setSocket] = useState<Socket | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [phase, setPhase] = useState('start-roll');

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
        setPhase(state.turn.phase);
        console.log(state);
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
      <div>
        <header>
          <img src='HTS_logo.png' />
          <p>{state?.match.players[playerNum]}</p>
          <p>Game Code: {credentials.roomId}</p>
        </header>

        <div className='game'>
          <div className='summary'>
            {phase === 'start-roll' && (
              <div className='start-roll_summary'>
                {state.match.startRolls.inList.map(playerNum => (
                  <h4 className='summary-player' key={playerNum}>
                    {state.match.players[playerNum]}:{' '}
                    <span>{state.match.startRolls.rolls[playerNum]}</span>
                  </h4>
                ))}
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
            {phase === 'start-roll' && (
              <>
                <div className='dice'>
                  <div className='die'>{state.dice.main.roll[0]}</div>
                  <div className='die'>{state.dice.main.roll[1]}</div>
                </div>
                <div className='die total'>
                  {state?.dice.main.total && state.dice.main.total}
                </div>
                <br />
                <br />
                {state.turn.player === playerNum && (
                  <button onClick={roll}>Roll!</button>
                )}
                <h1>{phase}</h1>
              </>
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default Game;
