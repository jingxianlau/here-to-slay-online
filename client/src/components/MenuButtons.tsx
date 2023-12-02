import React from 'react';
import useClientContext from '../hooks/useClientContext';
import { Socket } from 'socket.io-client';

interface MenuButtonsProps {
  socket: Socket;
  showBoard: boolean;
  setShowBoard: React.Dispatch<React.SetStateAction<boolean>>;
  setShowHelp: React.Dispatch<React.SetStateAction<boolean>>;
}

const MenuButtons: React.FC<MenuButtonsProps> = ({
  socket,
  showBoard,
  setShowBoard,
  setShowHelp
}) => {
  const {
    state: { val: state },
    credentials,
    showHand,
    shownCard
  } = useClientContext();

  return (
    <>
      <button
        className={`circular pass ${
          state.turn.player === state.playerNum &&
          (state.turn.phase === 'draw' || state.turn.phase === 'play')
            ? 'show'
            : 'hide'
        }`}
        onClick={() => {
          if (state.turn.phase === 'draw' || state.turn.phase === 'play') {
            socket.emit('pass', credentials.roomId, credentials.userId);
          }
        }}
      >
        <span className='material-symbols-outlined'>forward</span>
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
        <span className='material-symbols-outlined'>help</span>
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
              state.turn.effect.action === 'choose-other-hand' ||
              state.turn.effect.action === 'choose-discard')) ||
          state.turn.phase === 'use-effect-roll' ||
          state.turn.phase === 'end-turn-discard'
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
                state.turn.effect.action === 'choose-other-hand' ||
                state.turn.effect.action === 'choose-discard')) ||
            state.turn.phase === 'use-effect-roll' ||
            state.turn.phase === 'end-turn-discard'
          ) {
            setShowBoard(val => !val);

            if (
              (state.turn.effect &&
                state.turn.effect.action === 'choose-hand') ||
              state.turn.phase === 'end-turn-discard'
            ) {
              if (showBoard) {
                showHand.set(true);
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
        <span className='material-symbols-outlined'>flip</span>
      </button>
    </>
  );
};

export default MenuButtons;
