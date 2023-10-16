"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseState = exports.validSender = exports.checkCredentials = exports.removePlayer = exports.random = void 0;
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
const checkCredentials = (rooms, roomId, userId) => {
    if (!rooms[roomId])
        return -1;
    const playerNum = rooms[roomId].state.secret.playerIds.indexOf(userId);
    if (playerNum === -1) {
        return -1;
    }
    else {
        return playerNum;
    }
};
exports.checkCredentials = checkCredentials;
const validSender = (rooms, roomId, userId) => {
    const playerNum = (0, exports.checkCredentials)(rooms, roomId, userId);
    if (rooms[roomId].state.turn.player === playerNum &&
        rooms[roomId].state.secret.playerIds[playerNum] === userId) {
        return playerNum;
    }
    else {
        return -1;
    }
};
exports.validSender = validSender;
const parseState = (userId, state) => {
    let copy = JSON.parse(JSON.stringify(state));
    const numPlayers = state.match.players.length;
    const playerNum = state.secret.playerIds.indexOf(userId);
    let newState = copy;
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