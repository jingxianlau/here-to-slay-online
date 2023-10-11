import { Server } from 'socket.io';
import express from 'express';
import cors from 'cors';
import { v4 as uuid } from 'uuid';
import { GameState } from './types';
import { random } from './functions/helpers';
import { initialState } from './cards/cards';
import { instrument } from '@socket.io/admin-ui';

const rooms: {
  [key: string]: { numPlayers: number; state: GameState; private: boolean };
} = {};

// EXPRESS SERVER
const app = express();
app.use(
  cors({
    origin: 'http://localhost:3000'
  })
);
app.use(express.json());
app.get('/get-rooms', (req, res) => {
  let updatedRooms: { [key: string]: number } = {};

  for (const key of Object.keys(rooms)) {
    if (!rooms[key].private) {
      updatedRooms[key] = rooms[key].numPlayers;
    }
  }

  res.json(updatedRooms);
});
app.post('/create-room', (req, res) => {
  const { roomId, isPrivate, username } = req.body;

  if (Object.keys(rooms).length === 900000)
    res.status(400).json({ successful: false, res: 'Invalid ID' });
  const userId = uuid();

  let id;
  if (roomId === '') {
    id = 0;
    while (rooms[id] !== undefined || id <= 99999 || id >= 1000000) {
      id = random(100000, 999999);
    }

    return res.status(400).json({ successful: false, res: 'Invalid ID' });
  } else {
    id = roomId;

    if (rooms[id] !== undefined) {
      return res.status(400).json({ successful: false, res: 'ID taken' });
    }
  }

  // setup match
  rooms[id] = { numPlayers: 1, state: initialState, private: isPrivate };
  rooms[id].state.secret.playerIds[0] = userId;
  rooms[id].state.match.players[0] = username;
  rooms[id].state.board[0] = { classes: [], heroCards: [], largeCards: [] };
  return res.json({ successful: true, res: userId });
});
app.post('/join-room', (req, res) => {
  const { roomId, username } = req.body;
  const room = rooms[req.body.roomId];
  const userId = uuid();

  if (room) {
    if (rooms[roomId].state.match.players.includes(username)) {
      return res.json({ successful: false, res: 'Username taken' });
    }

    room.numPlayers++;
    room.state.secret.playerIds.push(userId);
    room.state.match.players.push(username);
    room.state.players.push({ hand: [] });
    room.state.board.push({ classes: [], heroCards: [], largeCards: [] });
    room.state.match.isReady.push(false);
    return res.json({ successful: true, res: userId });
  } else {
    return res
      .status(400)
      .json({ successful: false, res: 'Room could not be found' });
  }
});
app.listen(4500, () => console.log('express server on port 4500'));

// SOCKET-IO SERVER
const io = new Server({
  cors: {
    origin: true,
    credentials: true
  }
});
io.on('connection', socket => {
  socket.on(
    'enter-match',
    (
      roomId: string,
      userId: string,
      username: string,
      cb: (successful: boolean, playerNum: number | null) => void
    ) => {
      if (!rooms[roomId]) {
        cb(false, null);
        socket.disconnect();
        return;
      }

      const playerNum = rooms[roomId].state.secret.playerIds.indexOf(userId);

      if (playerNum === -1) {
        cb(false, null);
        socket.disconnect();
      }

      if (rooms[roomId].state.match.players[playerNum] === '') {
        rooms[roomId].state.match.players[playerNum] = `Anonymous ${playerNum}`;
      }

      if (
        rooms[roomId] &&
        rooms[roomId].state.secret.playerIds[playerNum] === userId &&
        (rooms[roomId].state.match.players[playerNum] === username ||
          rooms[roomId].state.match.players[playerNum] ===
            `Anonymous ${playerNum}`)
      ) {
        socket.join(roomId);
        io.in(roomId).emit('state', rooms[roomId].state);
        cb(true, playerNum);
      } else {
        rooms[roomId].state.secret.playerIds.splice(playerNum, 1);
        rooms[roomId].state.match.players.splice(playerNum, 1);

        cb(false, null);
        socket.disconnect();
      }
    }
  );

  socket.on('ready', (roomId: string, userId: string) => {});

  socket.on('start-match', (roomId: string) => {});
});

io.listen(4000);
console.log('socketio server on port 4000');

instrument(io, { auth: false, mode: 'development' });
