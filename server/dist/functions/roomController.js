"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRooms = void 0;
const getRooms = (req, res) => {
    let updatedRooms = {};
    for (const key of Object.keys(rooms)) {
        if (!rooms[key].private) {
            updatedRooms[key] = rooms[key].numPlayers;
        }
    }
    res.json(JSON.stringify(updatedRooms));
};
exports.getRooms = getRooms;
//# sourceMappingURL=roomController.js.map