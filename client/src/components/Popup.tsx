import React, { useEffect } from 'react';
import { CardType } from '../types';
import { Socket } from 'socket.io-client';
import { getImage } from '../helpers/getImage';
import Dice from './Dice';
import TopMenu from './TopMenu';
import useClientContext from '../hooks/useClientContext';

const Popup: React.FC<{ socket: Socket }> = ({ socket }) => {
  const {
    state: { val: state, set: setState },
    playerNum,
    credentials: { roomId, userId },
    showHand,
    shownCard,
    allowedCards,
    showPopup,
    timer
  } = useClientContext();

  const preppedCard = state.mainDeck.preparedCard;

  useEffect(() => {
    if (showPopup.val) {
      showHand.setLocked(true);
      showHand.set(true);
      shownCard.setLocked(true);

      if (state.turn.player === playerNum.val) {
        allowedCards.set([]);
      } else if (state.turn.phase === 'challenge') {
        allowedCards.set([CardType.challenge]);

        timer.onEnd(() => {
          socket.emit('challenge', roomId, userId, false);
        });
        timer.settings.start();
      }
    }
  }, [showPopup.val]);

  return (
    <div className={'popup'} style={{ opacity: showPopup.val ? 1 : 0 }}>
      <div className='popup_summary'></div>

      {preppedCard &&
        (state.turn.phase === 'challenge' ? (
          <div className='challenge-popup'>
            <img
              src={getImage(preppedCard.card)}
              className='small-lg'
              draggable='false'
            />

            <div className='center'>
              <TopMenu />
              <img
                src='./assets/challenge/challenge.png'
                className='small-md center-img'
                draggable='false'
              />
            </div>

            <div className='side-modifier'></div>
          </div>
        ) : state.turn.phase === 'challenge-roll' ||
          state.turn.phase === 'modify' ? (
          <div className='challenge-roll-popup'>
            <img
              src={getImage(preppedCard.card)}
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
