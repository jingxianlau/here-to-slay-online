import React from 'react';
import { CardType, LeaderCard } from '../types';
import { getImage } from '../helpers/getImage';
import useClientContext from '../hooks/useClientContext';

interface PlayerBoardProps {
  playerNum: number;
  col: number;
}

const PlayerBoard: React.FC<PlayerBoardProps> = ({ playerNum, col }) => {
  const {
    state: { val: state },
    shownCard,
    chosenCard
  } = useClientContext();

  return state.board[playerNum].largeCards.length > 0 ? (
    <div
      className={`mat ${
        (state.board[playerNum].largeCards[0] as LeaderCard).class
      } ${
        playerNum === state.turn.player && state.turn.phase !== 'choose-hero'
          ? 'active'
          : 'inactive'
      }`}
    >
      <div className='background'></div>
      <div className='cards'>
        <div className='top-row'>
          {state.board[playerNum].heroCards.map(card => (
            <div
              className={`small ${
                card.item && `item-attached ${card.item.category}`
              }`}
              key={card.id}
              onMouseEnter={() => {
                if (!shownCard.locked) {
                  shownCard.set(card);
                  shownCard.setPos(col === 0 ? 'right' : 'left');
                }
              }}
              onMouseLeave={() => {
                if (!shownCard.locked) {
                  shownCard.set(null);
                  shownCard.setPos(null);
                }
              }}
              onClick={() => {
                if (state.turn.player === state.playerNum) {
                  if (
                    (card.freeUse || state.turn.movesLeft > 0) &&
                    !state.turn.pause &&
                    state.turn.phase === 'play' &&
                    !card.abilityUsed &&
                    state.playerNum === playerNum
                  ) {
                    chosenCard.set(card);
                    chosenCard.setShow(true);
                    chosenCard.setCustomText('Ability');
                  } else if (state.turn.phase === 'choose-hero' && !card.item) {
                    chosenCard.set(card);
                    chosenCard.setShow(true);
                    chosenCard.setCustomText('Select');
                  }
                }
              }}
              style={{
                filter:
                  state.turn.phase === 'choose-hero' &&
                  state.turn.player === state.playerNum &&
                  card.item
                    ? 'brightness(35%)'
                    : 'none'
              }}
            >
              <img
                src={getImage(card)}
                alt={card.name}
                className={`small-card hero ${
                  card.id === state.mainDeck.preparedCard?.card.id ||
                  (state.turn.player === state.playerNum &&
                    card.freeUse &&
                    state.playerNum === playerNum &&
                    state.turn.phase === 'play')
                    ? 'glow'
                    : ''
                } ${
                  (!state.mainDeck.preparedCard &&
                    state.turn.player === state.playerNum &&
                    state.playerNum === playerNum &&
                    state.turn.phase === 'play' &&
                    !card.abilityUsed) ||
                  (state.turn.phase === 'choose-hero' &&
                    state.turn.player === state.playerNum &&
                    !card.item)
                    ? 'click'
                    : playerNum === state.playerNum
                    ? 'deny'
                    : ''
                }`}
                style={{
                  opacity:
                    state.mainDeck.preparedCard?.card.type === CardType.item &&
                    card.id === state.mainDeck.preparedCard.card.heroId
                      ? 0.6
                      : 1,
                  zIndex:
                    state.mainDeck.preparedCard?.card.type === CardType.item &&
                    card.id === state.mainDeck.preparedCard.card.heroId
                      ? 1
                      : 2
                }}
                draggable='false'
              />

              {card.item && (
                <img
                  src={getImage(card.item)}
                  alt={card.item.name}
                  className={`small-card item ${
                    state.mainDeck.preparedCard?.card.type === CardType.item &&
                    card.id === state.mainDeck.preparedCard.card.heroId
                      ? 'glow'
                      : ''
                  }`}
                  draggable='false'
                />
              )}
            </div>
          ))}

          {Array.from(
            Array(5 - state.board[playerNum].heroCards.length),
            (_, i) => (
              <div className='small' key={i}></div>
            )
          )}
        </div>

        <div className='bottom-row'>
          {state.board[playerNum].largeCards.map(card => (
            <div
              className='large'
              key={card.id}
              onMouseEnter={() => {
                if (!shownCard.locked) {
                  shownCard.set(card);
                  shownCard.setPos(col === 0 ? 'right' : 'left');
                }
              }}
              onMouseLeave={() => {
                if (!shownCard.locked) {
                  shownCard.set(null);
                  shownCard.setPos(null);
                }
              }}
            >
              <img
                src={getImage(card)}
                alt={card.name}
                className='large-card'
                draggable='false'
                style={{
                  filter:
                    state.turn.phase === 'choose-hero' &&
                    state.turn.player === state.playerNum
                      ? 'brightness(35%)'
                      : 'none'
                }}
              />
            </div>
          ))}

          {Array.from(
            Array(4 - state.board[playerNum].largeCards.length),
            (_, i) => (
              <div className='large' key={i}></div>
            )
          )}
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
};

export default PlayerBoard;
