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
    showHand,
    credentials: { roomId, userId },
    chosenCard,
    state: { val: state }
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
      {card && card.type === 'modifier' && (
        <>
          <div
            className='left'
            onClick={() => {
              if (
                (!card.modifier[1] && card.modifier[0] > 0) ||
                card.modifier[1]
              ) {
                setShow(false);
                showHand.setLocked(false);
                modify(0);
                setTimeout(() => {
                  chosenCard.set(null);
                }, 200);
              }
            }}
            style={{
              opacity:
                (!card.modifier[1] && card.modifier[0] > 0) || card.modifier[1]
                  ? 1
                  : 0
            }}
          >
            +{card.modifier[0]}
          </div>
          <div className='center'>
            <img
              className='logo'
              src={
                dice === 0
                  ? 'https://jingxianlau.github.io/here-to-slay/assets/sword.png'
                  : 'https://jingxianlau.github.io/here-to-slay/assets/shield.png'
              }
              alt={''}
              style={{ opacity: state.turn.challenger ? 1 : 0 }}
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
              <button
                className='circular danger cancel'
                onClick={() => {
                  setShow(false);
                  showHand.setLocked(false);
                  setTimeout(() => {
                    chosenCard.set(null);
                  }, 200);
                }}
              >
                <span className='material-symbols-outlined'>close</span>
              </button>
              <h5>Cancel</h5>
            </div>
          </div>
          <div
            className='right'
            onClick={() => {
              if (
                (!card.modifier[1] && card.modifier[0] < 0) ||
                card.modifier[1]
              ) {
                setShow(false);
                showHand.setLocked(false);
                modify(card.modifier[1] ? 1 : 0);
                setTimeout(() => {
                  chosenCard.set(null);
                }, 200);
              }
            }}
            style={{
              opacity:
                (!card.modifier[1] && card.modifier[0] < 0) || card.modifier[1]
                  ? 1
                  : 0
            }}
          >
            {card.modifier[1] ? card.modifier[1] : card.modifier[0]}
          </div>
        </>
      )}
    </div>
  );
};

export default ChooseModify;
