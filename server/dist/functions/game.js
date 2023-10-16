"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rollDice = exports.nextPlayer = exports.distributeCards = exports.shuffle = void 0;
const helpers_1 = require("./helpers");
const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
};
exports.shuffle = shuffle;
const distributeCards = (state, numPlayers, playerNum) => {
    (0, exports.shuffle)(state.secret.deck);
    (0, exports.shuffle)(state.secret.leaderPile);
    (0, exports.shuffle)(state.secret.monsterPile);
    state.mainDeck.monsters = [
        state.secret.monsterPile.pop(),
        state.secret.monsterPile.pop(),
        state.secret.monsterPile.pop()
    ];
    for (let i = 0; i < numPlayers; i++) {
        for (let _ = 0; _ < 7; _++) {
            let card = state.secret.deck.pop();
            card.player = playerNum;
            state.players[i].hand.push(card);
        }
        let leader = state.secret.leaderPile.pop();
        leader.player = playerNum;
        state.board[i].classes[leader.class]++;
        state.board[i].largeCards.push(leader);
    }
};
exports.distributeCards = distributeCards;
function nextPlayer(room) {
    let player = room.state.turn.player;
    room.state.turn.player = (player + 1) % room.numPlayers;
}
exports.nextPlayer = nextPlayer;
function rollDice() {
    return [(0, helpers_1.random)(1, 6), (0, helpers_1.random)(1, 6)];
}
exports.rollDice = rollDice;
//# sourceMappingURL=game.js.map