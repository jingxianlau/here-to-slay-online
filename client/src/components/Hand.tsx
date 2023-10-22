import React from 'react';
import { CardType, Credentials, GameState, HeroCard } from '../types';
import { getImage } from '../helpers/getImage';
import useCardContext from '../hooks/useCardContext';
import { Socket } from 'socket.io-client';

interface HandProps {
  state: GameState;
  playerNum: number;
  show: boolean;
  socket: Socket;
  credentials: Credentials;
  setShowHand: React.Dispatch<React.SetStateAction<boolean>>;
}

const Hand: React.FC<HandProps> = ({
  state,
  playerNum,
  show,
  socket,
  credentials,
  setShowHand
}) => {
  const { setShownCard, setPos } = useCardContext();

  const drawFive = () => {
    socket.emit('draw-five', credentials.roomId, credentials.userId);
  };

  return (
    <div className='bottomMenu' style={{ bottom: show ? 0 : '-30vh' }}>
      {state.turn.player === playerNum && state.turn.movesLeft === 3 && (
        <div className='discard' onClick={drawFive}>
          <span className='material-symbols-outlined'>delete_forever</span>
        </div>
      )}
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
        {state.players[playerNum]?.hand.length === 0 && (
          <div style={{ marginBottom: '5vh' }}>
            <h2>No Cards :(</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hand;
