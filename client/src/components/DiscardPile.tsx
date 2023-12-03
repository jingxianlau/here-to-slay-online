import React, { useEffect, useState } from 'react';
import useClientContext from '../hooks/useClientContext';
import { getImage } from '../helpers/getImage';

const DiscardPile: React.FC<{
  showDiscardPile: boolean;
  setShowDiscardPile: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ showDiscardPile, setShowDiscardPile }) => {
  const {
    state: { val: state }
  } = useClientContext();

  const [num, setNum] = useState(state.mainDeck.discardPile.length - 1);
  useEffect(() => {
    if (showDiscardPile) {
      setNum(state.mainDeck.discardPile.length - 1);
    }
  }, [showDiscardPile]);

  return (
    <div className={`discard-pile-popup ${showDiscardPile ? 'show' : 'hide'}`}>
      {showDiscardPile &&
        num >= 0 &&
        num <= state.mainDeck.discardPile.length - 1 && (
          <div className='discard-pile-container'>
            <h1>Discard Pile</h1>
            <div className='center'>
              <span
                className={`material-symbols-outlined ${
                  num > 0 ? 'show' : 'hide'
                }`}
                onClick={() => {
                  if (num > 0) {
                    setNum(num - 1);
                  }
                }}
              >
                chevron_left
              </span>
              <div className='img-container'>
                <img
                  src={getImage(state.mainDeck.discardPile[num])}
                  alt={state.mainDeck.discardPile[num].name}
                  className='small-xl'
                  draggable='false'
                />
              </div>
              <span
                className={`material-symbols-outlined ${
                  num < state.mainDeck.discardPile.length - 1 ? 'show' : 'hide'
                }`}
                onClick={() => {
                  if (num < state.mainDeck.discardPile.length - 1) {
                    setNum(num + 1);
                  }
                }}
              >
                chevron_right
              </span>
            </div>
            <div className='cancel-container'>
              <button
                className='cancel circular danger'
                onClick={() => {
                  setShowDiscardPile(false);
                }}
              >
                <span className='material-symbols-outlined'>close</span>
              </button>
              <h5>Close</h5>
            </div>
          </div>
        )}
    </div>
  );
};

export default DiscardPile;
