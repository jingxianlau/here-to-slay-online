"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinRoom = exports.createRoom = exports.getRooms = void 0;
const uuid_1 = require("uuid");
const rooms_1 = require("../rooms");
const lodash_clonedeep_1 = __importDefault(require("lodash.clonedeep"));
const cards_1 = require("../cards/cards");
const helpers_1 = require("../functions/helpers");
const getRooms = (req, res) => {
    let updatedRooms = {};
    for (const key of Object.keys(rooms_1.rooms)) {
        if (!rooms_1.rooms[key].private) {
            updatedRooms[key] = rooms_1.rooms[key].numPlayers;
        }
    }
    res.json(updatedRooms);
};
exports.getRooms = getRooms;
const createRoom = (req, res) => {
    const { roomId, isPrivate, username } = req.body;
    if (Object.keys(rooms_1.rooms).length === 900000)
        res.status(400).json({ successful: false, res: 'Invalid ID' });
    const userId = (0, uuid_1.v4)();
    let id;
    if (roomId === '') {
        id = 0;
        while (rooms_1.rooms[id] !== undefined || id <= 99999 || id >= 1000000) {
            id = (0, helpers_1.random)(100000, 999999);
        }
        return res.status(400).json({
            successful: false,
            res: 'Invalid ID (must be a 6 digit number)'
        });
    }
    else {
        id = roomId;
        if (rooms_1.rooms[id] !== undefined) {
            return res
                .status(400)
                .json({ successful: false, res: 'Room ID already in use' });
        }
    }
    let gameState = (0, lodash_clonedeep_1.default)(cards_1.initialState);
    rooms_1.rooms[roomId] = {
        numPlayers: 0,
        state: gameState,
        private: isPrivate
    };
    (0, helpers_1.addPlayer)(id, userId, username);
    return res.json({ successful: true, res: userId });
};
exports.createRoom = createRoom;
const joinRoom = (req, res) => {
    const { roomId, username } = req.body;
    const room = rooms_1.rooms[req.body.roomId];
    const userId = (0, uuid_1.v4)();
    if (room) {
        if (rooms_1.rooms[roomId].state.match.players.includes(username)) {
            return res.json({ successful: false, res: 'Username taken' });
        }
        (0, helpers_1.addPlayer)(roomId, userId, username);
        return res.json({ successful: true, res: userId });
    }
    else {
        return res
            .status(400)
            .json({ successful: false, res: 'Room could not be found' });
    }
};
exports.joinRoom = joinRoom;
//# sourceMappingURL=lobbyController.js.map