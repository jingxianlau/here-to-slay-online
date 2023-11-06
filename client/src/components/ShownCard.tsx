import React, { useEffect, useState } from 'react';
import { getImage } from '../helpers/getImage';
import useClientContext from '../hooks/useClientContext';

interface ShownCardProps {}

const ShownCard: React.FC<ShownCardProps> = () => {
  const { shownCard } = useClientContext();
  const [lastPos, setLastPos] = useState<'left' | 'right' | 'top' | null>(null);

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
        !shownCard.locked &&
        shownCard.val
          ? 'show'
          : 'hide'
      }`}
    >
      {shownCard.pos !== 'top' && shownCard.val && (
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

export default ShownCard;
