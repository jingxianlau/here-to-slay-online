"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const uuid_1 = require("uuid");
const helpers_1 = require("./helpers");
const cards_1 = require("../cards/cards");
const router = express_1.default.Router();
const rooms = {};
router.get('/get-rooms', (req, res) => {
    let updatedRooms = {};
    for (const key of Object.keys(rooms)) {
        if (!rooms[key].private) {
            updatedRooms[key] = rooms[key].numPlayers;
        }
    }
    res.json(JSON.stringify(updatedRooms));
});
router.post('/create-room', (req, res) => {
    const { roomId, isPrivate } = req.body;
    if (Object.keys(rooms).length === 900000)
        res.json({ successful: false, res: 'Invalid ID' });
    const userId = (0, uuid_1.v4)();
    let id;
    if (roomId === '') {
        id = 0;
        while (rooms[id] !== undefined || id <= 99999 || id >= 1000000) {
            id = (0, helpers_1.random)(100000, 999999);
        }
        res.json({ successful: false, res: 'Invalid ID' });
    }
    else {
        id = roomId;
        if (rooms[id] !== undefined) {
            res.json({ successful: false, res: 'ID taken' });
        }
    }
    rooms[id] = { numPlayers: 1, state: cards_1.initialState, private: isPrivate };
    rooms[id].state.match.players[1] = userId;
    res.json({ successful: true, res: userId });
});
router.post('/join-room', (req, res) => {
    const room = rooms[req.body.roomId];
    const userId = (0, uuid_1.v4)();
    if (room) {
        room.numPlayers++;
        room.state.match.players[room.numPlayers] = userId;
        room.state.players[room.numPlayers] = { hand: [] };
        res.json({ successful: true, res: userId });
    }
    else {
        res.json({ successful: false, res: 'Room could not be found' });
    }
});
exports.default = router;
//# sourceMappingURL=roomRoutes.js.map