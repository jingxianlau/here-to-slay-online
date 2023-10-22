import React from 'react';
import { CardType, GameState, HeroCard } from '../types';
import { getImage } from '../helpers/getImage';
import useCardContext from '../hooks/useCardContext';

interface HandProps {
  state: GameState;
  playerNum: number;
  show: boolean;
}

const Hand: React.FC<HandProps> = ({ state, playerNum, show }) => {
  const { setShownCard, setPos } = useCardContext();
  return (
    <div className='bottomMenu' style={{ bottom: show ? 0 : '-30vh' }}>
      <div className='hand'>
        {state.players[playerNum]?.hand.map((card, i) => (
          <div
            key={i}
            onMouseEnter={() => {
              setShownCard(card);
              setPos('top');
            }}
            onMouseLeave={() => {
              setShownCard(null);
              setPos(null);
            }}
          >
            {card.type !== CardType.hero ? (
              <img
                src={getImage(card.name, card.type)}
                alt={card.name}
                className='small-md'
              />
            ) : (
              <img
                src={getImage(card.name, card.type, card.class)}
                alt={card.name}
                className='small-md'
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hand;
