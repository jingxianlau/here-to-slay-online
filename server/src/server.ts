import { Server } from 'socket.io';
import express from 'express';
import cors from 'cors';
import {
  checkCredentials,
  removePlayer,
  validSender,
  parseState
} from './functions/helpers';
import { distributeCards, nextPlayer, rollDice } from './functions/game';
import { createRoom, getRooms, joinRoom } from './controllers/lobbyController';
import { rooms } from './rooms';
import { AnyCard, CardType } from './types';

/* EXPRESS SERVER */
const app = express();
app.use(
  cors({
    origin: 'http://localhost:3000'
  })
);
app.use(express.json());

app.get('/get-rooms', getRooms);
app.post('/create-room', createRoom);
app.post('/join-room', joinRoom);

app.listen(4500, () => console.log('express server on port 4500'));

/* SOCKET.IO  SERVER */

const io = new Server({
  cors: {
    origin: true,
    credentials: true
  }
});

io.on('connection', socket => {
  /*
  
  MATCH
  - 'enter-lobby'
  - 'leave-lobby'
  - 'ready'
  - 'start-match'

  */

  socket.on(
    'enter-lobby',
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

      // join
      if (
        // valid credentials check
        rooms[roomId].state.secret.playerIds[playerNum] === userId &&
        (rooms[roomId].state.match.players[playerNum] === username ||
          rooms[roomId].state.match.players[playerNum] ===
            `Anonymous ${playerNum + 1}`)
      ) {
        socket.join(roomId);
        sendState(roomId);
        cb(true, playerNum);
      } else {
        removePlayer(rooms[roomId], playerNum);
        cb(false, null);
        sendState(roomId);
        socket.disconnect();
      }
    }
  );

  socket.on('leave-lobby', (roomId: string, userId: string, cb: () => void) => {
    const playerNum = checkCredentials(roomId, userId);
    if (playerNum === -1) {
      socket.disconnect();
      return;
    }

    if (rooms[roomId].numPlayers === 1) {
      delete rooms[roomId];
      cb();
      socket.disconnect();
      return;
    }

    removePlayer(rooms[roomId], playerNum);
    cb();
    sendState(roomId);
    socket.disconnect();
  });

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
      state.turn.phase = 'start-roll';
      state.turn.isRolling = true;

      for (let i = 0; i < numPlayers; i++) {
        // starting roll
        state.match.startRolls.inList.push(i);
        state.match.startRolls.rolls.push(0);
      }

      distributeCards(rooms[roomId].state, rooms[roomId].numPlayers);

      sendGameState(roomId);
    }
  });

  /* 
  
  GAME
  - 'roll'
  - 'prepare-card'
  - 'confirm-card'
  - 'draw-two'
  - 'draw-five'

  */

  socket.on('roll', (roomId: string, userId: string) => {
    const playerNum = validSender(roomId, userId);
    if (playerNum === -1 || !rooms[roomId].state.turn.isRolling) return;

    if (rooms[roomId].state.turn.phase === 'start-roll') {
      // START ROLL
      const startRolls = rooms[roomId].state.match.startRolls;

      const roll = rollDice();
      const val = roll[0] + roll[1];

      rooms[roomId].state.dice.main.roll = roll;
      rooms[roomId].state.dice.main.total = val;
      startRolls.rolls[playerNum] = val;
      startRolls.maxVal = Math.max(startRolls.maxVal, val);

      sendGameState(roomId);

      // REMOVE LOSING VALUES
      for (let i = 0; i < startRolls.inList.length; i++) {
        if (
          startRolls.rolls[startRolls.inList[i]] < startRolls.maxVal &&
          startRolls.rolls[startRolls.rolls.length - 1] !== 0
        ) {
          startRolls.inList.splice(i--, 1);
        }
      }

      // IF PLAYER WON
      if (startRolls.inList.length === 1) {
        // SETUP MATCH
        rooms[roomId].state.turn.player = startRolls.inList[0];
        rooms[roomId].state.turn.phase = 'draw';
        rooms[roomId].state.turn.isRolling = false;
        rooms[roomId].state.dice.main.roll[0] = 1;
        rooms[roomId].state.dice.main.roll[1] = 1;

        setTimeout(() => sendGameState(roomId), 3000);
        return;
        // IF TIED (SETUP NEXT ROUND)
      } else if (startRolls.rolls[startRolls.rolls.length - 1] !== 0) {
        startRolls.rolls = [];
        for (let i = 0; i < rooms[roomId].numPlayers; i++) {
          startRolls.rolls.push(0);
        }
        startRolls.maxVal = 0;
      }

      // RESET PLAYER & ROLL
      const next =
        (startRolls.inList.indexOf(playerNum) + 1) % startRolls.inList.length;
      rooms[roomId].state.turn.player = startRolls.inList[next];
      rooms[roomId].state.dice.main.roll[0] = 1;
      rooms[roomId].state.dice.main.roll[1] = 1;

      setTimeout(() => sendGameState(roomId), 3000);
    } else {
      // STANDARD ROLL
    }
  });

  socket.on('prepare-card', (roomId: string, userId: string, card: AnyCard) => {
    const playerNum = validSender(roomId, userId);
    const gameState = rooms[roomId].state;
    if (
      playerNum === -1 ||
      card.player !== playerNum ||
      !gameState.players[playerNum].hand.includes(card)
    ) {
      return;
    }

    gameState.mainDeck.preparedCard = {
      card: card,
      successful: null
    };

    gameState.turn.movesLeft--;

    sendGameState(roomId);
  });

  socket.on(
    'confirm-card',
    (roomId: string, userId: string, useEffect?: boolean) => {
      const playerNum = validSender(roomId, userId);
      const gameState = rooms[roomId].state;
      if (
        playerNum === -1 ||
        !gameState.mainDeck.preparedCard ||
        gameState.mainDeck.preparedCard.successful === null
      ) {
        return;
      }

      if (gameState.mainDeck.preparedCard.successful) {
        // no more moves
        if (
          gameState.mainDeck.preparedCard.card.type === CardType.hero &&
          !useEffect &&
          gameState.turn.movesLeft === 0
        ) {
          nextPlayer(roomId);
        }

        // USE CARD EFFECT

        gameState.mainDeck.preparedCard = null;
      } else {
        // DESTROY CARD
        gameState.mainDeck.preparedCard = null;
      }

      sendGameState(roomId);
    }
  );

  socket.on('draw-two', (roomId: string, userId: string) => {
    const playerNum = validSender(roomId, userId);
    const gameState = rooms[roomId].state;
    if (playerNum === -1 || gameState.turn.phase !== 'draw') return;

    for (let i = 0; i < 2; i++) {
      let card = gameState.secret.deck.pop() as AnyCard;
      card.player = playerNum;
      gameState.players[playerNum].hand.push(card);
    }

    gameState.turn.phase = 'play';
    sendGameState(roomId);
  });
  socket.on('draw-five', (roomId: string, userId: string) => {
    const playerNum = validSender(roomId, userId);
    const gameState = rooms[roomId].state;
    if (playerNum === -1) return;

    const hasCards = Boolean(gameState.players[playerNum].hand.length);
    if (hasCards) {
      gameState.turn.movesLeft = 0;
      for (let i = 0; i < gameState.players[playerNum].hand.length; i++) {
        let card = gameState.players[playerNum].hand.pop() as AnyCard;
        delete card.player;
        gameState.secret.discardPile.push(card);
        gameState.mainDeck.discardTop = card;
      }
      sendGameState(roomId);
    }

    for (let i = 0; i < 5; i++) {
      let card = gameState.secret.deck.pop() as AnyCard;
      card.player = playerNum;
      gameState.players[playerNum].hand.push(card);
    }

    if (hasCards) {
      nextPlayer(roomId);
    }
    sendGameState(roomId);
  });

  socket.on(
    'attack',
    (roomId: string, userId: string, monsterId: string) => {}
  );

  socket.on(
    'hero-effect',
    (roomId: string, userId: string, cardId: string) => {}
  );
});

io.listen(4000);
console.log('socketio server on port 4000');

/* 

HELPER FUNCTIONS 
- sendState (lobby)
- sendGameState (in match)

*/

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
