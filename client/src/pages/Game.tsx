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
import MenuButtons from '../components/MenuButtons';
import HelpCards from '../components/HelpCards';

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
            allowedCards.set([]);

            if (
              newState.players[newState.playerNum]?.hand.length === 0 &&
              newState.turn.player === newState.playerNum
            ) {
              // Get 5 Cards
              showText(showHelperText, 'Draw', 500);
              socket.emit('draw-five', credentials.roomId, credentials.userId);
            } else {
              if (newState.turn.phaseChanged) {
                showText(showHelperText, 'Draw');
              }
            }
            break;

          case 'challenge':
            setActiveDice(0);
            showPopup.set(true);
            showHand.setLocked(false);
            if (!showBoard) {
              shownCard.setLocked(true);
              shownCard.setPos(null);
              shownCard.set(null);
            }
            break;

          case 'challenge-roll':
            showPopup.set(true);
            showRoll.set(false);
            showHand.setLocked(false);
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

          case 'modify':
            showPopup.set(true);
            showHand.setLocked(false);
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

            if (newState.mainDeck.preparedCard.successful) {
              showText(showHelperText, 'Card Success');
            } else if (newState.mainDeck.preparedCard.successful === false) {
              showText(showHelperText, 'Card Failed');
            }
            break;

          case 'play':
            showPopup.set(false);
            showHand.setLocked(false);
            shownCard.setLocked(false);
            allowedCards.set([]);

            if (newState.turn.player === newState.playerNum) {
              allowedCards.set([CardType.hero, CardType.item, CardType.magic]);
            }

            if (newState.turn.phaseChanged) {
              showText(showHelperText, 'Play');
            }
            break;

          case 'use-effect':
            if (!newState.turn.effect) return;
            showHand.setLocked(false);
            shownCard.setLocked(true);
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

            if (newState.turn.phaseChanged) {
              if (newState.turn.effect.card.type === CardType.hero) {
                showText(showHelperText, 'Hero Ability');
              } else if (newState.turn.effect.card.type === CardType.magic) {
                showText(showHelperText, 'Magic Card');
              } else {
                showText(showHelperText, 'Monster Punishment');
              }
            }

            switch (newState.turn.effect.action) {
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
                <EffectPopup
                  socket={socket}
                  show={showEffectPopup}
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

                <MenuButtons
                  socket={socket}
                  showBoard={showBoard}
                  setShowBoard={setShowBoard}
                  setShowHelp={setShowHelp}
                />

                <HelpCards showHelp={showHelp} />
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Game;
