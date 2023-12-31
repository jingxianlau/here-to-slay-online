import React, { useEffect } from 'react';
import { getImage } from '../helpers/getImage';
import useClientContext from '../hooks/useClientContext';

const ShownCardTop: React.FC = () => {
  const {
    state: { val: state },
    shownCard
  } = useClientContext();

  return (
    <div
      className={`shown-card-top ${
        shownCard &&
        ((shownCard.pos === 'top' && !shownCard.locked && !state.turn.pause) ||
          shownCard.pos === 'center') &&
        shownCard.val
          ? 'show'
          : 'hide'
      }`}
      style={{
        top: shownCard.pos === 'center' ? '22vh' : '10vh'
      }}
    >
      {shownCard.pos === 'center' &&
        (state.turn.phase === 'use-effect' ? (
          <h1
            style={{
              marginBottom: '1vh',
              fontWeight: 1000,
              textShadow: '0.5vh 0.5vh 0.3vh #000',
              zIndex: 100
            }}
          >
            Chosen Card
          </h1>
        ) : state.turn.phase === 'play' ? (
          <h1
            style={{
              marginBottom: '1vh',
              fontWeight: 1000,
              textShadow: '0.5vh 0.5vh 0.3vh #000',
              zIndex: 100
            }}
          >
            Played Card
          </h1>
        ) : (
          <></>
        ))}
      {(shownCard.pos === 'top' || shownCard.pos === 'center') &&
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
    </div>
  );
};

export default ShownCardTop;
