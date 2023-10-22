"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseState = exports.addPlayer = exports.validSender = exports.checkCredentials = exports.removePlayer = exports.random = void 0;
const lodash_clonedeep_1 = __importDefault(require("lodash.clonedeep"));
const rooms_1 = require("../rooms");
const random = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
exports.random = random;
const removePlayer = (room, playerNum) => {
    room.state.secret.playerIds.splice(playerNum, 1);
    room.state.match.players.splice(playerNum, 1);
    room.state.match.isReady.splice(playerNum, 1);
    room.state.board.pop();
    room.state.players.pop();
    room.numPlayers--;
};
exports.removePlayer = removePlayer;
const checkCredentials = (roomId, userId) => {
    if (!rooms_1.rooms[roomId])
        return -1;
    const playerNum = rooms_1.rooms[roomId].state.secret.playerIds.indexOf(userId);
    if (playerNum === -1) {
        return -1;
    }
    else {
        return playerNum;
    }
};
exports.checkCredentials = checkCredentials;
const validSender = (rooms, roomId, userId) => {
    const playerNum = (0, exports.checkCredentials)(roomId, userId);
    if (rooms[roomId].state.turn.player === playerNum &&
        rooms[roomId].state.secret.playerIds[playerNum] === userId) {
        return playerNum;
    }
    else {
        return -1;
    }
};
exports.validSender = validSender;
const addPlayer = (roomId, userId, username) => {
    let room = rooms_1.rooms[roomId];
    room.numPlayers++;
    room.state.secret.playerIds.push(userId);
    room.state.match.players.push(username);
    room.state.players.push({ hand: [] });
    room.state.board.push({
        classes: {
            fighter: 0,
            bard: 0,
            guardian: 0,
            ranger: 0,
            thief: 0,
            wizard: 0
        },
        heroCards: [],
        largeCards: []
    });
    room.state.match.isReady.push(true);
};
exports.addPlayer = addPlayer;
const parseState = (userId, state) => {
    let newState = (0, lodash_clonedeep_1.default)(state);
    const numPlayers = state.match.players.length;
    const playerNum = state.secret.playerIds.indexOf(userId);
    newState.secret = null;
    for (let i = 0; i < numPlayers; i++) {
        if (i !== playerNum) {
            newState.players[i] = null;
        }
    }
    return newState;
};
exports.parseState = parseState;
//# sourceMappingURL=helpers.js.map