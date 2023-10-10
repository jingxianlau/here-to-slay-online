import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000');
socket.on('connect', () => {
  console.log('connected');
});

function App() {
  const [rooms, setRooms] = useState<{ [key: string]: number }>({});
  const [roomId, setRoomId] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);

  useEffect(() => {
    loadRooms();
  }, [rooms, roomId, isPrivate]);

  async function loadRooms() {
    const response = await fetch('http://localhost:4500/getRooms');
    const json = await response.json();
    setRooms(JSON.parse(json));
  }

  function joinRoom(id?: string) {
    const cb = (successful: boolean, res: string) =>
      successful ? alert(`playerId: ${res}`) : alert(res);

    if (id) {
      socket.emit('join-room', id, cb);
    } else {
      socket.emit('join-room', roomId, cb);
    }
  }

  function createRoom() {
    if (
      (roomId.length !== 6 && roomId.length !== 0) ||
      Number.isNaN(Number(roomId))
    ) {
      alert('Invalid Room ID');
    } else {
      socket.emit(
        'create-room',
        roomId,
        isPrivate,
        (successful: boolean, res: string) =>
          successful ? alert(`playerId: ${res}`) : alert(res)
      );
    }
  }

  return (
    <div className='App'>
      <h1>Here to Slay</h1>
      <form>
        <label>Room: </label>
        <input
          type='text'
          value={roomId}
          onChange={e => setRoomId(e.target.value)}
        />
        <br />
        <label>Private: </label>
        <input
          type='checkbox'
          checked={isPrivate}
          onChange={_ => setIsPrivate(!isPrivate)}
        />
        <br />
        <button onClick={() => joinRoom()}>Join</button>
        <button onClick={() => createRoom()}>Create</button>
      </form>

      <br />
      <h2>Find Rooms: </h2>
      <button onClick={loadRooms}>Reload</button>
      {Object.keys(rooms).length ? (
        <div className='rooms'>
          {Object.keys(rooms).map(id => (
            <div className='room' key={id} onClick={() => joinRoom(id)}>
              <div>{id}</div>
              <div>Players: {rooms[id]}</div>
            </div>
          ))}
        </div>
      ) : (
        <h3>No rooms found :(</h3>
      )}
    </div>
  );
}

export default App;
