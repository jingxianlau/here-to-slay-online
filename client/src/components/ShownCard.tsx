import React from 'react';
import { AnyCard, HeroCard } from '../types';
import { getImage } from '../helpers/getImage';
import { Socket } from 'socket.io-client';

interface ShownCardProps {
  shownCard: AnyCard;
  pos: 'left' | 'right' | 'top';
}

const ShownCard: React.FC<ShownCardProps> = ({ shownCard, pos }) => {
  return (
    <div className={`shown-card ${pos}`}>
      <img
        src={
          shownCard.type === 'hero'
            ? getImage(
                shownCard.name,
                shownCard.type,
                (shownCard as HeroCard).class
              )
            : getImage(shownCard.name, shownCard.type)
        }
        alt={shownCard.name}
        className={
          shownCard.type === 'large' ? 'large-enlarged' : 'small-enlarged'
        }
      />
    </div>
  );
};

export default ShownCard;
