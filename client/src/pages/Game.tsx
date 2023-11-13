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
import DiscardPile from '../components/DiscardPile';

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
  const [activeDice, setActiveDice] = useState<0 | 1>(0);
  const [showBoard, setShowBoard] = useState(false);
  const [showDiscardPile, setShowDiscardPile] = useState(false);

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
        showHand.setLocked(false);
        showHelperText.setShowText(false);
        showHelperText.set(false);

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
              showText(showHelperText, 'Draw', 500);
              socket.emit('draw-five', credentials.roomId, credentials.userId);
              showHand.set(true);
              setTimeout(() => {
                showHand.set(false);
              }, 1200);
            } else {
              if (state.turn.phaseChanged) {
                showText(showHelperText, 'Draw');
              }
            }
            break;

          case 'challenge':
            setActiveDice(0);
            showPopup.set(true);
            if (!showBoard) {
              shownCard.setLocked(true);
              shownCard.setPos(null);
              shownCard.set(null);
            }
            break;

          case 'challenge-roll':
            showPopup.set(true);
            showRoll.set(false);
            if (!showBoard) {
              shownCard.setLocked(true);
              shownCard.setPos(null);
              shownCard.set(null);
            }
            if (state.dice.defend && state.dice.defend.total > 0) {
              setActiveDice(1);
            }

            if (state.dice.main.total > 0) {
              setTimeout(() => {
                showRoll.set(true);
              }, 1000);
              setTimeout(() => {
                if (state.dice.defend?.total) {
                  showRoll.set(false);
                }
                hasRolled.set(false);

                if (
                  state.dice.main.total > 0 &&
                  state.dice.defend?.total === 0
                ) {
                  setActiveDice(1);
                }
              }, 3000);
            }
            break;

          case 'modify':
            showPopup.set(true);
            if (!showBoard) {
              shownCard.setLocked(true);
              shownCard.setPos(null);
              shownCard.set(null);
            }

            if (!state.mainDeck.preparedCard) return;

            if (state.match.isReady.every(val => val === true)) {
              allowedCards.set([CardType.modifier]);
              setActiveDice(0);
            } else if (state.match.isReady.every(val => val === null)) {
              allowedCards.set([CardType.modifier]);
              setActiveDice(1);
            } else if (state.match.isReady[state.playerNum] === false) {
              allowedCards.set([]);
            } else {
              allowedCards.set([CardType.modifier]);
            }

            if (state.mainDeck.preparedCard.successful) {
              showText(showHelperText, 'Card Success');
            } else if (state.mainDeck.preparedCard.successful === false) {
              showText(showHelperText, 'Card Failed');
            }
            break;

          case 'play':
            showPopup.set(false);
            shownCard.setLocked(false);
            allowedCards.set([]);

            if (state.turn.player === state.playerNum) {
              allowedCards.set([CardType.hero, CardType.item, CardType.magic]);
            }

            if (state.turn.phaseChanged) {
              showText(showHelperText, 'Play');
            }
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

                <MainBoard
                  socket={socket}
                  setShowDiscardPile={setShowDiscardPile}
                />

                <Popup
                  socket={socket}
                  activeDice={activeDice}
                  setActiveDice={setActiveDice}
                  showBoard={showBoard}
                />

                <DiscardPile
                  showDiscardPile={showDiscardPile}
                  setShowDiscardPile={setShowDiscardPile}
                />

                <ShownCard />
                <ShownCardTop />

                <Hand socket={socket} />

                <HelperText />

                <div
                  className={`main-button pass ${
                    state.turn.player === state.playerNum &&
                    (state.turn.phase === 'draw' || state.turn.phase === 'play')
                      ? 'show'
                      : 'hide'
                  }`}
                  onClick={() => {
                    if (
                      state.turn.phase === 'draw' ||
                      state.turn.phase === 'play'
                    ) {
                      socket.emit(
                        'pass',
                        credentials.roomId,
                        credentials.userId
                      );
                    }
                  }}
                >
                  <span className='material-symbols-outlined'>forward</span>
                </div>
                <div
                  className={`main-button help show`}
                  onMouseEnter={() => {
                    shownCard.set({ name: 'help', type: CardType.help });
                    shownCard.setPos('top');
                  }}
                  onMouseLeave={() => {
                    shownCard.set(null);
                    shownCard.setPos(null);
                  }}
                >
                  <span className='material-symbols-outlined'>help</span>
                </div>
                <div
                  className={`show-board-trigger ${
                    state.turn.phase === 'attack' ||
                    state.turn.phase === 'challenge' ||
                    state.turn.phase === 'challenge-roll' ||
                    state.turn.phase === 'modify'
                      ? 'show'
                      : 'hide'
                  }`}
                  onClick={() => {
                    if (
                      state.turn.phase === 'attack' ||
                      state.turn.phase === 'challenge' ||
                      state.turn.phase === 'challenge-roll' ||
                      state.turn.phase === 'modify'
                    ) {
                      setShowBoard(val => !val);
                      shownCard.setLocked(val => !val);
                    }
                  }}
                >
                  <span className='material-symbols-outlined'>flip</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Game;
