import React, { useEffect, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { Credentials, GameState } from '../types';
import { getJSON } from '../helpers/getJSON';

const Lobby: React.FC = () => {
  const navigate = useNavigate();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [matchState, setMatchState] = useState<GameState['match'] | null>(null);
  const [playerNum, setPlayerNum] = useState(-1);
  const [isReady, setIsReady] = useState(false);
  const [credentials, setCredentials] = useState<Credentials>(
    getJSON('credentials')
  );
  const [username, setUsername] = useState(
    localStorage.getItem('username') as string
  );

  useEffect(() => {
    if (!credentials) {
      navigate('/');
      return;
    } else {
      // create socket connection
      console.log('connected to server');
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

  return (
    credentials && (
      <>
        <h1>ID: {credentials.roomId}</h1>
        <h2>{username}</h2>
        <button onClick={getReady}>{isReady ? 'Not Ready' : 'Ready!'}</button>

        <br />
        <br />
        <div>
          {matchState &&
            matchState.players.map(
              (uname, num) =>
                num !== playerNum && (
                  <div key={num}>
                    <h3>{uname}</h3>
                    <h3>
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
      </>
    )
  );
};

export default Lobby;
