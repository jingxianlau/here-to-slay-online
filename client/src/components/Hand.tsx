import React from 'react';
import { AnyCard, CardType } from '../types';
import { getImage } from '../helpers/getImage';
import useClientContext from '../hooks/useClientContext';
import { allowedCard } from '../helpers/allowedCard';
import { dropHand } from '../helpers/dropHand';

interface HandProps {
  showBoard: boolean;
  setShowBoard: React.Dispatch<React.SetStateAction<boolean>>;
}

const Hand: React.FC<HandProps> = ({ showBoard, setShowBoard }) => {
  const {
    state: { val: state },
    showHand,
    allowedCards,
    chosenCard,
    credentials: { roomId, userId },
    shownCard
  } = useClientContext();

  const playCard = (card: AnyCard) => {
    if (!state || !allowedCard(allowedCards.val, card.type)) return;

    switch (state.turn.phase) {
      case 'play':
        if (
          state.turn.player === state.playerNum &&
          (card.type === CardType.hero ||
            card.type === CardType.item ||
            card.type === CardType.magic) &&
          !state.turn.pause &&
          !(
            card.type === CardType.hero &&
            state.board[state.playerNum].heroCards.length >= 5
          )
        ) {
          chosenCard.set(card);
          chosenCard.setShow(true);
          dropHand(showHand, shownCard);
        }
        break;

      case 'challenge':
        if (card.type === CardType.challenge && !state.turn.pause) {
          chosenCard.set(card);
          chosenCard.setShow(true);
          dropHand(showHand, shownCard);
        }
        break;

      case 'modify':
        if (card.type === CardType.modifier) {
          setShowBoard(false);
          shownCard.setLocked(true);
          shownCard.set(null);
          chosenCard.set(card);
          showHand.set(false);
          showHand.setLocked(true);
        }
        break;

      case 'use-effect':
        if (
          state.turn.effect &&
          state.turn.effect.players.some(val => val === state.playerNum)
        ) {
          chosenCard.set(card);
          chosenCard.setShow(true);
          if (!showHand.locked) {
            dropHand(showHand, shownCard);
          }
        }
        break;

      case 'end-turn-discard':
        if (
          state.turn.player === state.playerNum &&
          state.players[state.playerNum].numCards > 7
        ) {
          chosenCard.set(card);
          chosenCard.setShow(true);
          chosenCard.setCustomText('Discard');
          if (!showHand.locked) {
            dropHand(showHand, shownCard);
          }
        }
    }
  };

  return (
    <div
      className='hand-trigger'
      onMouseOver={() => {
        if (!showHand.locked) {
          showHand.set(true);
        }
      }}
      onMouseOut={() => {
        if (!showHand.locked) {
          showHand.set(false);
        }
      }}
    >
      {!showHand.val && !showHand.locked && (
        <>
          <h5>
            <span>Hand</span>
            <span className='material-symbols-outlined arrow-down'>
              keyboard_double_arrow_down
            </span>
          </h5>
        </>
      )}
      <div
        className='bottomMenu'
        style={{ bottom: showHand.val ? 0 : '-30vh' }}
      >
        {state.turn.player === state.playerNum &&
          state.turn.movesLeft === 3 &&
          state.turn.phase === 'play' && (
            <button
              className='danger circular discard'
              onClick={() => {
                chosenCard.setShow(true);
                chosenCard.setCustomText('Redraw');
                if (!showHand.locked) {
                  dropHand(showHand, shownCard);
                }
              }}
            >
              <span className='material-symbols-outlined'>delete_forever</span>
            </button>
          )}

        <div
          className={`hand${
            state.players[state.playerNum].numCards *
              ((23 / 100) * window.innerHeight) >
            (97 / 100) * window.innerWidth
              ? ' cover'
              : ' list'
          }`}
        >
          {state.players[state.playerNum]?.hand.map((card, i) => (
            <div
              key={i}
              onMouseEnter={() => {
                if (!shownCard.locked) {
                  shownCard.set(card);
                  shownCard.setPos('top');
                }
              }}
              onMouseLeave={() => {
                if (!shownCard.locked) {
                  shownCard.set(null);
                  shownCard.setPos(null);
                }
              }}
              className={`img-container${
                state.turn.phase === 'end-turn-discard' &&
                state.turn.player === state.playerNum &&
                allowedCards.val.length > 0 &&
                state.players[state.playerNum].numCards > 7 &&
                !showBoard
                  ? ' cross-md'
                  : ''
              }`}
              onClick={() => {
                if (
                  allowedCard(allowedCards.val, card.type) &&
                  ((card.type === CardType.hero &&
                    state.board[state.playerNum].heroCards.length < 5) ||
                    card.type !== CardType.hero)
                )
                  playCard(card);
              }}
              style={{
                zIndex: 100 - i
              }}
            >
              <img
                src={getImage(card)}
                alt={card.name}
                className={`small-md ${
                  allowedCards.val.length === 5
                    ? 'active'
                    : allowedCard(allowedCards.val, card.type) &&
                      ((card.type === CardType.hero &&
                        state.board[state.playerNum].heroCards.length < 5) ||
                        card.type !== CardType.hero) &&
                      (state.turn.phase === 'challenge' ||
                        state.turn.phase === 'challenge-roll' ||
                        state.turn.phase === 'modify')
                    ? 'active glow'
                    : allowedCard(allowedCards.val, card.type) &&
                      ((card.type === CardType.hero &&
                        state.board[state.playerNum].heroCards.length < 5) ||
                        card.type !== CardType.hero)
                    ? 'active'
                    : 'inactive'
                }`}
                draggable='false'
              />
            </div>
          ))}
          {state.players[state.playerNum]?.hand.length === 0 && (
            <div style={{ marginBottom: '5vh' }}>
              <h2>No Cards :(</h2>
            </div>
          )}
        </div>

        {state.turn.phase === 'use-effect' &&
          state.turn.effect &&
          state.turn.effect.players.some(val => val === state.playerNum) &&
          state.turn.effect.action === 'choose-hand' && (
            <button
              className='circular skip'
              onClick={() => {
                chosenCard.setShow(true);
                chosenCard.setCustomText('Skip');
                if (!showHand.locked) {
                  dropHand(showHand, shownCard);
                }
              }}
            >
              <span className='material-symbols-outlined'>start</span>
            </button>
          )}
      </div>
    </div>
  );
};

export default Hand;
