import React from 'react';
import { AnyCard, HeroCard } from '../types';
import { getImage } from '../helpers/getImage';
import useClientContext from '../hooks/useClientContext';

interface ShownCardProps {}

const ShownCard: React.FC<ShownCardProps> = () => {
  const { shownCard } = useClientContext();
  return (
    shownCard.val && (
      <div className={`shown-card ${shownCard.pos}`}>
        <img
          src={getImage(shownCard.val)}
          alt={shownCard.val.name}
          className={
            shownCard.val.type === 'large' ? 'large-enlarged' : 'small-enlarged'
          }
          draggable='false'
        />
      </div>
    )
  );
};

export default ShownCard;
