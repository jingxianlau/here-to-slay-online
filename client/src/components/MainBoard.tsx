import React, { useEffect, useState } from 'react';
import PlayerBoard from './PlayerBoard';
import CenterBoard from './CenterBoard';
import { Socket } from 'socket.io-client';
import useClientContext from '../hooks/useClientContext';

interface MainBoardProps {
  socket: Socket;
  setShowDiscardPile: React.Dispatch<React.SetStateAction<boolean>>;
}

const MainBoard: React.FC<MainBoardProps> = ({
  socket,
  setShowDiscardPile
}) => {
  const { state } = useClientContext();

  const [boardOrder, setBoardOrder] = useState<number[][]>([[], [], []]);

  useEffect(() => {
    const numPlayers = state.val.match.players.length;
    let board: number[][] = [[], [], []];
    switch (numPlayers) {
      case 3:
        board[1].push(-1);
        board[1].push(state.val.playerNum);
        board[0].push((state.val.playerNum + 1) % 3);
        board[2].push((state.val.playerNum + 2) % 3);

        setBoardOrder(board);
        break;

      case 4:
        board[1].push(-1);
        board[1].push(state.val.playerNum);
        board[0].push((state.val.playerNum + 2) % 4);
        board[0].push((state.val.playerNum + 1) % 4);
        board[2].push((state.val.playerNum + 3) % 4);

        setBoardOrder(board);
        break;

      case 5:
        board[1].push(-1);
        board[1].push(state.val.playerNum);
        board[0].push((state.val.playerNum + 2) % 5);
        board[0].push((state.val.playerNum + 1) % 5);
        board[2].push((state.val.playerNum + 3) % 5);
        board[2].push((state.val.playerNum + 4) % 5);

        setBoardOrder(board);
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.val]);

  return (
    <div className='content'>
      {boardOrder.map((arr, num) => (
        <div
          className='col'
          key={num}
          style={{
            justifyContent: arr.length > 1 ? 'space-between' : 'center'
          }}
        >
          {arr.map((boardNum, i) =>
            boardNum !== -1 ? (
              <div
                className={`${
                  boardNum === state.val.playerNum
                    ? 'own-board'
                    : 'player-board'
                }`}
                key={i}
                style={{
                  marginBottom: arr.length > 1 ? 0 : '10vh',
                  filter:
                    state.val.turn.phase === 'end-game' &&
                    !state.val.match.isReady[boardNum]
                      ? 'brightness(35%)'
                      : 'none'
                }}
              >
                {boardNum !== state.val.playerNum && (
                  <div className='num-cards'>
                    <span className='material-symbols-outlined'>
                      playing_cards
                    </span>
                    <h4>{state.val.players[boardNum].numCards}</h4>
                  </div>
                )}
                {boardNum !== state.val.playerNum ? (
                  <h4
                    style={{
                      marginBottom: '5px',
                      color:
                        state.val.turn.player === boardNum ? '#fc7c37' : 'white'
                    }}
                  >
                    {state.val.match.players[boardNum]}
                  </h4>
                ) : (
                  <h2
                    style={{
                      marginBottom: '5px',
                      color:
                        state.val.turn.player === boardNum ? '#fc7c37' : 'white'
                    }}
                  >
                    {state.val.match.players[boardNum]}
                  </h2>
                )}
                <PlayerBoard playerNum={boardNum} col={num} />
              </div>
            ) : (
              <div
                className='center-board'
                key={i}
                style={{
                  filter:
                    state.val.turn.phase === 'end-game' &&
                    !state.val.match.isReady[boardNum]
                      ? 'brightness(35%)'
                      : 'none'
                }}
              >
                <CenterBoard
                  socket={socket}
                  setShowDiscardPile={setShowDiscardPile}
                />
              </div>
            )
          )}
        </div>
      ))}
    </div>
  );
};

export default MainBoard;
