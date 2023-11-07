import { Server } from 'socket.io';
import express from 'express';

import expressServer from './controllers/express/expressServer';
import { addPlayer, parseState } from './functions/helpers';
import { rooms } from './rooms';

import {
  enterLobby,
  leaveLobby,
  ready,
  startMatch
} from './controllers/socketio/lobby/lobby';
import { startRoll } from './controllers/socketio/game/startRoll';
import {
  challenge,
  challengeRoll,
  confirmChallenge,
  prepareCard
} from './controllers/socketio/game/challenge';
import { drawFive, drawTwo } from './controllers/socketio/game/draw';
import { modifyRoll } from './controllers/socketio/game/modify';
import {
  attackMonster,
  attackRoll,
  confirmAttack
} from './controllers/socketio/game/attack';
import { useEffect } from './controllers/socketio/game/useEffect';
import { distributeCards } from './functions/game';
import { initialState } from './cards';
import cloneDeep from 'lodash.clonedeep';

/* EXPRESS SERVER */
const app = express();
app.use(expressServer);
const httpServer = app.listen(4000, () => console.log('server on port 4000'));

/* SOCKET.IO  SERVER */
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000'
  }
});

io.on('connection', socket => {
  /* LOBBY */
  socket.on('enter-lobby', enterLobby(socket));
  socket.on('leave-lobby', leaveLobby(socket));
  socket.on('ready', ready(socket));
  socket.on('start-match', startMatch(socket));

  /* GAME */
  // start roll
  socket.on('start-roll', startRoll);

  // draw
  socket.on('draw-two', drawTwo);
  socket.on('draw-five', drawFive);

  // TO TEST: challenge
  socket.on('prepare-card', prepareCard);
  socket.on('challenge', challenge);
  socket.on('challenge-roll', challengeRoll);
  socket.on('confirm-challenge', confirmChallenge);

  // TODO: modify
  socket.on('modify-roll', modifyRoll);

  // TODO: attack
  socket.on('attack-monster', attackMonster);
  socket.on('attack-roll', attackRoll);
  socket.on('confirm-attack', confirmAttack);

  // TODO: use-effect
  socket.on('use-effect', useEffect);

  // DEV: RESET GAME STATE
  socket.on('reset-state', (roomId: string) => {
    const playerSocketIds = cloneDeep(
      rooms[roomId].state.secret.playerSocketIds
    );
    const playerIds = cloneDeep(rooms[roomId].state.secret.playerIds);
    const usernames = cloneDeep(rooms[roomId].state.match.players);

    rooms[roomId].numPlayers = 0;
    rooms[roomId].state = cloneDeep(initialState);
    const state = rooms[roomId].state;

    for (let i = 0; i < playerIds.length; i++) {
      addPlayer(roomId, playerIds[i], usernames[i]);
    }

    state.match.gameStarted = true;
    state.turn.phase = 'draw';
    state.turn.isRolling = false;
    state.turn.player = 0;
    state.dice.main.roll[0] = 1;
    state.dice.main.roll[1] = 1;
    state.turn.movesLeft = 3;
    state.secret.playerSocketIds = playerSocketIds;

    distributeCards(state, rooms[roomId].numPlayers);

    sendGameState(roomId);
  });
});

/* 
HELPER FUNCTIONS 
- sendState (lobby)
- sendGameState (in match)
- confirmNumPlayers
*/
export function sendState(roomId: string) {
  io.in(roomId).emit('state', rooms[roomId].state.match);
}

export function sendGameState(roomId: string) {
  const state = rooms[roomId].state;

  for (let i = 0; i < rooms[roomId].numPlayers; i++) {
    const privateState = parseState(state.secret.playerIds[i], state);
    io.to(state.secret.playerSocketIds[i]).emit('game-state', privateState);
  }
}

export function emit(roomId: string, message: string): void {
  io.in(roomId).emit(message);
}

export function confirmNumPlayers(roomId: string): boolean {
  return (
    io.sockets.adapter.rooms.get(roomId)?.size === rooms[roomId].numPlayers
  );
}
