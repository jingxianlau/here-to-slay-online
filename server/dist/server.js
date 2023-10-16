"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const uuid_1 = require("uuid");
const helpers_1 = require("./functions/helpers");
const cards_1 = require("./cards/cards");
const admin_ui_1 = require("@socket.io/admin-ui");
const game_1 = require("./functions/game");
const lodash_clonedeep_1 = __importDefault(require("lodash.clonedeep"));
const rooms = {
    '999999': { numPlayers: 0, state: (0, lodash_clonedeep_1.default)(cards_1.initialState), private: false }
};
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000'
}));
app.use(express_1.default.json());
app.get('/get-rooms', (req, res) => {
    let updatedRooms = {};
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
    const userId = (0, uuid_1.v4)();
    let id;
    if (roomId === '') {
        id = 0;
        while (rooms[id] !== undefined || id <= 99999 || id >= 1000000) {
            id = (0, helpers_1.random)(100000, 999999);
        }
        return res.status(400).json({ successful: false, res: 'Invalid ID' });
    }
    else {
        id = roomId;
        if (rooms[id] !== undefined) {
            return res.status(400).json({ successful: false, res: 'ID taken' });
        }
    }
    let gameState = (0, lodash_clonedeep_1.default)(cards_1.initialState);
    let room = rooms[id];
    rooms[id] = {
        numPlayers: 1,
        state: gameState,
        private: isPrivate
    };
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
    room.state.match.isReady.push(true);
    return res.json({ successful: true, res: userId });
});
app.post('/join-room', (req, res) => {
    const { roomId, username } = req.body;
    const room = rooms[req.body.roomId];
    const userId = (0, uuid_1.v4)();
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
        room.state.match.isReady.push(true);
        return res.json({ successful: true, res: userId });
    }
    else {
        return res
            .status(400)
            .json({ successful: false, res: 'Room could not be found' });
    }
});
app.listen(4500, () => console.log('express server on port 4500'));
const io = new socket_io_1.Server({
    cors: {
        origin: true,
        credentials: true
    }
});
io.on('connection', socket => {
    socket.on('enter-match', (roomId, userId, username, cb) => {
        const playerNum = (0, helpers_1.checkCredentials)(rooms, roomId, userId);
        if (playerNum === -1) {
            cb(false, null);
            socket.disconnect();
            return;
        }
        if (rooms[roomId].state.match.players[playerNum] === '' &&
            !rooms[roomId].state.match.gameStarted) {
            rooms[roomId].state.match.players[playerNum] = `Anonymous ${playerNum + 1}`;
        }
        if (rooms[roomId].state.secret.playerIds[playerNum] === userId &&
            (rooms[roomId].state.match.players[playerNum] === username ||
                rooms[roomId].state.match.players[playerNum] ===
                    `Anonymous ${playerNum + 1}`)) {
            socket.join(roomId);
            sendState(roomId);
            cb(true, playerNum);
        }
        else {
            (0, helpers_1.removePlayer)(rooms[roomId], playerNum);
            cb(false, null);
            sendState(roomId);
            socket.disconnect();
        }
    });
    socket.on('leave-match', (roomId, userId, cb) => {
        const playerNum = (0, helpers_1.checkCredentials)(rooms, roomId, userId);
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
        (0, helpers_1.removePlayer)(rooms[roomId], playerNum);
        cb();
        sendState(roomId);
        socket.disconnect();
    });
    socket.on('ready', (roomId, userId, ready, cb) => {
        const playerNum = (0, helpers_1.checkCredentials)(rooms, roomId, userId);
        if (playerNum === -1) {
            cb(false);
            socket.disconnect();
            return;
        }
        rooms[roomId].state.match.isReady[playerNum] = ready;
        sendState(roomId);
        cb(true);
        if (rooms[roomId].state.match.isReady.every(val => val === true) &&
            rooms[roomId].numPlayers >= 3) {
            setTimeout(() => {
                io.in(roomId).emit('start-match');
            }, 500);
        }
    });
    socket.on('start-match', (roomId, playerId) => {
        var _a;
        const state = rooms[roomId].state;
        const numPlayers = rooms[roomId].numPlayers;
        const playerNum = state.secret.playerIds.indexOf(playerId);
        state.secret.playerSocketIds[playerNum] = socket.id;
        if (rooms[roomId].state.match.gameStarted) {
            sendGameState(roomId);
            return;
        }
        if (numPlayers >= 3 &&
            ((_a = io.sockets.adapter.rooms.get(roomId)) === null || _a === void 0 ? void 0 : _a.size) === numPlayers &&
            state.secret.playerSocketIds.every(val => Boolean(val))) {
            state.match.gameStarted = true;
            state.turn.phase = 'start-roll';
            state.turn.isRolling = true;
            for (let i = 0; i < numPlayers; i++) {
                state.match.startRolls.inList.push(i);
                state.match.startRolls.rolls.push(0);
            }
            sendGameState(roomId);
        }
    });
    socket.on('roll', (roomId, userId) => {
        const playerNum = (0, helpers_1.validSender)(rooms, roomId, userId);
        if (playerNum === -1 || !rooms[roomId].state.turn.isRolling) {
            return;
        }
        else if (rooms[roomId].state.turn.phase === 'start-roll') {
            const startRolls = rooms[roomId].state.match.startRolls;
            const roll = (0, game_1.rollDice)();
            const val = roll[0] + roll[1];
            rooms[roomId].state.dice.main.roll = roll;
            rooms[roomId].state.dice.main.total = val;
            startRolls.rolls[playerNum] = val;
            startRolls.maxVal = Math.max(startRolls.maxVal, val);
            sendGameState(roomId);
            for (let i = 0; i < startRolls.inList.length; i++) {
                if (startRolls.rolls[startRolls.inList[i]] < startRolls.maxVal &&
                    startRolls.rolls[startRolls.rolls.length - 1] !== 0) {
                    startRolls.inList.splice(i--, 1);
                }
            }
            if (startRolls.inList.length === 1) {
                rooms[roomId].state.turn.player = startRolls.inList[0];
                rooms[roomId].state.turn.phase = 'draw';
                rooms[roomId].state.turn.isRolling = false;
                rooms[roomId].state.dice.main.roll[0] = 1;
                rooms[roomId].state.dice.main.roll[1] = 1;
                (0, game_1.distributeCards)(rooms[roomId].state, rooms[roomId].numPlayers);
                setTimeout(() => sendGameState(roomId), 3000);
                return;
            }
            else if (startRolls.rolls[startRolls.rolls.length - 1] !== 0) {
                startRolls.rolls = [];
                for (let i = 0; i < rooms[roomId].numPlayers; i++) {
                    startRolls.rolls.push(0);
                }
                startRolls.maxVal = 0;
            }
            const next = (startRolls.inList.indexOf(playerNum) + 1) % startRolls.inList.length;
            rooms[roomId].state.turn.player = startRolls.inList[next];
            rooms[roomId].state.dice.main.roll[0] = 1;
            rooms[roomId].state.dice.main.roll[1] = 1;
            setTimeout(() => sendGameState(roomId), 3000);
        }
        else {
        }
    });
});
io.listen(4000);
console.log('socketio server on port 4000');
(0, admin_ui_1.instrument)(io, { auth: false, mode: 'development' });
function sendState(roomId) {
    io.in(roomId).emit('state', rooms[roomId].state.match);
}
function sendGameState(roomId) {
    const state = rooms[roomId].state;
    for (let i = 0; i < rooms[roomId].numPlayers; i++) {
        const privateState = (0, helpers_1.parseState)(state.secret.playerIds[i], state);
        io.to(state.secret.playerSocketIds[i]).emit('game-state', privateState);
    }
}
//# sourceMappingURL=server.js.map