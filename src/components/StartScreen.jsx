import { useState } from 'react';

const StartScreen = ({ onStart }) => {
  const [playerName, setPlayerName] = useState('');

  const handleStart = () => {
    if (playerName.trim()) {
      onStart(playerName);
    } else {
      alert("Escribe tú nombre!");
    }
  };

  return (
    <div className="start-screen">
      <h1>OTRO BATTLESHIP: COLOR WARS</h1>
      <form>
        <input
          type="text"
          placeholder="Identifícate"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)} />
        <button onClick={handleStart}>¡A jugar!</button>
      </form>
    </div>
  );
};

export default StartScreen;