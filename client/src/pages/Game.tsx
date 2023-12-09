import React, { useEffect, useState } from 'react';
import { isEmpty } from 'lodash';
import '../style/game.css';
import '../style/index.css';
import { useNavigate } from 'react-router-dom';
import { Socket, io } from 'socket.io-client';
import { CardType, GameState, allCards } from '../types';
import StartRoll from '../components/StartRoll';
import MainBoard from '../components/MainBoard';
import Hand from '../components/Hand';
import ShownCard from '../components/ShownCard';
import ChallengePopup from '../components/ChallengePopup';
import useClientContext from '../hooks/useClientContext';
import HelperText from '../components/HelperText';
import ShownCardTop from '../components/ShownCardTop';
import TopMenu from '../components/TopMenu';
import { showText } from '../helpers/showText';
import DiscardPile from '../components/DiscardPile';
import EffectPopup from '../components/EffectPopup';
import MenuButtons from '../components/MenuButtons';
import HelpCards from '../components/HelpCards';
import { isCard } from '../helpers/isCard';
import DiscardPopup from '../components/DiscardPopup';
import ConfirmPopup from '../components/ConfirmPopup';
import RollPopup from '../components/RollPopup';
import { meetsRollRequirements } from '../helpers/meetsRequirements';
import EndPage from '../components/EndPage';

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

  const [showHelp, setShowHelp] = useState(false);
  const [rollSummary, setRollSummary] = useState<number[]>([]);
  const [activeDice, setActiveDice] = useState<0 | 1>(0);
  const [showBoard, setShowBoard] = useState(false);

  const [showDiscardPile, setShowDiscardPile] = useState(false);
  const [showEffectPopup, setShowEffectPopup] = useState(false);
  const [showDiscardPopup, setShowDiscardPopup] = useState(false);

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

      socket.on('game-state', (newState: GameState) => {
        console.log(newState);

        setState(newState);
        if (newState.turn.phase !== 'end-game') setShowBoard(_ => false);

        /* PHASES */
        switch (newState.turn.phase) {
          case 'start-roll':
            if (newState.match.startRolls.rolls[newState.turn.player] !== 0) {
              // new roll
              setTimeout(() => {
                setRollSummary([]);
                for (
                  let i = 0;
                  i < newState.match.startRolls.inList.length;
                  i++
                ) {
                  let num = newState.match.startRolls.inList[i];
                  if (newState.match.startRolls.rolls[num] !== 0) {
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
              for (
                let i = 0;
                i < newState.match.startRolls.inList.length;
                i++
              ) {
                let num = newState.match.startRolls.inList[i];
                if (newState.match.startRolls.rolls[num] !== 0) {
                  setRollSummary(e => [...e, num]);
                }
              }
              hasRolled.set(false);
              showRoll.set(false);
            }
            break;

          case 'draw':
            showPopup.set(false);
            setShowEffectPopup(false);
            setShowDiscardPopup(false);
            showHand.setLocked(0);
            showHand.set(0);
            shownCard.setLocked(false);
            shownCard.set(null);
            shownCard.setPos(null);
            allowedCards.set([]);

            if (newState.turn.phaseChanged) {
              showText(showHelperText, 'Draw');
            }
            break;

          case 'challenge':
            setActiveDice(0);
            showPopup.set(true);
            showHand.setLocked(0);
            showHand.set(0);
            if (!showBoard) {
              shownCard.setLocked(true);
              shownCard.setPos(null);
              shownCard.set(null);
            }
            break;

          case 'challenge-roll':
            setActiveDice(0);
            showPopup.set(true);
            showRoll.set(false);
            showHand.setLocked(0);
            if (!showBoard) {
              shownCard.setLocked(true);
              shownCard.setPos(null);
              shownCard.set(null);
            }
            if (newState.dice.defend && newState.dice.defend.total > 0) {
              setActiveDice(1);
            }

            if (newState.dice.main.total > 0) {
              setTimeout(() => {
                showRoll.set(true);
              }, 1000);
              setTimeout(() => {
                if (newState.dice.defend?.total) {
                  showRoll.set(false);
                }
                hasRolled.set(false);

                if (
                  newState.dice.main.total > 0 &&
                  newState.dice.defend?.total === 0
                ) {
                  setActiveDice(1);
                }
              }, 3000);
            }
            break;

          case 'attack-roll':
            showRoll.set(false);
            showHand.setLocked(0);
            if (!showBoard) {
              shownCard.setLocked(true);
              shownCard.setPos(null);
              shownCard.set(null);
            }

            if (newState.dice.main.total > 0) {
              setTimeout(() => {
                showRoll.set(true);
              }, 1000);
              setTimeout(() => {
                hasRolled.set(false);
              }, 3000);
            }
            break;

          case 'use-effect-roll':
            showRoll.set(false);
            showHand.setLocked(0);
            if (!showBoard) {
              shownCard.setLocked(true);
              shownCard.setPos(null);
              shownCard.set(null);
            }

            if (newState.dice.main.total > 0) {
              setTimeout(() => {
                showRoll.set(true);
              }, 1000);
              setTimeout(() => {
                hasRolled.set(false);
              }, 3000);
            }
            break;

          case 'modify':
            showPopup.set(true);
            showHand.setLocked(0);
            if (!showBoard) {
              shownCard.setLocked(true);
              shownCard.setPos(null);
              shownCard.set(null);
            }

            if (!newState.mainDeck.preparedCard) return;

            if (newState.match.isReady.every(val => val === true)) {
              allowedCards.set([CardType.modifier]);
              setActiveDice(0);
            } else if (newState.match.isReady.every(val => val === null)) {
              allowedCards.set([CardType.modifier]);
              setActiveDice(1);
            } else if (newState.match.isReady[newState.playerNum] === false) {
              allowedCards.set([]);
            } else {
              allowedCards.set([CardType.modifier]);
            }

            if (newState.dice.defend) {
              if (newState.mainDeck.preparedCard.successful) {
                showText(showHelperText, 'Card Success');
              } else if (newState.mainDeck.preparedCard.successful === false) {
                showText(showHelperText, 'Card Failed');
              }
            } else {
              if (newState.mainDeck.preparedCard.card.type === CardType.hero) {
                if (newState.mainDeck.preparedCard.successful === false) {
                  showText(showHelperText, 'Ability Failed');
                }
              } else if (
                newState.mainDeck.preparedCard.card.type === CardType.large
              ) {
                if (newState.mainDeck.preparedCard.successful) {
                  showText(showHelperText, 'Monster Slain');
                } else if (
                  !meetsRollRequirements(
                    'fail',
                    newState.mainDeck.preparedCard.card,
                    newState.dice.main.total
                  ) &&
                  newState.mainDeck.preparedCard.successful === false
                ) {
                  showText(showHelperText, 'Attack Failed');
                }
              }
            }
            break;

          case 'play':
            showPopup.set(false);
            setShowEffectPopup(false);
            showHand.setLocked(0);
            shownCard.setLocked(false);
            allowedCards.set([]);

            if (
              newState.turn.player === newState.playerNum &&
              !newState.turn.pause &&
              newState.turn.movesLeft
            ) {
              allowedCards.set([CardType.hero, CardType.magic]);
              if (
                newState.board.some(val => val.heroCards.some(val => !val.item))
              ) {
                allowedCards.set(val => [...val, CardType.item]);
              }
            }

            if (
              newState.turn.pause &&
              newState.mainDeck.preparedCard &&
              (newState.mainDeck.preparedCard.card.type === CardType.magic ||
                newState.mainDeck.preparedCard.card.type === CardType.item)
            ) {
              shownCard.setLocked(true);
              shownCard.setPos('center');
              shownCard.set(newState.mainDeck.preparedCard.card);
            }
            if (newState.turn.pause) {
              showHand.set(0);
              showHand.setLocked(1);
            }

            if (newState.turn.phaseChanged) {
              showText(showHelperText, 'Play');
            }
            break;

          case 'choose-hero':
            showPopup.set(false);
            if (newState.turn.player === newState.playerNum) {
              showHand.setLocked(1);
              showHand.set(0);
            }
            shownCard.setLocked(false);
            shownCard.set(null);
            shownCard.setPos(null);
            allowedCards.set([]);
            if (newState.turn.phaseChanged) {
              showText(showHelperText, 'Place Item');
            }
            break;

          case 'use-effect':
            showPopup.set(false);
            if (!newState.turn.effect) return;
            showHand.setLocked(0);
            if (!showBoard) {
              shownCard.setLocked(true);
              shownCard.setPos(null);
              shownCard.set(null);
            }
            if (
              newState.turn.effect.allowedCards &&
              newState.turn.effect.players.some(
                val => val === newState.playerNum
              )
            ) {
              allowedCards.set(newState.turn.effect.allowedCards);
            } else {
              allowedCards.set([]);
            }

            let timeout = false;
            if (newState.turn.phaseChanged) {
              if (newState.turn.effect.card.type === CardType.hero) {
                showText(showHelperText, 'Hero Ability');
              } else if (newState.turn.effect.card.type === CardType.magic) {
                showText(showHelperText, 'Magic Card');
              } else {
                showText(showHelperText, 'Monster Punishment');
              }
              timeout = true;
            }

            setTimeout(
              () => {
                if (newState.turn.effect) {
                  switch (newState.turn.effect.action) {
                    case 'choose-discard':
                      break;
                    case 'choose-hand':
                      showHand.setLocked(val => ++val);
                      showHand.set(val => ++val);
                      shownCard.setLocked(false);
                      setShowEffectPopup(true);

                      if (newState.turn.effect.choice !== null) {
                        if (newState.turn.effect.choice[0] === 0) {
                          showText(showHelperText, 'No Card Picked');
                        } else if (isCard(newState.turn.effect.choice[0])) {
                          setShowEffectPopup(false);
                          shownCard.set(newState.turn.effect.choice[0]);
                          shownCard.setPos('center');
                          shownCard.setLocked(true);
                        }
                      }
                      break;
                    case 'choose-other-hand-hide':
                      setShowEffectPopup(true);
                      showHand.setLocked(1);
                      showHand.set(0);
                      break;
                    case 'choose-other-hand-show':
                      setShowEffectPopup(true);
                      showHand.set(0);
                      break;
                    case 'draw':
                      if (newState.turn.effect) {
                        showText(showHelperText, newState.turn.effect.purpose);
                      }
                      showHand.set(0);
                      break;
                    default:
                      setShowEffectPopup(false);
                      showHand.set(0);
                      shownCard.setLocked(false);
                  }
                }
              },
              timeout ? 1200 : 0
            );
            break;

          case 'end-turn-discard':
            setShowDiscardPopup(true);
            allowedCards.set([]);

            if (newState.turn.phaseChanged) {
              showText(showHelperText, 'Discard');
            }

            if (!showBoard) {
              showHand.set(val => ++val);
              showHand.setLocked(val => ++val);
            }
            if (
              newState.turn.player === newState.playerNum &&
              newState.players[newState.playerNum].numCards > 7
            ) {
              allowedCards.set(allCards);
              if (!newState.turn.phaseChanged) {
                shownCard.set(null);
              }
            }
            break;

          case 'end-game':
            showPopup.set(false);
            setShowEffectPopup(false);
            showHand.setLocked(val => --val);
            shownCard.setLocked(false);
            if (showBoard) {
              setShowBoard(true);
            }
            allowedCards.set([]);
            localStorage.removeItem('credentials');

            if (180 - newState.match.startRolls.maxVal <= 0) {
              navigate('/');
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

                <DiscardPile
                  showDiscardPile={showDiscardPile}
                  setShowDiscardPile={setShowDiscardPile}
                />
                <EffectPopup
                  socket={socket}
                  show={showEffectPopup}
                  showBoard={showBoard}
                />
                <DiscardPopup show={showDiscardPopup} showBoard={showBoard} />
                <ChallengePopup
                  socket={socket}
                  activeDice={activeDice}
                  setActiveDice={setActiveDice}
                  showBoard={showBoard}
                />
                <RollPopup socket={socket} showBoard={showBoard} />

                <ShownCard />
                <ShownCardTop />

                <Hand setShowBoard={setShowBoard} />

                <HelperText />

                <MenuButtons
                  showBoard={showBoard}
                  setShowBoard={setShowBoard}
                  setShowHelp={setShowHelp}
                />

                <EndPage showBoard={showBoard} />

                <HelpCards showHelp={showHelp} />

                <ConfirmPopup socket={socket} />
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Game;
