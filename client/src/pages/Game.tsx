import React, { useEffect, useState } from 'react';
import '../style/game.css';
import '../style/index.css';
import { useNavigate } from 'react-router-dom';
import { Socket, io } from 'socket.io-client';
import { getCredentials } from '../helpers/getJSON';
import { GameState } from '../types';
import StartRoll from '../components/StartRoll';
import MainBoard from '../components/MainBoard';
import Hand from '../components/Hand';

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
  const credentials = getCredentials();
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
            <StartRoll
              state={state}
              rollSummary={rollSummary}
              playerNum={playerNum}
              showRoll={showRoll}
            />
          ) : (
            <>
              <MainBoard state={state} playerNum={playerNum} />
              {/* <Hand state={state} playerNum={playerNum} /> */}
            </>
          )}
        </div>
      </div>
    )
  );
};

export default Game;
