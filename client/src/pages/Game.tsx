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
import useCardContext from '../hooks/useCardContext';
import ShownCard from '../components/ShownCard';

const Game: React.FC = () => {
  const navigate = useNavigate();
  const { shownCard, pos } = useCardContext();

  // variables
  const [socket, setSocket] = useState<Socket | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [phase, setPhase] = useState('start-roll');

  const [showRoll, setShowRoll] = useState(false);
  const [rollSummary, setRollSummary] = useState<number[]>([]);

  const [showHand, setShowHand] = useState(false);

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
        'enter-lobby',
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
              localStorage.removeItem('credentials');
              navigate('/');
            }
          }
        }
      );

      socket.on('game-state', (state: GameState) => {
        setState(state);

        /* PHASES */
        // Start Roll
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
        } else if (
          state.players[playerNum]?.hand.length === 0 &&
          phase === 'draw' &&
          state.turn.player === playerNum
        ) {
          // Get 5 Cards
          socket.emit('draw-five', credentials.roomId, credentials.userId);
          setShowHand(true);
          setTimeout(() => {
            setShowHand(false);
          }, 1000);
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
        if (socket) {
          socket.disconnect();
        }
      };
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', mouseMoveHandler);
    return () => {
      window.removeEventListener('mousemove', mouseMoveHandler);
    };
  }, [showHand]);

  const mouseMoveHandler = (e: MouseEvent) => {
    if (showHand && window.innerHeight - e.clientY >= 160) {
      setShowHand(false);
    } else if (!showHand && window.innerHeight - e.clientY <= 80) {
      setShowHand(true);
    }
  };

  function roll() {
    if (!state || !socket) return;
    if (state.turn.player === playerNum) {
      socket.emit('roll', credentials.roomId, credentials.userId);
    }
  }

  return (
    credentials &&
    state &&
    socket && (
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
              <MainBoard
                state={state}
                playerNum={playerNum}
                socket={socket}
                credentials={credentials}
                setShowHand={setShowHand}
              />
              <Hand
                state={state}
                playerNum={playerNum}
                show={showHand}
                socket={socket}
                credentials={credentials}
                setShowHand={setShowHand}
              />
            </>
          )}
        </div>
        {shownCard && pos && <ShownCard shownCard={shownCard} pos={pos} />}
      </div>
    )
  );
};

export default Game;
