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
    credentials: { roomId, userId },
    mode
  } = useClientContext();

  return state.board[playerNum].largeCards.length > 0 ? (
    <div
      className={`mat ${
        (state.board[playerNum].largeCards[0] as LeaderCard).class
      } ${
        (playerNum === state.turn.player &&
          ((state.turn.phase !== 'choose-hero' &&
            (state.turn.phase !== 'use-effect' ||
              !state.turn.effect ||
              (state.turn.effect.action !== 'choose-other-boards' &&
                state.turn.effect.action !== 'choose-own-board' &&
                state.turn.effect.action !== 'choose-boards'))) ||
            state.turn.player !== state.playerNum)) ||
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
          (state.turn.player === state.playerNum &&
            state.turn.phase === 'use-effect' &&
            state.turn.effect?.action === 'choose-other-boards' &&
            playerNum === state.turn.player) ||
          (state.turn.phase === 'use-effect' &&
            state.turn.effect?.action === 'choose-own-board' &&
            state.turn.effect.players.some(val => val === state.playerNum) &&
            !state.turn.effect.players.some(val => val === playerNum)) ||
          (state.turn.effect && state.turn.effect.action === 'none')
            ? 'brightness(35%)'
            : 'none'
      }}
    >
      <div className='background'></div>
      <div className='cards'>
        <div className='top-row'>
          {state.board[playerNum].heroCards.map((card, i) =>
            card ? (
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
                  if (
                    state.turn.player === state.playerNum ||
                    (state.turn.effect &&
                      state.turn.effect.players.some(
                        val => val === playerNum
                      ) &&
                      (mode.val !== 'touch' || shownCard.val?.id === card.id))
                  ) {
                    if (
                      (state.turn.movesLeft || card.freeUse) &&
                      !state.turn.pause &&
                      state.turn.phase === 'play' &&
                      !card.abilityUsed &&
                      state.playerNum === playerNum &&
                      (!card.item || card.item.name !== 'Sealing Key')
                    ) {
                      chosenCard.set(card);
                      chosenCard.setShow(true);
                      chosenCard.setCustomText('Ability');
                    } else if (
                      state.turn.phase === 'choose-hero' &&
                      !card.item
                    ) {
                      chosenCard.set(card);
                      chosenCard.setShow(true);
                      chosenCard.setCustomText('Select');
                    } else if (
                      state.turn.phase === 'use-effect' &&
                      state.turn.effect &&
                      ((state.turn.effect.action === 'choose-other-boards' &&
                        playerNum !== state.turn.player) ||
                        (state.turn.effect.action === 'choose-own-board' &&
                          state.turn.effect.players.some(
                            val => val === playerNum
                          )) ||
                        state.turn.effect.action === 'choose-boards') &&
                      (!state.turn.effect.purpose.includes('Destroy') ||
                        !state.players[playerNum].protection.some(
                          val => val.type === 'destroy'
                        )) &&
                      (!state.turn.effect.purpose.includes('Steal') ||
                        !state.players[playerNum].protection.some(
                          val => val.type === 'steal'
                        )) &&
                      (state.turn.effect.purpose !== 'Return Item' ||
                        card.item) &&
                      (state.turn.effect.purpose !== 'Return Curse' ||
                        (card.item && card.item.category === 'cursed'))
                    ) {
                      chosenCard.set(
                        (state.turn.effect.purpose === 'Return Item' ||
                          state.turn.effect.purpose === 'Return Curse') &&
                          card.item
                          ? card.item
                          : card
                      );
                      chosenCard.setShow(true);
                      chosenCard.setCustomCenter(
                        state.turn.effect.purpose.split(' ')[0]
                      );
                    }
                  }
                }}
                style={{
                  filter:
                    (state.turn.phase === 'choose-hero' &&
                      state.turn.player === state.playerNum &&
                      card.item) ||
                    (state.turn.phase === 'use-effect' &&
                      state.turn.effect &&
                      state.turn.effect.purpose.includes('Destroy') &&
                      state.players[playerNum].protection.some(
                        val => val.type === 'destroy'
                      )) ||
                    (state.turn.phase === 'use-effect' &&
                      state.turn.effect &&
                      state.turn.effect.purpose.includes('Steal') &&
                      state.players[playerNum].protection.some(
                        val => val.type === 'steal'
                      )) ||
                    (state.turn.effect &&
                      state.turn.effect.purpose === 'Return Curse' &&
                      (!card.item || card.item.category !== 'cursed'))
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
                      : state.turn.phase === 'use-effect' &&
                        state.turn.effect &&
                        (state.turn.effect.action === 'choose-other-boards' ||
                          state.turn.effect.action === 'choose-own-board' ||
                          state.turn.effect.action === 'choose-boards') &&
                        state.turn.effect.choice &&
                        state.turn.effect.choice.length > 0 &&
                        typeof state.turn.effect.choice[0] !== 'number' &&
                        card.id === state.turn.effect.choice[0].id
                      ? 'glow-red'
                      : ''
                  } ${
                    state.turn.phase !== 'end-game' &&
                    ((!state.mainDeck.preparedCard &&
                      state.turn.player === state.playerNum &&
                      state.playerNum === playerNum &&
                      state.turn.phase === 'play' &&
                      !card.abilityUsed &&
                      (!card.item || card.item.name !== 'Sealing Key') &&
                      (state.turn.movesLeft || card.freeUse)) ||
                      (state.turn.phase === 'choose-hero' &&
                        state.turn.player === state.playerNum &&
                        !card.item) ||
                      (state.turn.phase === 'use-effect' &&
                        state.turn.effect &&
                        state.turn.effect.players.some(
                          pn => pn === state.playerNum
                        ) &&
                        state.turn.effect.purpose !== 'Return Item' &&
                        state.turn.effect.purpose !== 'Return Curse' &&
                        (state.turn.effect.action === 'choose-boards' ||
                          (state.turn.effect.players.some(
                            pn => pn === playerNum
                          ) &&
                            state.turn.effect.action === 'choose-own-board') ||
                          (!state.turn.effect.players.some(
                            pn => pn === playerNum
                          ) &&
                            state.turn.effect.action ===
                              'choose-other-boards'))) ||
                      (state.turn.phase === 'use-effect' &&
                        state.turn.effect &&
                        ((state.turn.effect.purpose === 'Return Item' &&
                          card.item) ||
                          (state.turn.effect.purpose === 'Return Curse' &&
                            card.item &&
                            card.item.category === 'cursed'))))
                      ? 'click'
                      : state.turn.phase !== 'end-game' &&
                        playerNum === state.playerNum
                      ? 'deny'
                      : ''
                  }`}
                  style={{
                    opacity:
                      state.mainDeck.preparedCard?.card.type ===
                        CardType.item &&
                      card.id === state.mainDeck.preparedCard.card.heroId
                        ? 0.6
                        : 1,
                    zIndex:
                      state.mainDeck.preparedCard?.card.type ===
                        CardType.item &&
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
                      state.mainDeck.preparedCard?.card.type ===
                        CardType.item &&
                      card.id === state.mainDeck.preparedCard.card.heroId
                        ? 'glow'
                        : ''
                    }`}
                    draggable='false'
                  />
                )}
              </div>
            ) : (
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
                    (state.turn.phase === 'choose-hero' &&
                      state.turn.player === state.playerNum) ||
                    (state.turn.phase === 'use-effect' &&
                      state.turn.effect &&
                      state.turn.effect.players.some(
                        pn => pn === state.playerNum
                      ) &&
                      (state.turn.effect.action === 'choose-boards' ||
                        (state.turn.effect.players.some(
                          pn => pn === playerNum
                        ) &&
                          state.turn.effect.action === 'choose-own-board') ||
                        (!state.turn.effect.players.some(
                          pn => pn === playerNum
                        ) &&
                          state.turn.effect.action ===
                            'choose-other-boards')) &&
                      state.turn.player === state.playerNum)
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
              if (
                state.turn.effect?.players.some(val => val === state.playerNum)
              ) {
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
      <div className='passives'>
        {state.players[playerNum].protection.map(val => (
          <div
            key={val.card.id}
            className='passive'
            onMouseEnter={() => {
              if (!shownCard.locked) {
                shownCard.set(val.card);
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
              src='https://jingxianlau.github.io/here-to-slay/assets/icons/guardian.png'
              alt='Shield'
            />
          </div>
        ))}
        {state.players[playerNum].passives.map(val =>
          val.type === 'roll' ? (
            <div
              key={val.card.id}
              className='passive'
              onMouseEnter={() => {
                if (!shownCard.locked) {
                  shownCard.set(val.card);
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
              <span className='material-symbols-outlined'>
                {val.mod <= 3 ? 'ifl' : 'casino'}
              </span>
            </div>
          ) : (
            <></>
          )
        )}
      </div>
    </div>
  ) : (
    <></>
  );
};

export default PlayerBoard;
