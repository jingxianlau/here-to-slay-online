import React, { useEffect, useState } from 'react';
import { getImage, shortenName } from '../helpers/getImage';
import useClientContext from '../hooks/useClientContext';
import { CardType, HeroClass, LeaderCard, monsterRequirements } from '../types';
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
        !shownCard.locked &&
        shownCard.val
          ? 'show'
          : 'hide'
      }`}
    >
      {shownCard.pos !== 'top' &&
        shownCard.pos !== 'center' &&
        shownCard.val && (
          <img
            src={getImage(shownCard.val)}
            alt={shownCard.val.name}
            className={
              shownCard.val.type === 'large'
                ? 'large-enlarged'
                : 'small-enlarged'
            }
            draggable='false'
          />
        )}

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
