"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removePlayer = exports.random = void 0;
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
//# sourceMappingURL=helpers.js.map