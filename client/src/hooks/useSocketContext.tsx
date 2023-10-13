import { useContext } from 'react';
import { SocketContext } from '../context/SocketContext';
import { Socket } from 'socket.io-client';

const useSocketContext = (): {
  socket: Socket | null;
  setSocket: React.Dispatch<React.SetStateAction<Socket | null>>;
} => {
  const { socket, setSocket } = useContext(SocketContext);

  const yesSocket = socket;

  if (!setSocket) throw console.error('Invalid SocketContext');
  else return { socket: yesSocket, setSocket };
};

export default useSocketContext;
