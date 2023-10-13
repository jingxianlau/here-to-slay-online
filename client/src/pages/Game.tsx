import React, { useEffect, useState } from 'react';
import '../game.css';
import { useNavigate } from 'react-router-dom';
import { Socket, io } from 'socket.io-client';
import { getJSON } from '../helpers/getJSON';
import { GameState, Credentials } from '../types';

const Game: React.FC = () => {
  const navigate = useNavigate();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [playerNum, setPlayerNum] = useState(-1);
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

      socket.on('game-state', (state: GameState) => {
        setState(state);
        console.log(state);
      });

      socket.emit('start-match', credentials.roomId, credentials.userId);

      return () => {
        if (socket) socket.disconnect();
      };
    }
  }, []);

  return (
    credentials && (
      <div>
        <header>
          <img src='HTS_logo.png' />
          <p>Game Code: {credentials.roomId}</p>
        </header>
      </div>
    )
  );
};

export default Game;
