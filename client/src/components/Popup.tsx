import React, { useEffect } from 'react';
import { CardType } from '../types';
import { Socket } from 'socket.io-client';
import { getImage } from '../helpers/getImage';
import Dice from './Dice';
import useClientContext from '../hooks/useClientContext';
import { setTimer, showText } from '../helpers/showText';

const Popup: React.FC<{ socket: Socket }> = ({ socket }) => {
  const {
    state: { val: state },
    playerNum,
    credentials: { roomId, userId },
    showHand,
    shownCard,
    allowedCards,
    showPopup,
    timer,
    showHelperText
  } = useClientContext();

  const preppedCard = state.mainDeck.preparedCard;

  useEffect(() => {
    if (showPopup.val) {
      showHand.setLocked(true);
      showHand.set(true);
      shownCard.setLocked(true);
      setTimeout(() => {
        showHand.setLocked(false);
        showHand.set(false);
      }, 1200);

      if (state.turn.player === playerNum.val) {
        allowedCards.set([]);
      }

      if (state.turn.phase === 'challenge') {
        if (state.mainDeck.preparedCard?.successful) {
          allowedCards.set([]);
          showText(showHelperText, 'No Challenge: Card Played', 500);
        } else {
          allowedCards.set([CardType.challenge]);

          showText(showHelperText, 'Challenge Card?');
          console.log(state.turn.player, playerNum.val);
          if (state.turn.player === playerNum.val) {
            console.log('hi');
            timer.setTargetAchieved(() => {
              socket.emit('challenge', roomId, userId, false);
            });
          }
          setTimer(timer);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPopup.val]);

  return (
    <div className={'popup'} style={{ opacity: showPopup.val ? 1 : 0 }}>
      <div className='popup_summary'></div>

      {preppedCard &&
        (state.turn.phase === 'challenge' ? (
          <div className='challenge-popup'>
            <div className='img-container left'>
              <img
                src={getImage(preppedCard.card)}
                alt={preppedCard.card.name}
                className='small-lg'
                draggable='false'
              />
            </div>

            <div
              className={`img-container ${
                state.turn.player === playerNum.val ? '' : 'cross'
              }`}
            >
              <img
                src='./assets/challenge/challenge.png'
                alt='challenge'
                className='small-md center-img'
                draggable='false'
                onClick={() => socket.emit('challenge', roomId, userId, false)}
              />
            </div>

            <div className='side-modifier'></div>
          </div>
        ) : state.turn.phase === 'challenge-roll' ||
          state.turn.phase === 'modify' ? (
          <div className='challenge-roll-popup'>
            <img
              src={getImage(preppedCard.card)}
              alt={preppedCard.card.name}
              className='small-card glow'
              draggable='false'
            />
            <div className='dice-box'>
              {!state.dice.defend ? (
                <Dice
                  roll1={state.dice.main.roll[0]}
                  roll2={state.dice.main.roll[1]}
                />
              ) : (
                <Dice
                  roll1={state.dice.defend.roll[0]}
                  roll2={state.dice.defend.roll[1]}
                />
              )}
            </div>
            <div className='side-modifier'></div>
          </div>
        ) : (
          <></>
        ))}
    </div>
  );
};

export default Popup;
