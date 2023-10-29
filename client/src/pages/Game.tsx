import React, { useEffect, useState } from 'react';
import '../style/game.css';
import '../style/index.css';
import { useNavigate } from 'react-router-dom';
import { Socket, io } from 'socket.io-client';
import { getCredentials } from '../helpers/getJSON';
import { CardType, GameState } from '../types';
import StartRoll from '../components/StartRoll';
import MainBoard from '../components/MainBoard';
import Hand from '../components/Hand';
import useCardContext from '../hooks/useCardContext';
import ShownCard from '../components/ShownCard';
import Popup from '../components/Popup';

const Game: React.FC = () => {
  const navigate = useNavigate();
  const { shownCard, pos } = useCardContext();

  // variables
  const [socket, setSocket] = useState<Socket | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [phase, setPhase] = useState<
    | 'start-roll'
    | 'draw'
    | 'play'
    | 'attack'
    | 'challenge'
    | 'challenge-roll'
    | 'modify'
  >();

  const [showRoll, setShowRoll] = useState(false);
  const [rollSummary, setRollSummary] = useState<number[]>([]);
  const [hasRolled, setHasRolled] = useState(false);

  const [showHand, setShowHand] = useState(false);
  const [allowedCards, setAllowedCards] = useState<CardType[] | null>([]);
  const [handLock, setHandLock] = useState(false);
  const [shownCardLock, setShownCardLock] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

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
        setPhase(state.turn.phase);

        /* PHASES */
        switch (state.turn.phase) {
          case 'start-roll':
            if (state.match.startRolls.rolls[state.turn.player] !== 0) {
              // new roll
              setTimeout(() => {
                getRollData();
                setShowRoll(true);
              }, 1000);
              setTimeout(() => {
                setShowRoll(false);
                setHasRolled(false);
              }, 3000);
            } else {
              // new round
              getRollData();
              setHasRolled(false);
            }
            break;

          case 'draw':
            setShowPopup(false);
            if (
              state.players[playerNum]?.hand.length === 0 &&
              state.turn.player === playerNum
            ) {
              // Get 5 Cards
              socket.emit('draw-five', credentials.roomId, credentials.userId);
              setShowHand(true);
              setTimeout(() => {
                setShowHand(false);
              }, 1000);
            }
            break;

          case 'challenge':
            setShowPopup(true);
            break;

          case 'challenge-roll':
            setShowPopup(true);
            break;

          case 'modify':
            setShowPopup(true);
            break;

          case 'play':
            setShowPopup(false);
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

  /* SHOW HAND */
  useEffect(() => {
    window.addEventListener('mousemove', mouseMoveHandler);
    return () => {
      window.removeEventListener('mousemove', mouseMoveHandler);
    };
  }, [showHand]);
  const mouseMoveHandler = (e: MouseEvent) => {
    if (handLock) return;
    if (showHand && window.innerHeight - e.clientY >= 200) {
      setShowHand(false);
    } else if (!showHand && window.innerHeight - e.clientY <= 80) {
      setShowHand(true);
    }
  };

  /* ROLL */
  function roll() {
    if (
      !state ||
      !socket ||
      state.turn.movesLeft === 0 ||
      state.turn.phase !== 'start-roll' ||
      hasRolled ||
      state.turn.player !== playerNum
    )
      return;

    setHasRolled(true);
    socket.emit('start-roll', credentials.roomId, credentials.userId);
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
              {(phase === 'challenge' ||
                phase === 'challenge-roll' ||
                phase === 'modify') &&
                showPopup && (
                  <Popup
                    state={state}
                    playerNum={playerNum}
                    socket={socket}
                    credentials={credentials}
                    setShowHand={setShowHand}
                    setHandLock={setHandLock}
                    setShownCardLock={setShownCardLock}
                    setAllowedCards={setAllowedCards}
                    show={showPopup}
                    phase={phase}
                  />
                )}
              {shownCard && pos && !shownCardLock && (
                <ShownCard shownCard={shownCard} pos={pos} />
              )}
              <Hand
                state={state}
                playerNum={playerNum}
                show={showHand}
                allowedCards={allowedCards}
                socket={socket}
                credentials={credentials}
                setShowHand={setShowHand}
              />
            </>
          )}
        </div>
      </div>
    )
  );
};

export default Game;
