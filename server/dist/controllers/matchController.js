const enterLobby = (roomId, userId, username, cb) => {
    const playerNum = checkCredentials(roomId, userId);
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
        removePlayer(rooms[roomId], playerNum);
        cb(false, null);
        sendState(roomId);
        socket.disconnect();
    }
};
//# sourceMappingURL=matchController.js.map