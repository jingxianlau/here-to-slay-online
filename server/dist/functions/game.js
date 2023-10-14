"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.distributeCards = exports.shuffle = exports.parseState = void 0;
const cards_1 = require("../cards/cards");
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
//# sourceMappingURL=game.js.map