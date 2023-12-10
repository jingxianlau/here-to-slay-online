import React, { useEffect, useState } from 'react';
import { AnyCard, CardType } from '../types';
import { getImage } from '../helpers/getImage';
import useClientContext from '../hooks/useClientContext';
import { allowedCard } from '../helpers/allowedCard';

interface HandProps {
  setShowBoard: React.Dispatch<React.SetStateAction<boolean>>;
}

const Hand: React.FC<HandProps> = ({ setShowBoard }) => {
  const {
    state: { val: state },
    showHand,
    allowedCards,
    chosenCard,
    shownCard
  } = useClientContext();

  const [prevHand, setPrevHand] = useState<AnyCard[] | undefined>();
  const [solidCards, setSolidCards] = useState<boolean[]>([]);

  // fixes onenter triggering twice for some reason
  const [trigger, setTrigger] = useState(false);

  useEffect(() => {
    if (!prevHand) {
      setPrevHand(_ => {
        setSolidCards(_ => []);
        for (let i = 0; i < state.players[state.playerNum].hand.length; i++) {
          setSolidCards(arr => [...arr, true]);
        }
        return state.players[state.playerNum].hand;
      });
      return;
    }

    const currHand = state.players[state.playerNum].hand;
    if (prevHand) {
      if (currHand.length > prevHand.length) {
        showHand.set(val => ++val);
        showHand.setLocked(val => ++val);
        setTimeout(() => {
          showHand.set(val => --val);
          showHand.setLocked(val => --val);
        }, (currHand.length - prevHand.length) * 450 + 250);

        setPrevHand(_ => currHand);

        setSolidCards([]);
        for (let i = 0; i < currHand.length; i++) {
          setSolidCards(arr => [...arr, i < prevHand.length]);
        }

        let i = prevHand.length;
        let int = setInterval(() => {
          setSolidCards(arr => {
            return arr.map((_, index) => index < i);
          });
          if (i === currHand.length) {
            clearInterval(int);
          } else i++;
        }, 250);
      } else if (currHand < prevHand) {
        showHand.set(val => ++val);
        showHand.setLocked(val => ++val);
        setTimeout(() => {
          showHand.set(val => --val);
          showHand.setLocked(val => --val);
        }, (prevHand.length - currHand.length) * 450 + 250);

        setSolidCards([]);
        let cards: number[] = [];
        for (let i = 0; i < prevHand.length; i++) {
          const id = prevHand[i].id;
          if (!id) return;
          if (!currHand.some(val => val.id === id)) {
            cards.push(i);
          }
          setSolidCards(arr => [...arr, true]);
        }

        let i = -1;
        let int = setInterval(() => {
          if (++i === cards.length) {
            setSolidCards([]);
            for (let i = 0; i < currHand.length; i++) {
              setSolidCards(arr => [...arr, true]);
            }
            setPrevHand(_ => currHand);
            clearInterval(int);
            return;
          }

          setSolidCards(arr =>
            arr.map((val, index) => (index !== cards[i] ? val : false))
          );
        }, 250);
      }
    }
  }, [state.players[state.playerNum].hand]);

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
        }
        break;

      case 'challenge':
        if (card.type === CardType.challenge && !state.turn.pause) {
          chosenCard.set(card);
          chosenCard.setShow(true);
        }
        break;

      case 'modify':
        if (card.type === CardType.modifier) {
          setShowBoard(false);
          shownCard.setLocked(true);
          shownCard.set(null);
          chosenCard.set(card);
        }
        break;

      case 'use-effect':
        if (
          state.turn.effect &&
          state.turn.effect.players.some(val => val === state.playerNum)
        ) {
          chosenCard.set(card);
          chosenCard.setShow(true);
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
        }
    }
  };

  return (
    <div
      className='hand-trigger'
      onMouseEnter={() => {
        if (showHand.locked <= 0 && !trigger) {
          showHand.set(val => ++val);
          setTrigger(_ => true);
        }
      }}
      onMouseLeave={() => {
        if (showHand.locked <= 0 && trigger) {
          showHand.set(val => --val);
          setTrigger(_ => false);
        }
      }}
    >
      {showHand.val <= 0 && showHand.locked <= 0 && (
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
        style={{ bottom: showHand.val > 0 ? 0 : '-30vh' }}
      >
        {state.turn.player === state.playerNum &&
          state.turn.movesLeft === 3 &&
          state.turn.phase === 'play' && (
            <button
              className='danger circular discard'
              onClick={() => {
                chosenCard.setShow(true);
                chosenCard.setCustomText('Redraw');
                chosenCard.setCustomCenter('delete_forever');
              }}
            >
              <span className='material-symbols-outlined'>delete_forever</span>
            </button>
          )}

        <div
          className={`hand${
            state.players[state.playerNum].numCards *
              ((21 / 100) * window.innerHeight) >
            (97 / 100) * window.innerWidth
              ? ' cover'
              : ' list'
          }`}
        >
          {prevHand &&
            prevHand.map((card, i) => (
              <div
                key={card.id}
                onMouseEnter={() => {
                  if (solidCards[i] && !shownCard.locked) {
                    shownCard.set(card);
                    shownCard.setPos('top');
                  }
                }}
                onMouseLeave={() => {
                  if (solidCards[i] && !shownCard.locked) {
                    shownCard.set(null);
                    shownCard.setPos(null);
                  }
                }}
                className='img-container'
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
                  style={
                    solidCards[i]
                      ? {}
                      : {
                          marginBottom: '20vh',
                          marginLeft: '-9.418vh',
                          marginRight: '-9.418vh',
                          opacity: 0
                        }
                  }
                  draggable='false'
                />
              </div>
            ))}
          {state.players[state.playerNum]?.hand.length === 0 &&
            prevHand?.length === 0 && (
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
                chosenCard.setCustomCenter('start');
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
