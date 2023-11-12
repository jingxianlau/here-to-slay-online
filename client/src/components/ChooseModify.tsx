import React from 'react';
import { Socket } from 'socket.io-client';
import { ModifierCard } from '../types';
import { getImage } from '../helpers/getImage';
import useClientContext from '../hooks/useClientContext';

interface ChooseModifyProps {
  socket: Socket;
  dice: 0 | 1;
  card: ModifierCard;
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChooseModify: React.FC<ChooseModifyProps> = ({
  socket,
  dice,
  card,
  show,
  setShow
}) => {
  const {
    shownCard,
    showHand,
    credentials: { roomId, userId }
  } = useClientContext();

  function modify(effect: 0 | 1) {
    socket.emit(
      'modify-roll',
      roomId,
      userId,
      {
        modifier: card,
        effect,
        dice
      },
      true
    );
  }

  return (
    <div className={`choose-modifier${show ? ' show' : ' hide'}`}>
      {card && (
        <>
          <div
            className='left'
            onClick={() => {
              setShow(false);
              showHand.setLocked(false);
              modify(0);
              setTimeout(() => {
                shownCard.set(null);
              }, 200);
            }}
          >
            +{card.modifier[0]}
          </div>
          <div className='center'>
            <img
              className='logo'
              src={dice === 0 ? './assets/sword.png' : './assets/shield.png'}
              alt={''}
            />
            <div className='img-container'>
              <img
                src={getImage(card)}
                alt={card.name}
                className='small-lg'
                draggable='false'
              />
            </div>
            <div className='cancel-container'>
              <div
                className='cancel-button'
                onClick={() => {
                  setShow(false);
                  showHand.setLocked(false);
                  setTimeout(() => {
                    shownCard.set(null);
                  }, 200);
                }}
              >
                <div className='button'></div>
              </div>
              <h5>Cancel</h5>
            </div>
          </div>
          <div
            className='right'
            onClick={() => {
              setShow(false);
              showHand.setLocked(false);
              modify(1);
              setTimeout(() => {
                shownCard.set(null);
              }, 200);
            }}
          >
            {card.modifier[1]}
          </div>
        </>
      )}
    </div>
  );
};

export default ChooseModify;
