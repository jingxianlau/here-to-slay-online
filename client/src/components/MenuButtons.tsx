import React from 'react';
import useClientContext from '../hooks/useClientContext';

interface MenuButtonsProps {
  showBoard: boolean;
  setShowBoard: React.Dispatch<React.SetStateAction<boolean>>;
  setShowHelp: React.Dispatch<React.SetStateAction<boolean>>;
}

const MenuButtons: React.FC<MenuButtonsProps> = ({
  showBoard,
  setShowBoard,
  setShowHelp
}) => {
  const {
    state: { val: state },
    chosenCard,
    showHand,
    shownCard
  } = useClientContext();

  return (
    <>
      <button
        className={`circular pass ${
          state.turn.player === state.playerNum &&
          (state.turn.phase === 'draw' || state.turn.phase === 'play') &&
          !state.turn.pause
            ? 'show'
            : 'hide'
        }`}
        onClick={() => {
          if (
            state.turn.player === state.playerNum &&
            (state.turn.phase === 'draw' || state.turn.phase === 'play') &&
            !state.turn.pause
          ) {
            chosenCard.setShow(true);
            chosenCard.setCustomText('Pass');
            chosenCard.setCustomCenter('forward');
          }
        }}
      >
        <span className='material-symbols-outlined icon'>forward</span>
      </button>
      <div
        className={`help-trigger show`}
        onMouseEnter={() => {
          setShowHelp(true);
        }}
        onMouseLeave={() => {
          setShowHelp(false);
        }}
      >
        <span className='material-symbols-outlined icon'>help</span>
      </div>
      <button
        className={`circular show-board-trigger ${
          state.turn.phase === 'attack-roll' ||
          state.turn.phase === 'challenge' ||
          state.turn.phase === 'challenge-roll' ||
          state.turn.phase === 'modify' ||
          (state.turn.phase === 'use-effect' &&
            state.turn.effect &&
            (state.turn.effect.action === 'choose-player' ||
              state.turn.effect.action === 'choose-hand' ||
              state.turn.effect.action === 'choose-other-hand-hide' ||
              state.turn.effect.action === 'choose-other-hand-show' ||
              state.turn.effect.action === 'choose-discard')) ||
          state.turn.phase === 'use-effect-roll' ||
          state.turn.phase === 'end-turn-discard' ||
          state.turn.phase === 'end-game'
            ? 'show'
            : 'hide'
        }`}
        onClick={() => {
          if (
            state.turn.phase === 'attack-roll' ||
            state.turn.phase === 'challenge' ||
            state.turn.phase === 'challenge-roll' ||
            state.turn.phase === 'modify' ||
            (state.turn.phase === 'use-effect' &&
              state.turn.effect &&
              (state.turn.effect.action === 'choose-player' ||
                state.turn.effect.action === 'choose-hand' ||
                state.turn.effect.action === 'choose-other-hand-hide' ||
                state.turn.effect.action === 'choose-other-hand-show' ||
                state.turn.effect.action === 'choose-discard')) ||
            state.turn.phase === 'use-effect-roll' ||
            state.turn.phase === 'end-turn-discard' ||
            state.turn.phase === 'end-game'
          ) {
            setShowBoard(val => !val);

            if (
              (state.turn.effect &&
                (state.turn.effect.action === 'choose-hand' ||
                  state.turn.effect.action === 'choose-other-hand-hide' ||
                  state.turn.effect.action === 'choose-other-hand-show')) ||
              state.turn.phase === 'end-turn-discard'
            ) {
              if (showBoard) {
                if (
                  !state.turn.effect ||
                  (state.turn.effect.action !== 'choose-other-hand-hide' &&
                    state.turn.effect.action !== 'choose-other-hand-show')
                ) {
                  showHand.set(true);
                }
                showHand.setLocked(true);
              } else {
                showHand.set(false);
                showHand.setLocked(false);
              }
            } else {
              shownCard.setLocked(val => !val);
            }
          }
        }}
      >
        <span className='material-symbols-outlined icon'>flip</span>
      </button>
    </>
  );
};

export default MenuButtons;
