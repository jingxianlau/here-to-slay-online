import React, { useEffect, useState } from 'react';
import { Credentials, GameState } from '../types';
import PlayerBoard from './PlayerBoard';
import CenterBoard from './CenterBoard';
import { Socket } from 'socket.io-client';
import TopMenu from './TopMenu';

interface MainBoardProps {
  state: GameState;
  playerNum: number;
  socket: Socket;
  credentials: Credentials;
  setShowHand: React.Dispatch<React.SetStateAction<boolean>>;
}

const MainBoard: React.FC<MainBoardProps> = ({
  state,
  playerNum,
  socket,
  credentials,
  setShowHand
}) => {
  const [boardOrder, setBoardOrder] = useState<number[][]>([[], [], []]);

  useEffect(() => {
    const numPlayers = state.match.players.length;
    let board: number[][] = [[], [], []];
    switch (numPlayers) {
      case 3:
        board[1].push(-1);
        board[1].push(playerNum);
        board[0].push((playerNum + 1) % numPlayers);
        board[2].push((playerNum + 2) % numPlayers);

        setBoardOrder(board);
        break;

      case 4:
        break;

      case 5:
        board[1].push(-1);
        board[1].push(playerNum);
        board[0].push((playerNum + 1) % numPlayers);
        board[0].push((playerNum + 2) % numPlayers);
        board[2].push((playerNum + 3) % numPlayers);
        board[2].push((playerNum + 4) % numPlayers);

        setBoardOrder(board);
        break;
    }
  }, []);

  return (
    <>
      <TopMenu state={state} />

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
                    boardNum === playerNum ? 'own-board' : 'player-board'
                  }`}
                  key={i}
                  style={{
                    marginBottom: arr.length > 1 ? 0 : '120px'
                  }}
                >
                  {boardNum !== playerNum ? (
                    <h4
                      style={{
                        marginBottom: '5px',
                        color:
                          state.turn.player === boardNum ? '#fc7c37' : 'white'
                      }}
                    >
                      {state.match.players[boardNum]}
                    </h4>
                  ) : (
                    <h2
                      style={{
                        marginBottom: '5px',
                        color:
                          state.turn.player === boardNum ? '#fc7c37' : 'white'
                      }}
                    >
                      {state.match.players[boardNum]}
                    </h2>
                  )}
                  <PlayerBoard
                    state={state}
                    playerNum={boardNum}
                    col={num}
                    socket={socket}
                    credentials={credentials}
                  />
                </div>
              ) : (
                <div className='center-board' key={i}>
                  <CenterBoard
                    state={state}
                    socket={socket}
                    credentials={credentials}
                    setShowHand={setShowHand}
                    playerNum={playerNum}
                  />
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
