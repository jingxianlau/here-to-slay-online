import React, { useEffect, useState } from 'react';
import { isEmpty } from 'lodash';
import '../style/game.css';
import '../style/index.css';
import { useNavigate } from 'react-router-dom';
import { Socket, io } from 'socket.io-client';
import { CardType, GameState } from '../types';
import StartRoll from '../components/StartRoll';
import MainBoard from '../components/MainBoard';
import Hand from '../components/Hand';
import ShownCard from '../components/ShownCard';
import Popup from '../components/Popup';
import useClientContext from '../hooks/useClientContext';
import HelperText from '../components/HelperText';
import ShownCardTop from '../components/ShownCardTop';
import TopMenu from '../components/TopMenu';
import { showText } from '../helpers/showText';

const Game: React.FC = () => {
  const navigate = useNavigate();
  const {
    credentials,
    state: { val: state, set: setState },
    allowedCards,
    showRoll,
    hasRolled,
    showPopup,
    showHand,
    shownCard,
    showHelperText
  } = useClientContext();

  // variables
  const [socket, setSocket] = useState<Socket | null>(null);
  const [rollSummary, setRollSummary] = useState<number[]>([]);

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
        localStorage.getItem('username'),
        (successful: boolean) => {
          if (!successful) {
            localStorage.removeItem('credentials');
            navigate('/');
          }
        }
      );

      socket.on('game-state', (state: GameState) => {
        console.log(state);
        setState(state);

        /* PHASES */
        switch (state.turn.phase) {
          case 'start-roll':
            showText(
              showHelperText,
              'Roll Dice: Highest Roll Starts Turn First',
              state.turn.phaseChanged
            );
            if (state.match.startRolls.rolls[state.turn.player] !== 0) {
              // new roll
              setTimeout(() => {
                getRollData();
                showRoll.set(true);
              }, 1000);
              setTimeout(() => {
                showRoll.set(false);
                hasRolled.set(false);
              }, 3000);
            } else {
              // new round
              getRollData();
              hasRolled.set(false);
              showRoll.set(false);
            }
            break;

          case 'draw':
            showPopup.set(false);
            allowedCards.set([]);

            if (
              state.players[state.playerNum]?.hand.length === 0 &&
              state.turn.player === state.playerNum
            ) {
              // Get 5 Cards
              showText(showHelperText, 'Drawing 5 Cards', true, 500);
              socket.emit('draw-five', credentials.roomId, credentials.userId);
              showHand.set(true);
              setTimeout(() => {
                showHand.set(false);
              }, 1000);
            } else {
              showText(showHelperText, 'Draw Card', state.turn.phaseChanged);
            }
            break;

          case 'challenge':
            showPopup.set(true);
            shownCard.setLocked(true);
            shownCard.setPos(null);
            shownCard.set(null);
            break;

          case 'challenge-roll':
            showPopup.set(true);
            break;

          case 'modify':
            showPopup.set(true);
            break;

          case 'play':
            showPopup.set(false);
            shownCard.setLocked(false);
            allowedCards.set([]);

            if (state.turn.player === state.playerNum) {
              allowedCards.set([CardType.hero, CardType.item, CardType.magic]);
            }

            showText(showHelperText, 'Play Card', state.turn.phaseChanged);
            break;
        }

        /* HELPER FUNCTIONS */
        function getRollData() {
          setRollSummary([]);
          for (let i = 0; i < state.match.startRolls.inList.length; i++) {
            let num = state.match.startRolls.inList[i];
            if (state.match.startRolls.rolls[num] !== 0) {
              setRollSummary(e => [...e, num]);
            }
          }
          console.log(rollSummary);
        }
      });

      socket.emit('start-match', credentials.roomId, credentials.userId);

      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ROLL */
  function roll() {
    if (
      !state ||
      !socket ||
      state.turn.movesLeft === 0 ||
      state.turn.phase !== 'start-roll' ||
      hasRolled.val ||
      state.turn.player !== state.playerNum
    )
      return;

    hasRolled.set(true);
    socket.emit('start-roll', credentials.roomId, credentials.userId);
  }

  return (
    <>
      {credentials && !isEmpty(state) && socket && (
        <div onClick={state.turn.isRolling ? roll : () => {}}>
          <div className='game'>
            {state.turn.phase === 'start-roll' ? (
              <StartRoll rollSummary={rollSummary} />
            ) : (
              <>
                <TopMenu />

                <MainBoard socket={socket} />

                {(state.turn.phase === 'challenge' ||
                  state.turn.phase === 'challenge-roll' ||
                  state.turn.phase === 'modify') && <Popup socket={socket} />}

                <ShownCard />
                <ShownCardTop />

                <Hand socket={socket} />

                <HelperText />

                <button
                  className='dev-reset'
                  onClick={() => {
                    socket.emit('reset-state', credentials.roomId);

                    // reload to run useEffect (else playernum breaks for some reason)
                    navigate('/');
                  }}
                >
                  Reset State
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Game;
