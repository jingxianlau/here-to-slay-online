import React, { useEffect, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { GameState } from '../types';
import { getCredentials } from '../helpers/getJSON';

const Lobby: React.FC = () => {
  const navigate = useNavigate();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [matchState, setMatchState] = useState<GameState['match'] | null>(null);
  const [playerNum, setPlayerNum] = useState(-1);
  const [isReady, setIsReady] = useState(false);
  const credentials = getCredentials();
  const username = localStorage.getItem('username') as string;

  useEffect(() => {
    if (!credentials) {
      navigate('/');
      return;
    } else {
      // create socket connection
      let socket = io('http://localhost:4000');
      socket.on('connect', () => {});

      setSocket(socket);

      socket.emit(
        'enter-match',
        credentials.roomId,
        credentials.userId,
        username,
        (successful: boolean, playerNum: number) => {
          if (!successful) {
            localStorage.removeItem('credentials');
            alert('could not connect to match');
            navigate('/');
          } else {
            if (playerNum !== -1) {
              setPlayerNum(playerNum);
            } else {
              navigate('/');
            }
          }
        }
      );

      socket.on('state', (state: GameState['match']) => {
        setMatchState(state);
        if (state.gameStarted) {
          navigate('/game');
        }
      });

      socket.on('start-match', () => {
        navigate('/game');
      });

      return () => {
        if (socket) socket.disconnect();
      };
    }
  }, []);

  function getReady() {
    socket?.emit(
      'enter-match',
      credentials.roomId,
      credentials.userId,
      username,
      (successful: boolean, playerNum: number) => {
        if (!successful) {
          localStorage.removeItem('credentials');
          navigate('/');
        } else {
          if (playerNum !== -1) {
            setPlayerNum(playerNum);
          } else {
            navigate('/');
          }
        }
      }
    );

    socket?.emit(
      'ready',
      credentials.roomId,
      credentials.userId,
      !isReady,
      (successful: boolean) => {
        if (successful) setIsReady(!isReady);
      }
    );
  }

  function leaveRoom() {
    socket?.emit('leave-match', credentials.roomId, credentials.userId, () => {
      localStorage.removeItem('credentials');
      navigate('/');
    });
  }

  return (
    credentials && (
      <>
        <h5 className='lobby-id'>Lobby ID: {credentials.roomId}</h5>
        <div className='lobby'>
          <div className='details'>
            <h1>{matchState?.players[playerNum]}</h1>
            {matchState && (
              <h2
                style={{
                  color: matchState.isReady[playerNum] ? '#11b56b' : '#DC143C'
                }}
              >
                {matchState.isReady[playerNum] ? 'Ready' : 'Not Ready'}
              </h2>
            )}
          </div>
          <button onClick={getReady}>{isReady ? 'Not Ready' : 'Ready!'}</button>
          <br />
          <button onClick={leaveRoom}>Leave</button>
          <br />
          <br />
          <div className='player-list'>
            {matchState &&
              matchState.players.map(
                (uname, num) =>
                  num !== playerNum && (
                    <div className='player' key={num}>
                      <h3>{uname}</h3>
                      <h3
                        style={{
                          color: matchState.isReady[
                            matchState.players.indexOf(uname)
                          ]
                            ? '#11b56b'
                            : '#DC143C'
                        }}
                      >
                        {matchState.isReady[matchState.players.indexOf(uname)]
                          ? 'Ready'
                          : 'Not Ready'}
                      </h3>
                    </div>
                  )
              )}
          </div>
          {matchState && matchState.players.length < 3 && (
            <h4>Waiting for Players...</h4>
          )}
        </div>
      </>
    )
  );
};

export default Lobby;
