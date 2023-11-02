import React, { useEffect, useState } from 'react';
import { Credentials, GameState } from '../types';
import PlayerBoard from './PlayerBoard';
import CenterBoard from './CenterBoard';
import { Socket } from 'socket.io-client';
import TopMenu from './TopMenu';
import useClientContext from '../hooks/useClientContext';

interface MainBoardProps {
  socket: Socket;
}

const MainBoard: React.FC<MainBoardProps> = ({ socket }) => {
  const { state, playerNum, credentials, showHand } = useClientContext();

  const [boardOrder, setBoardOrder] = useState<number[][]>([[], [], []]);

  useEffect(() => {
    const numPlayers = state.val.match.players.length;
    let board: number[][] = [[], [], []];
    switch (numPlayers) {
      case 3:
        board[1].push(-1);
        board[1].push(playerNum.val);
        board[0].push((playerNum.val + 1) % 3);
        board[2].push((playerNum.val + 2) % 3);

        setBoardOrder(board);
        break;

      case 4:
        break;

      case 5:
        board[1].push(-1);
        board[1].push(playerNum.val);
        board[0].push((playerNum.val + 1) % 5);
        board[0].push((playerNum.val + 2) % 5);
        board[2].push((playerNum.val + 3) % 5);
        board[2].push((playerNum.val + 4) % 5);

        setBoardOrder(board);
        break;
    }
  }, []);

  return (
    <>
      <TopMenu />

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
                    boardNum === playerNum.val ? 'own-board' : 'player-board'
                  }`}
                  key={i}
                  style={{
                    marginBottom: arr.length > 1 ? 0 : '120px'
                  }}
                >
                  {boardNum !== playerNum.val ? (
                    <h4
                      style={{
                        marginBottom: '5px',
                        color:
                          state.val.turn.player === boardNum
                            ? '#fc7c37'
                            : 'white'
                      }}
                    >
                      {state.val.match.players[boardNum]}
                    </h4>
                  ) : (
                    <h2
                      style={{
                        marginBottom: '5px',
                        color:
                          state.val.turn.player === boardNum
                            ? '#fc7c37'
                            : 'white'
                      }}
                    >
                      {state.val.match.players[boardNum]}
                    </h2>
                  )}
                  <PlayerBoard playerNum={boardNum} col={num} socket={socket} />
                </div>
              ) : (
                <div className='center-board' key={i}>
                  <CenterBoard socket={socket} />
                </div>
              )
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default MainBoard;
