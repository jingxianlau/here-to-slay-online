import React from 'react';
import { CardType, LeaderCard } from '../types';
import { getImage } from '../helpers/getImage';
import useClientContext from '../hooks/useClientContext';
import { Socket } from 'socket.io-client';

interface PlayerBoardProps {
  socket: Socket;
  playerNum: number;
  col: number;
}

const PlayerBoard: React.FC<PlayerBoardProps> = ({
  playerNum,
  col,
  socket
}) => {
  const {
    state: { val: state },
    shownCard,
    chosenCard,
    credentials: { roomId, userId }
  } = useClientContext();

  return state.board[playerNum].largeCards.length > 0 ? (
    <div
      className={`mat ${
        (state.board[playerNum].largeCards[0] as LeaderCard).class
      } ${
        (playerNum === state.turn.player &&
          state.turn.phase !== 'choose-hero') ||
        state.turn.phase === 'end-game'
          ? 'active'
          : 'inactive'
      }`}
      style={{
        filter:
          (state.turn.player === state.playerNum &&
            state.turn.phase === 'use-effect' &&
            state.turn.effect?.action === 'choose-player' &&
            !state.turn.effect.choice &&
            playerNum === state.turn.player) ||
          (state.turn.effect && state.turn.effect.action === 'none')
            ? 'brightness(35%)'
            : 'none'
      }}
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
                    (state.turn.movesLeft || card.freeUse) &&
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
                    : state.turn.phase === 'use-effect' &&
                      state.turn.effect &&
                      state.turn.effect.card.id === card.id
                    ? 'glow-purple'
                    : ''
                } ${
                  state.turn.phase !== 'end-game' &&
                  ((!state.mainDeck.preparedCard &&
                    state.turn.player === state.playerNum &&
                    state.playerNum === playerNum &&
                    state.turn.phase === 'play' &&
                    !card.abilityUsed &&
                    (state.turn.movesLeft || card.freeUse)) ||
                    (state.turn.phase === 'choose-hero' &&
                      state.turn.player === state.playerNum &&
                      !card.item))
                    ? 'click'
                    : state.turn.phase !== 'end-game' &&
                      playerNum === state.playerNum
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
      {state.turn.phase === 'use-effect' &&
        state.turn.effect &&
        state.turn.effect.action === 'choose-player' &&
        ((state.turn.player === state.playerNum &&
          !state.turn.effect.choice &&
          state.playerNum !== playerNum) ||
          (state.turn.effect.choice &&
            state.turn.effect.choice[0] === playerNum)) && (
          <div
            className={`overlay ${
              state.turn.effect.choice &&
              state.turn.effect.choice[0] === playerNum
                ? 'chosen'
                : ''
            }`}
            onClick={() => {
              if (state.turn.player === state.playerNum) {
                socket.emit(
                  'use-effect',
                  roomId,
                  userId,
                  state.turn.effect?.card,
                  playerNum
                );
              }
            }}
          >
            {state.turn.effect.purpose.split(' ')[0]}
          </div>
        )}
    </div>
  ) : (
    <></>
  );
};

export default PlayerBoard;
