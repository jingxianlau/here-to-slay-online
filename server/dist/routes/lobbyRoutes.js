"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const lobbyController_1 = require("../controllers/lobbyController");
const router = express_1.default.Router();
router.get('/get-rooms', lobbyController_1.getRooms);
router.post('/create-room', lobbyController_1.createRoom);
router.post('/join-room', lobbyController_1.joinRoom);
exports.default = router;
//# sourceMappingURL=lobbyRoutes.js.map