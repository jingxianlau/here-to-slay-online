"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helpers_1 = require("./functions/helpers");
const game_1 = require("./functions/game");
const lobbyController_1 = require("./controllers/lobbyController");
const rooms_1 = require("./rooms");
const types_1 = require("./types");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000'
}));
app.use(express_1.default.json());
app.get('/get-rooms', lobbyController_1.getRooms);
app.post('/create-room', lobbyController_1.createRoom);
app.post('/join-room', lobbyController_1.joinRoom);
app.listen(4500, () => console.log('express server on port 4500'));
const io = new socket_io_1.Server({
    cors: {
        origin: true,
        credentials: true
    }
});
io.on('connection', socket => {
    socket.on('enter-lobby', (roomId, userId, username, cb) => {
        const playerNum = (0, helpers_1.checkCredentials)(roomId, userId);
        if (playerNum === -1) {
            cb(false, null);
            socket.disconnect();
            return;
        }
        if (rooms_1.rooms[roomId].state.match.players[playerNum] === '' &&
            !rooms_1.rooms[roomId].state.match.gameStarted) {
            rooms_1.rooms[roomId].state.match.players[playerNum] = `Anonymous ${playerNum + 1}`;
        }
        if (rooms_1.rooms[roomId].state.secret.playerIds[playerNum] === userId &&
            (rooms_1.rooms[roomId].state.match.players[playerNum] === username ||
                rooms_1.rooms[roomId].state.match.players[playerNum] ===
                    `Anonymous ${playerNum + 1}`)) {
            socket.join(roomId);
            sendState(roomId);
            cb(true, playerNum);
        }
        else {
            (0, helpers_1.removePlayer)(rooms_1.rooms[roomId], playerNum);
            cb(false, null);
            sendState(roomId);
            socket.disconnect();
        }
    });
    socket.on('leave-lobby', (roomId, userId, cb) => {
        const playerNum = (0, helpers_1.checkCredentials)(roomId, userId);
        if (playerNum === -1) {
            socket.disconnect();
            return;
        }
        if (rooms_1.rooms[roomId].numPlayers === 1) {
            delete rooms_1.rooms[roomId];
            cb();
            socket.disconnect();
            return;
        }
        (0, helpers_1.removePlayer)(rooms_1.rooms[roomId], playerNum);
        cb();
        sendState(roomId);
        socket.disconnect();
    });
    socket.on('ready', (roomId, userId, ready, cb) => {
        const playerNum = (0, helpers_1.checkCredentials)(roomId, userId);
        if (playerNum === -1) {
            cb(false);
            socket.disconnect();
            return;
        }
        rooms_1.rooms[roomId].state.match.isReady[playerNum] = ready;
        sendState(roomId);
        cb(true);
        if (rooms_1.rooms[roomId].state.match.isReady.every(val => val === true) &&
            rooms_1.rooms[roomId].numPlayers >= 3) {
            setTimeout(() => {
                io.in(roomId).emit('start-match');
            }, 500);
        }
    });
    socket.on('start-match', (roomId, playerId) => {
        var _a;
        const state = rooms_1.rooms[roomId].state;
        const numPlayers = rooms_1.rooms[roomId].numPlayers;
        const playerNum = state.secret.playerIds.indexOf(playerId);
        state.secret.playerSocketIds[playerNum] = socket.id;
        if (rooms_1.rooms[roomId].state.match.gameStarted) {
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
            (0, game_1.distributeCards)(rooms_1.rooms[roomId].state, rooms_1.rooms[roomId].numPlayers);
            sendGameState(roomId);
        }
    });
    socket.on('roll', (roomId, userId) => {
        const playerNum = (0, helpers_1.validSender)(roomId, userId);
        if (playerNum === -1 || !rooms_1.rooms[roomId].state.turn.isRolling)
            return;
        if (rooms_1.rooms[roomId].state.turn.phase === 'start-roll') {
            const startRolls = rooms_1.rooms[roomId].state.match.startRolls;
            const roll = (0, game_1.rollDice)();
            const val = roll[0] + roll[1];
            rooms_1.rooms[roomId].state.dice.main.roll = roll;
            rooms_1.rooms[roomId].state.dice.main.total = val;
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
                rooms_1.rooms[roomId].state.turn.player = startRolls.inList[0];
                rooms_1.rooms[roomId].state.turn.phase = 'draw';
                rooms_1.rooms[roomId].state.turn.isRolling = false;
                rooms_1.rooms[roomId].state.dice.main.roll[0] = 1;
                rooms_1.rooms[roomId].state.dice.main.roll[1] = 1;
                setTimeout(() => sendGameState(roomId), 3000);
                return;
            }
            else if (startRolls.rolls[startRolls.rolls.length - 1] !== 0) {
                startRolls.rolls = [];
                for (let i = 0; i < rooms_1.rooms[roomId].numPlayers; i++) {
                    startRolls.rolls.push(0);
                }
                startRolls.maxVal = 0;
            }
            const next = (startRolls.inList.indexOf(playerNum) + 1) % startRolls.inList.length;
            rooms_1.rooms[roomId].state.turn.player = startRolls.inList[next];
            rooms_1.rooms[roomId].state.dice.main.roll[0] = 1;
            rooms_1.rooms[roomId].state.dice.main.roll[1] = 1;
            setTimeout(() => sendGameState(roomId), 3000);
        }
        else {
        }
    });
    socket.on('prepare-card', (roomId, userId, card) => {
        const playerNum = (0, helpers_1.validSender)(roomId, userId);
        const gameState = rooms_1.rooms[roomId].state;
        if (playerNum === -1 ||
            card.player !== playerNum ||
            !gameState.players[playerNum].hand.includes(card)) {
            return;
        }
        gameState.mainDeck.preparedCard = {
            card: card,
            successful: null
        };
        gameState.turn.movesLeft--;
        sendGameState(roomId);
    });
    socket.on('confirm-card', (roomId, userId, useEffect) => {
        const playerNum = (0, helpers_1.validSender)(roomId, userId);
        const gameState = rooms_1.rooms[roomId].state;
        if (playerNum === -1 ||
            !gameState.mainDeck.preparedCard ||
            gameState.mainDeck.preparedCard.successful === null) {
            return;
        }
        if (gameState.mainDeck.preparedCard.successful) {
            if (gameState.mainDeck.preparedCard.card.type === types_1.CardType.hero &&
                !useEffect &&
                gameState.turn.movesLeft === 0) {
                (0, game_1.nextPlayer)(roomId);
            }
            gameState.mainDeck.preparedCard = null;
        }
        else {
            gameState.mainDeck.preparedCard = null;
        }
        sendGameState(roomId);
    });
    socket.on('draw-two', (roomId, userId) => {
        const playerNum = (0, helpers_1.validSender)(roomId, userId);
        const gameState = rooms_1.rooms[roomId].state;
        if (playerNum === -1 || gameState.turn.phase !== 'draw')
            return;
        for (let i = 0; i < 2; i++) {
            let card = gameState.secret.deck.pop();
            card.player = playerNum;
            gameState.players[playerNum].hand.push(card);
        }
        gameState.turn.phase = 'play';
        sendGameState(roomId);
    });
    socket.on('draw-five', (roomId, userId) => {
        const playerNum = (0, helpers_1.validSender)(roomId, userId);
        const gameState = rooms_1.rooms[roomId].state;
        if (playerNum === -1)
            return;
        const hasCards = Boolean(gameState.players[playerNum].hand.length);
        if (hasCards) {
            gameState.turn.movesLeft = 0;
            for (let i = 0; i < gameState.players[playerNum].hand.length; i++) {
                let card = gameState.players[playerNum].hand.pop();
                delete card.player;
                gameState.secret.discardPile.push(card);
                gameState.mainDeck.discardTop = card;
            }
            sendGameState(roomId);
        }
        for (let i = 0; i < 5; i++) {
            let card = gameState.secret.deck.pop();
            card.player = playerNum;
            gameState.players[playerNum].hand.push(card);
        }
        if (hasCards) {
            (0, game_1.nextPlayer)(roomId);
        }
        sendGameState(roomId);
    });
    socket.on('attack', (roomId, userId, monsterId) => { });
    socket.on('hero-effect', (roomId, userId, cardId) => { });
});
io.listen(4000);
console.log('socketio server on port 4000');
function sendState(roomId) {
    io.in(roomId).emit('state', rooms_1.rooms[roomId].state.match);
}
function sendGameState(roomId) {
    const state = rooms_1.rooms[roomId].state;
    for (let i = 0; i < rooms_1.rooms[roomId].numPlayers; i++) {
        const privateState = (0, helpers_1.parseState)(state.secret.playerIds[i], state);
        io.to(state.secret.playerSocketIds[i]).emit('game-state', privateState);
    }
}
//# sourceMappingURL=server.js.map