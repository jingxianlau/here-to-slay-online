"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rooms = void 0;
const lodash_clonedeep_1 = __importDefault(require("lodash.clonedeep"));
const cards_1 = require("../cards/cards");
exports.rooms = {
    '999999': { numPlayers: 0, state: (0, lodash_clonedeep_1.default)(cards_1.initialState), private: false }
};
//# sourceMappingURL=rooms.js.map