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
      <div
        className={`main-button pass ${
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
      </div>
      <div
        className={`main-button help show`}
        onMouseEnter={() => {
          setShowHelp(true);
        }}
        onMouseLeave={() => {
          setShowHelp(false);
        }}
      >
        <span className='material-symbols-outlined'>help</span>
      </div>
      <div
        className={`show-board-trigger ${
          state.turn.phase === 'attack' ||
          state.turn.phase === 'challenge' ||
          state.turn.phase === 'challenge-roll' ||
          state.turn.phase === 'modify' ||
          state.turn.phase === 'use-effect' ||
          state.turn.phase === 'end-turn-discard'
            ? 'show'
            : 'hide'
        }`}
        onClick={() => {
          if (
            state.turn.phase === 'attack' ||
            state.turn.phase === 'challenge' ||
            state.turn.phase === 'challenge-roll' ||
            state.turn.phase === 'modify' ||
            state.turn.phase === 'use-effect' ||
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
      </div>
    </>
  );
};

export default MenuButtons;
