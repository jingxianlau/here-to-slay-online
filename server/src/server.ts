import { Server } from 'socket.io';
import { GameState } from './types';
import { deck, leaderPile, monsterPile } from './cards/cards';

const io = new Server();

const rooms: { [key: string]: { numPlayers: number; state: GameState } } = {};

const initialState: GameState = {
  // PRIVATE
  secret: {
    deck: deck,
    leaderPile: leaderPile
  },
  players: {
    1: { hand: [] }
  },

  // PUBLIC
  dice: {
    main: { roll: [0, 0], modifier: 0 },
    defend: null
  },
  board: {
    1: {
      classes: [],
      heroCards: [],
      largeCards: []
    }
  },
  mainDeck: {
    discardPile: [],
    monsterPile: monsterPile,
    monsters: null,
    preparedCard: null
  },

  // MATCH VARIABLES
  match: {
    gameStarted: false,
    players: { 1: '' },
    player: 0,
    turnsLeft: 3,
    phase: 'draw',
    isRolling: false
  }
};

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
          id = Math.floor(100000 + Math.random() * 900000);
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
