import { Server } from 'socket.io';
import express from 'express';
import cors from 'cors';
import { v4 as uuid } from 'uuid';
import {
  AnyCard,
  GameState,
  LeaderCard,
  MonsterCard,
  privateState
} from './types';
import { random, removePlayer } from './functions/helpers';
import { initialState, monsterPile } from './cards/cards';
import { instrument } from '@socket.io/admin-ui';
import { parseState, shuffle } from './functions/game';
import cloneDeep from 'lodash.clonedeep';

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

  let gameState = cloneDeep(initialState);

  // setup match
  rooms[id] = { numPlayers: 1, state: gameState, private: isPrivate };
  rooms[id].state.secret.playerIds[0] = userId;
  rooms[id].state.match.players[0] = username;
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
    room.state.board.push({
      classes: {
        FIGHTER: 0,
        BARD: 0,
        GUARDIAN: 0,
        RANGER: 0,
        THIEF: 0,
        WIZARD: 0
      },
      heroCards: [],
      largeCards: []
    });
    room.state.match.isReady.push(false);
    return res.json({ successful: true, res: userId });
  } else {
    return res
      .status(400)
      .json({ successful: false, res: 'Room could not be found' });
  }
});
app.listen(4500, () => console.log('express server on port 4500'));

/*

     BELOW
SOCKET.IO SERVER

 Lobby System 
      &
Game Management

*/

const io = new Server({
  cors: {
    origin: true,
    credentials: true
  }
});

io.on('connection', socket => {
  console.log(`connected to ${socket.id}`);

  // LOBBY SYSTEM
  socket.on(
    'enter-match',
    (
      roomId: string,
      userId: string,
      username: string,
      cb: (successful: boolean, playerNum: number | null) => void
    ) => {
      // check credentials
      const playerNum = checkCredentials(roomId, userId);
      if (playerNum === -1) {
        cb(false, null);
        socket.disconnect();
        return;
      }

      if (
        rooms[roomId].state.match.players[playerNum] === '' &&
        !rooms[roomId].state.match.gameStarted
      ) {
        // fill username
        rooms[roomId].state.match.players[playerNum] = `Anonymous ${
          playerNum + 1
        }`;
      }

      // JOIN ROOM
      if (
        // valid credentials check
        rooms[roomId].state.secret.playerIds[playerNum] === userId &&
        (rooms[roomId].state.match.players[playerNum] === username ||
          rooms[roomId].state.match.players[playerNum] ===
            `Anonymous ${playerNum + 1}`)
      ) {
        socket.join(roomId);

        if (!rooms[roomId].state.match.gameStarted) {
          sendState(roomId);
        }
        cb(true, playerNum);
      } else {
        removePlayer(rooms[roomId].state, playerNum);
        cb(false, null);
        socket.disconnect();
      }
    }
  );

  socket.on(
    'ready',
    (
      roomId: string,
      userId: string,
      ready: boolean,
      cb: (successful: boolean) => void
    ) => {
      const playerNum = checkCredentials(roomId, userId);
      if (playerNum === -1) {
        cb(false);
        socket.disconnect();
        return;
      }

      rooms[roomId].state.match.isReady[playerNum] = ready;

      sendState(roomId);
      cb(true);

      if (
        rooms[roomId].state.match.isReady.every(val => val === true) &&
        rooms[roomId].numPlayers >= 3
      ) {
        setTimeout(() => {
          io.in(roomId).emit('start-match');
        }, 500);
      }
    }
  );

  // GET SOCKET IDS & DISTRIBUTE CARDS
  socket.on('start-match', (roomId: string, playerId: string) => {
    const state = rooms[roomId].state;
    const numPlayers = rooms[roomId].numPlayers;

    const playerNum = state.secret.playerIds.indexOf(playerId);
    state.secret.playerSocketIds[playerNum] = socket.id;

    if (rooms[roomId].state.match.gameStarted) {
      sendGameState(roomId);
      return;
    }

    if (
      numPlayers >= 3 &&
      io.sockets.adapter.rooms.get(roomId)?.size === numPlayers &&
      state.secret.playerSocketIds.every(val => Boolean(val))
    ) {
      state.match.gameStarted = true;

      // distribute cards
      state.secret.deck = shuffle(state.secret.deck);
      state.secret.leaderPile = shuffle(
        state.secret.leaderPile
      ) as LeaderCard[];
      state.secret.monsterPile = shuffle(
        state.secret.monsterPile
      ) as MonsterCard[];

      state.mainDeck.monsters = [
        monsterPile.pop() as MonsterCard,
        monsterPile.pop() as MonsterCard,
        monsterPile.pop() as MonsterCard
      ];
      for (let i = 0; i < numPlayers; i++) {
        for (let _ = 0; _ < 7; _++) {
          state.players[i].hand.push(state.secret.deck.pop() as AnyCard);
        }

        let leader = state.secret.leaderPile.pop() as LeaderCard;
        state.board[i].classes[leader.class]++;
        state.board[i].largeCards.push(leader);
      }

      state.match.phase = 'start-roll';

      // send setup state
      sendGameState(roomId);
    }
  });
});

io.listen(4000);
console.log('socketio server on port 4000');

instrument(io, { auth: false, mode: 'development' });

// HELPER FUNCTIONS
function checkCredentials(roomId: string, userId: string): number {
  if (!rooms[roomId]) return -1;

  const playerNum = rooms[roomId].state.secret.playerIds.indexOf(userId);

  if (playerNum === -1) {
    return -1;
  } else {
    return playerNum;
  }
}

function sendState(roomId: string) {
  io.in(roomId).emit('state', rooms[roomId].state.match);
}

function sendGameState(roomId: string) {
  const state = rooms[roomId].state;

  for (let i = 0; i < rooms[roomId].numPlayers; i++) {
    const privateState = parseState(state.secret.playerIds[i], state);
    io.to(state.secret.playerSocketIds[i]).emit('game-state', privateState);
  }
}
