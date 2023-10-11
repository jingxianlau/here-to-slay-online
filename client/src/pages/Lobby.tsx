import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { Credentials, GameState } from '../types';
import { random } from '../helpers/random';

const Lobby: React.FC = () => {
  const navigate = useNavigate();
  const [matchState, setMatchState] = useState<GameState['match'] | null>(null);
  const [playerNum, setPlayerNum] = useState(-1);
  const credentials = localStorage.getItem('credentials');

  let user: Credentials;
  let username: string | null = null;

  username = localStorage.getItem('username');

  useEffect(() => {
    if (!credentials) {
      navigate('/');
    } else {
      user = JSON.parse(credentials);

      const socket = io('http://localhost:4000');
      socket.on('connect', () => {});

      socket.emit(
        'enter-match',
        user.roomId,
        user.userId,
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

      socket.on('state', (state: GameState) => {
        setMatchState(state.match);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, []);

  if (!credentials) {
    navigate('/');
    return <></>;
  }
  user = JSON.parse(credentials);

  return (
    <>
      <h1>ID: {user.roomId}</h1>
      <h2>{username}</h2>
      {matchState && matchState.players.length >= 3 && <button>Ready!</button>}

      <br />
      <br />
      <div>
        {matchState &&
          matchState.players.map(
            (uname, num) =>
              num !== playerNum && (
                <div key={num}>
                  <h3>{uname}</h3>
                  {matchState.players.length >= 3 && (
                    <h3>
                      {matchState.isReady[matchState.players.indexOf(uname)]
                        ? 'Ready'
                        : 'Not Ready'}
                    </h3>
                  )}
                </div>
              )
          )}
      </div>

      {matchState && matchState.players.length < 3 && (
        <h4>Waiting for Players...</h4>
      )}
    </>
  );
};

export default Lobby;
