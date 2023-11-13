import React from 'react';
import { getImage } from '../helpers/getImage';
import useClientContext from '../hooks/useClientContext';

const ShownCardTop: React.FC = () => {
  const { shownCard } = useClientContext();

  return (
    <div
      className={`shown-card-top ${
        shownCard &&
        shownCard.pos === 'top' &&
        !shownCard.locked &&
        shownCard.val
          ? 'show'
          : 'hide'
      }`}
      style={
        shownCard.val && shownCard.val.name === 'help'
          ? {
              top: '30vh'
            }
          : {}
      }
    >
      {shownCard.pos === 'top' && shownCard.val && (
        <img
          src={getImage(shownCard.val)}
          alt={shownCard.val.name}
          className={
            shownCard.val.type === 'large' ? 'large-enlarged' : 'small-enlarged'
          }
          draggable='false'
        />
      )}
    </div>
  );
};

export default ShownCardTop;
