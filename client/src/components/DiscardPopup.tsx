import React, { useEffect, useState } from 'react';
import useClientContext from '../hooks/useClientContext';
import { AnyCard } from '../types';
import { getImage } from '../helpers/getImage';

interface DiscardPopupProps {
  show: boolean;
  showBoard: boolean;
}

const DiscardPopup: React.FC<DiscardPopupProps> = ({ show, showBoard }) => {
  const {
    state: { val: state },
    shownCard,
    showHand
  } = useClientContext();

  const [discardedCards, setDiscardedCards] = useState<AnyCard[]>([]);

  useEffect(() => {
    if (state.turn.phase === 'end-turn-discard' && show) {
      setDiscardedCards(_ => []);
      for (
        let i = 0;
        i <
        state.turn.toDiscard - (state.players[state.turn.player].numCards - 7);
        i++
      ) {
        setDiscardedCards(arr => [
          ...arr,
          state.mainDeck.discardPile[state.mainDeck.discardPile.length - i - 1]
        ]);
      }
      setDiscardedCards(arr => arr.reverse());
    }
  }, [state.mainDeck.discardPile]);
  useEffect(() => {
    if (state.turn.phase === 'end-turn-discard' && state.turn.phaseChanged) {
      setDiscardedCards(_ => []);
    }
  }, [state.turn.phase, state.turn.phaseChanged]);

  return (
    <div
      className={`discard-cover${show ? ' show' : ' hide'}`}
      style={{
        opacity: show && !showBoard ? 1 : 0,
        top: show && !showBoard ? 0 : '100vh'
      }}
    >
      {!state.turn.effect ? (
        <div className='content'>
          <div className='cards'>
            <h2>
              {discardedCards.length > 0
                ? discardedCards.length === 1
                  ? '1 Card Discarded'
                  : `${discardedCards.length} Cards Discarded`
                : 'No Cards Discarded'}
            </h2>
            <div className='discarded'>
              {discardedCards.length > 0 &&
                discardedCards.map((card, i) => (
                  <div
                    className='img-container'
                    key={i}
                    onMouseEnter={() => {
                      if (show) {
                        shownCard.set(card);
                        if (i + 1 < discardedCards.length / 2) {
                          shownCard.setPos('right');
                        } else {
                          shownCard.setPos('left');
                        }
                        showHand.set(val => --val);
                      }
                    }}
                    onMouseLeave={() => {
                      if (show) {
                        shownCard.set(null);
                        shownCard.setPos(null);
                        showHand.set(val => ++val);
                      }
                    }}
                  >
                    <img
                      src={getImage(card)}
                      alt={card.name}
                      className='small-md'
                      draggable='false'
                    />
                  </div>
                ))}
            </div>
          </div>
          <h1
            style={{
              display: 'flex',
              alignItems: 'center',
              position: 'absolute',
              bottom: '26vh'
            }}
          >
            <span
              style={{
                color:
                  state.players[state.turn.player].numCards > 7
                    ? '#f95151'
                    : '#2eee9b',
                fontSize: '8.5vh',
                marginRight: '1.2vh'
              }}
            >
              {state.players[state.turn.player].numCards}
            </span>{' '}
            / 7
          </h1>
        </div>
      ) : (
        state.turn.effect.active &&
        state.turn.effect.active.num && (
          <div className='effect-container'>
            <div className='top'>
              <div className='img-container'>
                <img
                  src={getImage(state.turn.effect.card)}
                  alt={state.turn.effect.card.name}
                  className='small-lg'
                />
              </div>

              <div className='content'>
                <div className='cards'>
                  <h2>
                    {state.match.players[state.turn.effect.active.num[0]]}
                  </h2>
                  <div className='discarded'>
                    {state.turn.effect.choice &&
                      state.turn.effect.choice.length > 0 &&
                      state.turn.effect.choice.map(
                        (card, i) =>
                          typeof card !== 'number' && (
                            <div
                              className='img-container'
                              key={i}
                              onMouseEnter={() => {
                                if (show) {
                                  shownCard.set(card);
                                  if (i + 1 < discardedCards.length / 2) {
                                    shownCard.setPos('right');
                                  } else {
                                    shownCard.setPos('left');
                                  }
                                  showHand.set(val => --val);
                                }
                              }}
                              onMouseLeave={() => {
                                if (show) {
                                  shownCard.set(null);
                                  shownCard.setPos(null);
                                  showHand.set(val => ++val);
                                }
                              }}
                            >
                              <img
                                src={getImage(card)}
                                alt={card.name}
                                className='small-md'
                                draggable='false'
                              />
                            </div>
                          )
                      )}
                  </div>
                </div>
                {state.turn.effect.choice && (
                  <h1
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      position: 'absolute',
                      bottom: '4vh'
                    }}
                  >
                    <span
                      style={{
                        color:
                          state.turn.effect.choice.length <
                          state.turn.effect.val.min
                            ? '#f95151'
                            : '#2eee9b',
                        fontSize: '8.5vh',
                        marginRight: '1.2vh'
                      }}
                    >
                      {state.turn.effect.choice.length}
                    </span>{' '}
                    / {state.turn.effect.val.min}
                  </h1>
                )}
              </div>

              <h1 style={{ marginRight: '9vh' }}>
                {state.turn.effect.purpose}
              </h1>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default DiscardPopup;
