import cors from 'cors';
import { createRoom, getRooms, joinRoom } from './homeController';

import express from 'express';
const router = express.Router();

router.use(
  cors({
    origin: 'http://localhost:3000'
  })
);
router.use(express.json());

router.get('/get-rooms', getRooms);
router.post('/create-room', createRoom);
router.post('/join-room', joinRoom);

export default router;
