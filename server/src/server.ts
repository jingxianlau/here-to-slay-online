import { Server } from 'socket.io';
import express from 'express';
import cors from 'cors';
import { v4 as uuid } from 'uuid';
import { GameState } from './types';
import { initialState } from './cards/cards';
import { random } from './functions/helpers';

const rooms: {
  [key: string]: { numPlayers: number; state: GameState; private: boolean };
} = {};

const app = express();
app.use(
  cors({
    origin: 'http://localhost:3000'
  })
);
app.get('/getRooms', (req, res) => {
  let updatedRooms: { [key: string]: number } = {};

  for (const key of Object.keys(rooms)) {
    if (!rooms[key].private) {
      updatedRooms[key] = rooms[key].numPlayers;
    }
  }

  res.json(JSON.stringify(updatedRooms));
});
app.listen(4500, () => console.log('express server on port 4500'));

const io = new Server({ cors: { origin: 'http://localhost:3000' } });
io.on('connection', socket => {
  console.log(`connected to: ${socket.id}`);

  socket.on(
    'create-room',
    (
      roomId: string,
      isPrivate: boolean,
      cb: (successful: boolean, res: string) => void
    ) => {
      if (Object.keys(rooms).length === 900000) cb(false, 'Invalid ID');
      const userId = uuid();

      let id;
      if (roomId === '') {
        id = 0;
        while (rooms[id] !== undefined || id <= 99999 || id >= 1000000) {
          id = random(100000, 999999);
        }

        socket.join(String(id));
      } else {
        id = roomId;

        if (rooms[id] === undefined) {
          socket.join(id);
        } else {
          cb(false, 'ID already taken');
        }
      }

      // setup match
      rooms[id] = { numPlayers: 1, state: initialState, private: isPrivate };
      rooms[id].state.match.players[1] = userId;
      cb(true, userId);
    }
  );

  socket.on(
    'join-room',
    (roomId: string, cb: (successful: boolean, res: string) => void) => {
      const room = rooms[roomId];
      const userId = uuid();

      if (room) {
        socket.join(roomId);
        cb(true, userId);
      } else cb(false, 'Room could not be found');

      room.numPlayers++;
      room.state.match.players[room.numPlayers] = userId;
      room.state.players[room.numPlayers] = { hand: [] };
      cb(true, userId);
    }
  );
});

io.listen(4000);
console.log('socketio server on port 4000');
