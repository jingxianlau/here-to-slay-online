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
import EffectPopup from '../components/EffectPopup';

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
  const [showEffectPopup, setShowEffectPopup] = useState(false);

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
            if (state.match.startRolls.rolls[state.turn.player] !== 0) {
              // new roll
              setTimeout(() => {
                setRollSummary([]);
                for (let i = 0; i < state.match.startRolls.inList.length; i++) {
                  let num = state.match.startRolls.inList[i];
                  if (state.match.startRolls.rolls[num] !== 0) {
                    setRollSummary(e => [...e, num]);
                  }
                }
                showRoll.set(true);
              }, 1000);
              setTimeout(() => {
                showRoll.set(false);
                hasRolled.set(false);
              }, 3000);
            } else {
              // new round
              setRollSummary([]);
              for (let i = 0; i < state.match.startRolls.inList.length; i++) {
                let num = state.match.startRolls.inList[i];
                if (state.match.startRolls.rolls[num] !== 0) {
                  setRollSummary(e => [...e, num]);
                }
              }
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

          case 'use-effect':
            if (!state.turn.effect) return;
            showHand.setLocked(false);
            shownCard.setLocked(true);
            if (
              state.turn.effect.allowedCards &&
              state.turn.effect.players.some(val => val === state.playerNum)
            ) {
              allowedCards.set(state.turn.effect.allowedCards);
            } else {
              allowedCards.set([]);
            }

            if (
              state.turn.effect.showHand &&
              (state.turn.effect.choice?.some(val => val === state.playerNum) ||
                state.turn.player === state.playerNum)
            ) {
              showHand.set(true);
              setTimeout(() => showHand.set(false), 1200);
            } else if (state.turn.effect.showBoard) {
            }

            if (state.turn.phaseChanged) {
              if (state.turn.effect.card.type === CardType.hero) {
                showText(showHelperText, 'Hero Ability');
              } else if (state.turn.effect.card.type === CardType.magic) {
                showText(showHelperText, 'Magic Card');
              } else {
                showText(showHelperText, 'Monster Punishment');
              }
            }

            switch (state.turn.effect.action) {
              case 'choose-discard':
                setShowDiscardPile(true);
                break;
              case 'choose-hand':
                showHand.setLocked(true);
                showHand.set(true);
                shownCard.setLocked(false);
                setShowEffectPopup(true);
                break;
              case 'choose-other-hand':
                setShowEffectPopup(true);
                break;
              case 'choose-player':
                setShowEffectPopup(true);
                break;
              default:
                setShowEffectPopup(false);
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

  return (
    <>
      {credentials && !isEmpty(state) && socket && (
        <div
          onClick={
            state.turn.isRolling && state.turn.phase === 'start-roll'
              ? () => {
                  if (
                    !state ||
                    !socket ||
                    hasRolled.val ||
                    state.turn.player !== state.playerNum
                  )
                    return;

                  hasRolled.set(true);
                  socket.emit(
                    'start-roll',
                    credentials.roomId,
                    credentials.userId
                  );
                }
              : () => {}
          }
        >
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
                <EffectPopup
                  socket={socket}
                  show={showEffectPopup}
                  showBoard={showBoard}
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
                    state.turn.phase === 'modify' ||
                    state.turn.phase === 'use-effect'
                      ? 'show'
                      : 'hide'
                  }`}
                  onClick={() => {
                    if (
                      state.turn.phase === 'attack' ||
                      state.turn.phase === 'challenge' ||
                      state.turn.phase === 'challenge-roll' ||
                      state.turn.phase === 'modify' ||
                      state.turn.phase === 'use-effect'
                    ) {
                      setShowBoard(val => !val);

                      if (
                        state.turn.effect &&
                        state.turn.effect.action === 'choose-hand'
                      ) {
                        if (showBoard) {
                          showHand.set(true);
                          showHand.setLocked(true);
                        } else {
                          showHand.set(false);
                          showHand.setLocked(false);
                        }
                      } else {
                        shownCard.setLocked(val => !val);
                      }
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
