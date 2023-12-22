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
          !showHand.animation &&
          (state.turn.phase === 'attack-roll' ||
            state.turn.phase === 'challenge' ||
            state.turn.phase === 'challenge-roll' ||
            state.turn.phase === 'modify' ||
            (state.turn.phase === 'use-effect' &&
              state.turn.effect &&
              (state.turn.effect.action === 'choose-player' ||
                state.turn.effect.action === 'choose-hand' ||
                state.turn.effect.action === 'choose-other-hand-hide' ||
                state.turn.effect.action === 'choose-other-hand-show' ||
                state.turn.effect.action === 'choose-discard' ||
                state.turn.effect.action === 'choose-two' ||
                state.turn.effect.action === 'reveal')) ||
            state.turn.phase === 'use-effect-roll' ||
            state.turn.phase === 'end-turn-discard' ||
            state.turn.phase === 'end-game')
            ? 'show'
            : 'hide'
        }`}
        onClick={() => {
          if (
            !showHand.animation &&
            (state.turn.phase === 'attack-roll' ||
              state.turn.phase === 'challenge' ||
              state.turn.phase === 'challenge-roll' ||
              state.turn.phase === 'modify' ||
              (state.turn.phase === 'use-effect' &&
                state.turn.effect &&
                (state.turn.effect.action === 'choose-hand' ||
                  state.turn.effect.action === 'choose-other-hand-hide' ||
                  state.turn.effect.action === 'choose-other-hand-show' ||
                  state.turn.effect.action === 'choose-discard' ||
                  state.turn.effect.action === 'choose-two' ||
                  state.turn.effect.action === 'choose-cards' ||
                  state.turn.effect.action === 'reveal')) ||
              state.turn.phase === 'use-effect-roll' ||
              state.turn.phase === 'end-turn-discard' ||
              state.turn.phase === 'end-game')
          ) {
            setShowBoard(val => !val);

            if (state.turn.phase !== 'end-turn-discard') {
              shownCard.setLocked(val => !val);
            }

            if (
              (state.turn.effect &&
                (state.turn.effect.action === 'choose-hand' ||
                  state.turn.effect.action === 'choose-other-hand-hide' ||
                  state.turn.effect.action === 'choose-other-hand-show' ||
                  state.turn.effect.action === 'choose-two' ||
                  state.turn.effect.action === 'choose-cards' ||
                  state.turn.effect.action === 'reveal' ||
                  state.turn.effect.action === 'choose-discard')) ||
              state.turn.phase === 'end-turn-discard'
            ) {
              if (showBoard) {
                if (
                  !state.turn.effect ||
                  (state.turn.effect.action !== 'choose-other-hand-hide' &&
                    state.turn.effect.action !== 'choose-other-hand-show' &&
                    state.turn.effect.action !== 'choose-two' &&
                    state.turn.effect.action !== 'choose-cards' &&
                    state.turn.effect.action !== 'reveal' &&
                    state.turn.effect.action !== 'choose-discard')
                ) {
                  // show hand when popup active
                  showHand.set(true);
                }
                showHand.setLocked(true);
              } else {
                if (
                  !state.turn.effect ||
                  (state.turn.effect.action !== 'choose-other-hand-hide' &&
                    state.turn.effect.action !== 'choose-other-hand-show' &&
                    state.turn.effect.action !== 'choose-two' &&
                    state.turn.effect.action !== 'choose-cards' &&
                    state.turn.effect.action !== 'reveal' &&
                    state.turn.effect.action !== 'choose-discard')
                ) {
                  showHand.set(false);
                }
                showHand.setLocked(false);
              }
            }
          }
        }}
      >
        <span className='material-symbols-outlined icon'>flip</span>
      </button>

      {/* SKIP (USE EFFECT) */}
      {state.turn.phase === 'use-effect' &&
        state.turn.effect &&
        state.turn.effect.players.some(val => val === state.playerNum) &&
        state.turn.effect.val.curr >= state.turn.effect.val.min && (
          <button
            className='circular skip'
            onClick={() => {
              chosenCard.setShow(true);
              chosenCard.setCustomText('Skip');
              chosenCard.setCustomCenter('start');
            }}
            style={{
              right:
                state.turn.phase === 'use-effect' &&
                state.turn.effect &&
                (state.turn.effect.action === 'choose-player' ||
                  state.turn.effect.action === 'choose-hand' ||
                  state.turn.effect.action === 'choose-other-hand-hide' ||
                  state.turn.effect.action === 'choose-other-hand-show' ||
                  state.turn.effect.action === 'choose-discard' ||
                  state.turn.effect.action === 'choose-two' ||
                  state.turn.effect.action === 'reveal')
                  ? '9.4vh'
                  : '1.5vh'
            }}
          >
            <span className='material-symbols-outlined'>start</span>
          </button>
        )}
    </>
  );
};

export default MenuButtons;
