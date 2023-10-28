import React from 'react';
import { AnyCard, HeroCard } from '../types';
import { getImage } from '../helpers/getImage';

interface ShownCardProps {
  shownCard: AnyCard;
  pos: 'left' | 'right' | 'top';
}

const ShownCard: React.FC<ShownCardProps> = ({ shownCard, pos }) => {
  return (
    <div className={`shown-card ${pos}`}>
      <img
        src={getImage(shownCard)}
        alt={shownCard.name}
        className={
          shownCard.type === 'large' ? 'large-enlarged' : 'small-enlarged'
        }
      />
    </div>
  );
};

export default ShownCard;
