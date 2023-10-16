"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rollDice = exports.nextPlayer = exports.distributeCards = exports.shuffle = void 0;
const cards_1 = require("../cards/cards");
const helpers_1 = require("./helpers");
const shuffle = (arr) => {
    let currentIndex = arr.length;
    let randomIndex;
    while (currentIndex > 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [arr[currentIndex], arr[randomIndex]] = [
            arr[randomIndex],
            arr[currentIndex]
        ];
    }
    return arr;
};
exports.shuffle = shuffle;
const distributeCards = (state, numPlayers) => {
    state.secret.deck = (0, exports.shuffle)(state.secret.deck);
    state.secret.leaderPile = (0, exports.shuffle)(state.secret.leaderPile);
    state.secret.monsterPile = (0, exports.shuffle)(state.secret.monsterPile);
    state.mainDeck.monsters = [
        cards_1.monsterPile.pop(),
        cards_1.monsterPile.pop(),
        cards_1.monsterPile.pop()
    ];
    for (let i = 0; i < numPlayers; i++) {
        for (let _ = 0; _ < 7; _++) {
            state.players[i].hand.push(state.secret.deck.pop());
        }
        let leader = state.secret.leaderPile.pop();
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