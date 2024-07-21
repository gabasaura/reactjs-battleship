import { useState } from 'react';
import GameBoard from './components/GameBoard';
import StartScreen from './components/StartScreen';


const App = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerName, setPlayerName] = useState('');

  const handleGameStart = (name) => {
    setPlayerName(name);
    setGameStarted(true);
  };

  const handleGameRestart = () => {
    setGameStarted(false);
    setPlayerName('');
  };

  return (
    <div className="app">
      {gameStarted ? (
        <GameBoard playerName={playerName} onGameRestart={handleGameRestart} />
      ) : (
        <StartScreen onStart={handleGameStart} />
      )}
    </div>
  );
};

export default App;