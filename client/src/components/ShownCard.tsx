import React, { useEffect, useState } from 'react';
import { getImage, shortenName } from '../helpers/getImage';
import useClientContext from '../hooks/useClientContext';
import {
  AnyCard,
  CardType,
  HeroClass,
  ItemCard,
  LeaderCard,
  monsterRequirements
} from '../types';
import { restOfCards } from '../helpers/meetsRequirements';

interface ShownCardProps {}

const ShownCard: React.FC<ShownCardProps> = () => {
  const {
    shownCard,
    state: { val: state }
  } = useClientContext();
  const [lastPos, setLastPos] = useState<
    'left' | 'right' | 'top' | 'center' | null
  >(null);

  useEffect(() => {
    if (shownCard.pos !== null) {
      setLastPos(shownCard.pos);
    }
  }, [shownCard.pos]);

  return (
    <div
      className={`shown-card ${lastPos} ${
        shownCard &&
        shownCard.pos !== 'top' &&
        shownCard.pos !== 'center' &&
        !state.turn.pause &&
        !shownCard.locked &&
        shownCard.val
          ? 'show'
          : 'hide'
      }`}
    >
      {shownCard.val &&
      shownCard.val.player !== undefined &&
      shownCard.val.player !== state.playerNum ? (
        <h1
          style={
            (shownCard.val.type !== CardType.hero || !shownCard.val.item) &&
            (shownCard.val.type !== CardType.hero ||
              state.mainDeck.preparedCard?.card.type !== CardType.item ||
              state.turn.player !== state.playerNum ||
              state.turn.phase !== 'choose-hero')
              ? { marginBottom: '0.8vh', marginTop: '-5vh', width: '25vw' }
              : { position: 'absolute', top: '5vh' }
          }
        >
          {state.match.players[shownCard.val.player]}
        </h1>
      ) : (
        <></>
      )}

      {shownCard.pos !== 'top' &&
        shownCard.pos !== 'center' &&
        shownCard.val && (
          <img
            src={getImage(shownCard.val)}
            alt={shownCard.val.name}
            className={
              shownCard.val.type === 'large'
                ? `large-enlarged`
                : `small-enlarged ${
                    (shownCard.val.type === CardType.hero &&
                      shownCard.val.item) ||
                    (state.mainDeck.preparedCard?.card.type === CardType.item &&
                      state.turn.player === state.playerNum &&
                      state.turn.phase === 'choose-hero')
                      ? 'hero'
                      : ''
                  } ${
                    ((shownCard.val.type === CardType.hero &&
                      shownCard.val.item) ||
                      (state.mainDeck.preparedCard?.card.type ===
                        CardType.item &&
                        state.turn.player === state.playerNum &&
                        state.turn.phase === 'choose-hero')) &&
                    (shownCard.val.player === state.playerNum ? 'own' : 'other')
                  }`
            }
            draggable='false'
          />
        )}

      {shownCard.val &&
        (shownCard.val.type === CardType.hero && shownCard.val.item ? (
          <img
            src={getImage(shownCard.val.item)}
            alt={shownCard.val.item.name}
            className={`small-enlarged item ${
              shownCard.val.player === state.playerNum ? 'own' : 'other'
            }`}
            draggable='false'
          />
        ) : state.mainDeck.preparedCard &&
          state.mainDeck.preparedCard.card.type === CardType.item &&
          state.turn.player === state.playerNum &&
          state.turn.phase === 'choose-hero' ? (
          <img
            src={getImage(state.mainDeck.preparedCard.card)}
            alt={state.mainDeck.preparedCard.card.name}
            className={`small-enlarged item ${
              shownCard.val.player === state.playerNum ? 'own' : 'other'
            }`}
            draggable='false'
          />
        ) : (
          <></>
        ))}

      {shownCard.val &&
        shownCard.val.type === CardType.large &&
        shownCard.val.player === undefined && (
          <div className='requirements'>
            {monsterRequirements[shortenName(shownCard.val)].map(
              (val, i) =>
                shownCard.val && (
                  <div className='requirement' key={i}>
                    <img
                      src={`./assets/icons/${val.hero}.png`}
                      alt={val.hero}
                    />
                    <h1>
                      <span
                        style={{
                          color: (
                            val.hero !== 'hero'
                              ? state.board[state.playerNum].classes[
                                  val.hero
                                ] >= val.req
                              : restOfCards(
                                  monsterRequirements[
                                    shortenName(shownCard.val)
                                  ],
                                  state
                                ) >= val.req
                          )
                            ? '#2eee9b'
                            : '#f95151'
                        }}
                      >
                        {val.hero !== 'hero'
                          ? state.board[state.playerNum].classes[val.hero]
                          : restOfCards(
                              monsterRequirements[shortenName(shownCard.val)],
                              state
                            )}
                      </span>
                      /{val.req}
                    </h1>
                  </div>
                )
            )}
          </div>
        )}
    </div>
  );
};

export default ShownCard;
