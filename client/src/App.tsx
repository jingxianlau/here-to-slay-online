import { useEffect, useState } from 'react';

function App() {
  const [rooms, setRooms] = useState<{ [key: string]: number }>({});
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);

  useEffect(() => {
    loadRooms();
  }, []);

  async function loadRooms() {
    const response = await fetch('http://localhost:4500/get-rooms');
    const json = await response.json();
    setRooms(json);
  }

  function changeUsername(name: string) {
    setUsername(name);
    localStorage.setItem('username', name);
  }

  async function joinRoom(id?: string) {
    const res = await fetch('http://localhost:4500/join-room', {
      method: 'POST',
      body: JSON.stringify({ roomId: id ? id : roomId }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const json = await res.json();

    if (json.successful) {
      localStorage.setItem(
        'credentials',
        JSON.stringify({ roomId: id ? id : roomId, userId: json.res })
      );
      alert('success');
    } else {
      alert(json.res);
    }
  }

  async function createRoom() {
    if (
      (roomId.length !== 6 && roomId.length !== 0) ||
      Number.isNaN(Number(roomId))
    ) {
      alert('Invalid Room ID');
    } else {
      const res = await fetch('http://localhost:4500/create-room', {
        method: 'POST',
        body: JSON.stringify({ roomId: roomId, isPrivate: isPrivate }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const json = await res.json();

      if (json.successful) {
        localStorage.setItem(
          'credentials',
          JSON.stringify({ roomId: roomId, userId: json.res })
        );
        alert('success');
      } else {
        alert(json.res);
      }
    }
  }

  return (
    <div className='App'>
      <h1>Here to Slay</h1>
      <form>
        <label>Username: </label>
        <input
          type='text'
          value={username}
          onChange={e => changeUsername(e.target.value)}
        />
        <br />
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
        <button
          onClick={e => {
            e.preventDefault();
            joinRoom();
          }}
        >
          Join
        </button>
        <button
          onClick={e => {
            e.preventDefault();
            createRoom();
          }}
        >
          Create
        </button>
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
