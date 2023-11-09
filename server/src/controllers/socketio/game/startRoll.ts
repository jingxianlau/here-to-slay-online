import { rollDice } from '../../../functions/game';
import { validSender } from '../../../functions/helpers';
import { rooms } from '../../../rooms';
import { sendGameState } from '../../../server';

export const startRoll = (roomId: string, userId: string) => {
  const playerNum = validSender(roomId, userId);
  if (
    playerNum === -1 ||
    !rooms[roomId].state.turn.isRolling ||
    rooms[roomId].state.turn.phase !== 'start-roll'
  )
    return;

  rooms[roomId].state.turn.movesLeft--;
  const startRolls = rooms[roomId].state.match.startRolls;

  let roll = rollDice();
  let val = roll[0] + roll[1];

  rooms[roomId].state.dice.main.roll = roll;
  rooms[roomId].state.dice.main.total = val;
  startRolls.rolls[playerNum] = val;
  startRolls.maxVal = Math.max(startRolls.maxVal, val);

  sendGameState(roomId);

  // REMOVE LOSING VALUES
  if (startRolls.rolls[startRolls.rolls.length - 1] !== 0) {
    for (let i = 0; i < startRolls.inList.length; i++) {
      if (startRolls.rolls[startRolls.inList[i]] < startRolls.maxVal) {
        startRolls.inList.splice(i--, 1);
      }
    }
  }

  // IF PLAYER WON
  if (startRolls.inList.length === 1) {
    // SETUP MATCH
    rooms[roomId].state.turn.player = startRolls.inList[0];
    rooms[roomId].state.turn.phaseChanged = true;
    rooms[roomId].state.turn.phase = 'draw';
    rooms[roomId].state.turn.isRolling = false;
    rooms[roomId].state.dice.main.roll[0] = 1;
    rooms[roomId].state.dice.main.roll[1] = 1;
    rooms[roomId].state.turn.movesLeft = 3;

    setTimeout(() => {
      sendGameState(roomId);
      rooms[roomId].state.turn.phaseChanged = false;
    }, 3000);

    return;
    // IF TIED (SETUP NEXT ROUND)
  } else if (
    startRolls.rolls[startRolls.inList[startRolls.inList.length - 1]] !== 0
  ) {
    startRolls.rolls = [];
    for (let i = 0; i < rooms[roomId].numPlayers; i++) {
      startRolls.rolls.push(0);
    }
    startRolls.maxVal = 0;
  }

  // RESET PLAYER & ROLL
  const next =
    (startRolls.inList.indexOf(playerNum) + 1) % startRolls.inList.length;
  rooms[roomId].state.turn.player = startRolls.inList[next];
  rooms[roomId].state.turn.movesLeft = 1;
  rooms[roomId].state.dice.main.roll[0] = 1;
  rooms[roomId].state.dice.main.roll[1] = 1;

  setTimeout(() => sendGameState(roomId), 3000);
};
