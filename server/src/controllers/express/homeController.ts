import { v4 as uuid } from 'uuid';
import { rooms } from '../../rooms';
import cloneDeep from 'lodash.clonedeep';
import { initialState } from '../../cards';
import { addPlayer } from '../../functions/helpers';
import { RequestHandler } from 'express';
import random from 'lodash.random';

export const getRooms: RequestHandler = (req, res) => {
  let updatedRooms: { [key: string]: number } = {};
  for (const key of Object.keys(rooms)) {
    if (!rooms[key].private) {
      updatedRooms[key] = rooms[key].numPlayers;
    }
  }
  res.json(updatedRooms);
};

export const createRoom: RequestHandler = (req, res) => {
  const { roomId, isPrivate, username } = req.body;

  // No more rooms available
  if (Object.keys(rooms).length === 900000)
    res.status(400).json({ successful: false, res: 'Invalid ID' });
  const userId = uuid();

  let id;
  // random room ID
  if (roomId === '') {
    id = 0;
    while (rooms[id] !== undefined || id <= 99999 || id >= 1000000) {
      id = random(100000, 999999);
    }

    return res.status(400).json({
      successful: false,
      res: 'Invalid ID (must be a 6 digit number)'
    });
  } else {
    id = roomId;

    // duplicate room ID
    if (rooms[id] !== undefined) {
      return res
        .status(400)
        .json({ successful: false, res: 'Room ID already in use' });
    }
  }

  // setup match
  let gameState = cloneDeep(initialState);
  rooms[roomId] = {
    numPlayers: 0,
    state: gameState,
    private: isPrivate
  };
  addPlayer(id, userId, username);

  return res.json({ successful: true, res: userId });
};

export const joinRoom: RequestHandler = (req, res) => {
  const { roomId, username } = req.body;
  const room = rooms[req.body.roomId];
  const userId = uuid();

  if (room) {
    if (rooms[roomId].state.match.players.includes(username)) {
      return res.json({ successful: false, res: 'Username taken' });
    }

    addPlayer(roomId, userId, username);

    return res.json({ successful: true, res: userId });
  } else {
    return res
      .status(400)
      .json({ successful: false, res: 'Room could not be found' });
  }
};
