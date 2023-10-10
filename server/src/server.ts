import { Server } from 'socket.io';
import { GameState } from './types';
import { initialState } from './cards/cards';
import { random } from './functions/helpers';

const io = new Server();

const rooms: { [key: string]: { numPlayers: number; state: GameState } } = {};

io.on('connection', socket => {
  console.log(`connected to: ${socket.id}`);

  socket.on(
    'create-room',
    (roomId: string | null, cb: (successful: boolean) => void) => {
      if (Object.keys(rooms).length === 900000) cb(false);

      let id;
      if (!roomId) {
        id = 0;
        while (rooms.hasOwnProperty(id) && id > 99999 && id < 1000000) {
          id = random(100000, 999999);
        }

        socket.join(String(id));
      } else {
        id = roomId;
        socket.join(id);
      }

      // setup match
      rooms[id] = { numPlayers: 1, state: initialState };
      rooms[id].state.match.players[1] = socket.id;
    }
  );

  socket.on(
    'join-room',
    (roomId: string, cb: (successful: boolean) => void) => {
      const room = rooms[roomId];

      if (room) {
        socket.join(roomId);
        cb(true);
      } else cb(false);

      room.numPlayers++;
      room.state.match.players[room.numPlayers] = socket.id;
      room.state.players[room.numPlayers] = { hand: [] };
    }
  );
});

io.listen(4000);
