import { useEffect, useState } from 'react';

function App() {
  const [rooms, setRooms] = useState<{ [key: string]: number }>({});
  const [isLoading, IsLoading] = useState(true);

  useEffect(loadRooms, []);

  function loadRooms() {}

  return (
    <div className='App'>
      <h1>Here to Slay</h1>
      <form>
        <label>Room: </label>
        <input type='text' />
        <button type='submit'>Join</button>
      </form>

      <br />
      <h2>Find Rooms: </h2>
      <button onClick={loadRooms}>Reload</button>
      {isLoading &&
        (Object.keys(rooms).length ? (
          <h3>rooms</h3>
        ) : (
          <h3>No rooms found :(</h3>
        ))}
    </div>
  );
}

export default App;
