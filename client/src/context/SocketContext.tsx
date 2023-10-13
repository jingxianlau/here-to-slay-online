import React, { ReactNode, createContext, useState } from 'react';
import { Socket } from 'socket.io-client';

export const SocketContext = createContext<{
  socket: Socket | null;
  setSocket: React.Dispatch<React.SetStateAction<Socket | null>> | null;
}>({ socket: null, setSocket: null });

export const SocketContextProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  return (
    <SocketContext.Provider value={{ socket, setSocket }}>
      {children}
    </SocketContext.Provider>
  );
};
