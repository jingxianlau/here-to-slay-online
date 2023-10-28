import React from 'react';
import { AnyCard, CardType, Credentials, GameState } from '../types';
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
    if (!state || !socket || state.turn.movesLeft === 0) return;
    if (state.turn.player === playerNum) {
      socket.emit('draw-five', credentials.roomId, credentials.userId);
    }
  };

  const prepareCard = (card: AnyCard) => {
    if (!state || !socket || state.turn.movesLeft === 0) return;
    if (
      state.turn.player === playerNum &&
      (card.type === CardType.hero ||
        card.type === CardType.item ||
        card.type === CardType.magic)
    ) {
      socket.emit('prepare-card', credentials.roomId, credentials.userId, card);
      setShowHand(false);
    }
  };

  return (
    <div className='bottomMenu' style={{ bottom: show ? 0 : '-30vh' }}>
      {state.turn.player === playerNum &&
        state.turn.movesLeft === 3 &&
        state.turn.phase === 'play' && (
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
            <img
              src={getImage(card)}
              alt={card.name}
              className='small-md'
              onClick={() => prepareCard(card)}
            />
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
