import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { Credentials } from '../types';
import { random } from '../helpers/random';

const Lobby: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const credentials = localStorage.getItem('credentials');

  let user: Credentials;
  let username: string | null = null;

  username = localStorage.getItem('username');
  console.log(username);

  useEffect(() => {
    if (!credentials) {
      navigate('/');
      return;
    }
    user = JSON.parse(credentials);

    const socket = io('http://localhost:4000');
    socket.on('connect', () => console.log('connected to server'));
    socket.emit(
      'enter-match',
      user.roomId,
      user.userId,
      username,
      (successful: boolean) => {
        if (!successful) {
          localStorage.removeItem('credentials');
          alert('could not connect to match');
          navigate('/');
        }
      }
    );
  }, []);

  if (!credentials) {
    navigate('/');
    return <></>;
  }
  user = JSON.parse(credentials);

  return (
    <>
      <h1>Hello, {username}</h1>
      <h2>Welcome to Room {user.roomId}</h2>
    </>
  );
};

export default Lobby;
