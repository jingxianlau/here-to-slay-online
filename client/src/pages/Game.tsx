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

const Game: React.FC = () => {
  const navigate = useNavigate();
  const {
    credentials,
    playerNum,
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
        (successful: boolean, num: number) => {
          if (!successful) {
            localStorage.removeItem('credentials');
            navigate('/');
          } else {
            if (num !== -1) {
              playerNum.set(num);
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
        switch (state.turn.phase) {
          case 'start-roll':
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
            }
            break;

          case 'draw':
            showPopup.set(false);
            allowedCards.set([]);

            showHelperText.setText('Draw Card');
            showHelperText.set(true);
            showHelperText.setShowText(true);
            setTimeout(() => {
              showHelperText.setShowText(false);
            }, 2000);

            if (
              state.players[playerNum.val]?.hand.length === 0 &&
              state.turn.player === playerNum.val
            ) {
              // Get 5 Cards
              socket.emit('draw-five', credentials.roomId, credentials.userId);
              showHand.set(true);
              setTimeout(() => {
                showHand.set(false);
              }, 1000);
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
            allowedCards.set([CardType.hero, CardType.item, CardType.magic]);
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
      state.turn.player !== playerNum.val
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
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Game;
