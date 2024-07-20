import { useState, useEffect, useRef } from 'react';

const App = () => {
  const [playerName, setPlayerName] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [playerGameBoard, setPlayerGameBoard] = useState(Array(10).fill().map(() => Array(10).fill(0))); // set boards vacios
  const [cpuGameBoard, setCpuGameBoard] = useState(Array(10).fill().map(() => Array(10).fill(0)));
  const [playerTurn, setPlayerTurn] = useState(true);
  const [playerShips, setPlayerShips] = useState([]); //array the chips vacias
  const [cpuShips, setCpuShips] = useState([]);
  const [info, setInfo] = useState('');
  const [turnDisplay, setTurnDisplay] = useState('Partida no iniciada.');
  const gameBoardPlayerRef = useRef(null);
  const gameBoardCpuRef = useRef(null);
  const shipsRef = useRef(null);

  //INICIO

  useEffect(() => {
    if (gameStarted) {
      placeCpuShips();
    }
  }, [gameStarted]);

  //TABLEROS

  const createBoard = (isPlayerBoard) => {
    const board = [];
    for (let i = 0; i < 100; i++) {
      board.push(
        <div
          key={i}
          data-id={i}
          className={`square ${isPlayerBoard ? 'player-board' : 'cpu-board'}`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={e => isPlayerBoard ? drop(e, playerGameBoard) : null}
        />
      );
    }
    return board;
  };

  //valiacion ships en boards
  const isValidPlacement = (length, index, squares) => {
    const row = Math.floor(index / 10);
    const col = index % 10;

    for (let i = 0; i < length; i++) {
      if (col + i >= 10 || squares[index + i].classList.contains('taken')) {
        return false;
      }
    }
    return true;
  };

  // ships en playersboard
  const placeShip = (ship, index, squares, gameBoard, shipsArray) => {
    const shipLength = parseInt(ship.dataset.length);
    const row = Math.floor(index / 10);
    const col = index % 10;
    const shipParts = [];
  
    for (let i = 0; i < shipLength; i++) {
      const square = squares[index + i];
      if (square) {
        square.classList.add('taken', 'player-ship');
        gameBoard[row][col + i] = 1;
        shipParts.push({ row, col: col + i, hit: false });
      }
    }
  
    // Update ships array and game board
    setPlayerShips(prevShips => [...prevShips, shipParts]);
    setPlayerGameBoard([...gameBoard]);
  
    // Remove ship from the prop container
    document.getElementById('game-props').removeChild(ship);
  };
  

  //cpu player
  const placeCpuShips = () => {
    const shipLengths = [5, 3, 3, 2, 1];
    const newCpuShips = [];
    shipLengths.forEach(length => {
      let valid = false;
      while (!valid) {
        const index = Math.floor(Math.random() * 100);
        if (isValidPlacement(length, index, Array.from(gameBoardCpuRef.current.children))) {
          const shipParts = [];
          for (let i = 0; i < length; i++) {
            gameBoardCpuRef.current.children[index + i].classList.add('taken');
            cpuGameBoard[Math.floor(index / 10)][index % 10 + i] = 1;
            shipParts.push({ row: Math.floor(index / 10), col: index % 10 + i });
          }
          newCpuShips.push(shipParts);
          valid = true;
        }
      }
    });
    setCpuShips(newCpuShips);
  };

  const handleCpuBoardClick = (e) => {
    if (playerTurn && !e.target.classList.contains('hit') && !e.target.classList.contains('miss')) {
      const target = e.target;
      const index = parseInt(target.dataset.id);
      const row = Math.floor(index / 10);
      const col = index % 10;

      if (cpuGameBoard[row][col] === 1) {
        target.classList.add('hit');
        cpuGameBoard[row][col] = 2;
        checkShipSunk(cpuShips, row, col, gameBoardCpuRef.current);
        checkGameOver(cpuShips, 'Persona');
      } else {
        target.classList.add('miss');
        cpuGameBoard[row][col] = 3;
      }
      setPlayerTurn(false);
      setTurnDisplay('CPU');
      setTimeout(cpuTurn, 800);
    }
  };

  const cpuTurn = () => {
    const validTargets = Array.from(gameBoardPlayerRef.current.children).filter(
      square => !square.classList.contains('hit') && !square.classList.contains('miss')
    );
    const target = validTargets[Math.floor(Math.random() * validTargets.length)];
    const index = parseInt(target.dataset.id);
    const row = Math.floor(index / 10);
    const col = index % 10;

    if (playerGameBoard[row][col] === 1) {
      target.classList.add('hit');
      playerGameBoard[row][col] = 2;
      checkShipSunk(playerShips, row, col, gameBoardPlayerRef.current);
      checkGameOver(playerShips, 'CPU');
    } else {
      target.classList.add('miss');
      playerGameBoard[row][col] = 3;
    }
    setPlayerTurn(true);
    setTurnDisplay('Persona');
  };

  const checkShipSunk = (ships, row, col, board) => {
    ships.forEach(ship => {
      const index = ship.findIndex(part => part.row === row && part.col === col);
      if (index !== -1) {
        ship[index].hit = true;
        if (ship.every(part => part.hit)) {
          ship.forEach(part => {
            const square = board.querySelector(`[data-id='${part.row * 10 + part.col}']`);
            square.classList.add('sunk');
          });
        }
      }
    });
  };

  const checkGameOver = (ships, player) => {
    if (ships.every(ship => ship.every(part => part.hit))) {
      setInfo(`${player} Win!`);
      gameBoardCpuRef.current.removeEventListener('click', handleCpuBoardClick);
    }
  };

  //DROP SHIPS
  const drop = (e, playerGameBoard) => {
    e.preventDefault();
    const shipId = e.dataTransfer.getData('text');
    const ship = document.getElementById(shipId);
    const target = e.target;
    
    if (target && target.classList.contains('square')) {
      const index = parseInt(target.dataset.id);
      const shipLength = parseInt(ship.dataset.length);
      const targetSquares = Array.from(target.parentNode.children);
  
      if (ship && !isNaN(index) && isValidPlacement(shipLength, index, targetSquares)) {
        placeShip(ship, index, targetSquares, playerGameBoard, playerShips);
      } else {
        setInfo('Invalid placement. Try again.');
      }
    } else {
      setInfo('Invalid drop target. Try again.');
    }
  };

const handleDragStart = (e) => {
    e.dataTransfer.setData('text', e.target.id);
};

// Add drag event listeners to ship elements
useEffect(() => {
    const ships = document.querySelectorAll('.ship');
    ships.forEach(ship => {
        ship.addEventListener('dragstart', handleDragStart);
    });

    return () => {
        ships.forEach(ship => {
            ship.removeEventListener('dragstart', handleDragStart);
        });
    };
}, []);

  const restartGame = () => {
    Array.from(gameBoardPlayerRef.current.children).forEach(square => {
      square.classList.remove('hit', 'miss', 'taken', 'player-ship', 'sunk');
    });
    Array.from(gameBoardCpuRef.current.children).forEach(square => {
      square.classList.remove('hit', 'miss', 'taken', 'sunk');
    });

    setPlayerGameBoard(Array(10).fill().map(() => Array(10).fill(0)));
    setCpuGameBoard(Array(10).fill().map(() => Array(10).fill(0)));

    setPlayerShips([]);
    setCpuShips([]);

    placeCpuShips();

    setTurnDisplay('Persona');
    setInfo('');
    setPlayerTurn(true);
  };

  const handleNameChange = (e) => {
    setPlayerName(e.target.value);
  };

  const handleStartGame = () => {
    if (playerName.trim() !== '') {
      setGameStarted(true);
    } else {
      setInfo('Please enter a name to start the game.');
    }
  };

  return (
    <div className="wrapper">
      <h1>BATTLESHIP: COLOR WARS</h1>
      {!gameStarted ? (
        <div className="start-screen">
          <h2>Hola, ¿Cómo te llamas?</h2>
          <input
            type="text"
            value={playerName}
            onChange={handleNameChange}
            placeholder="Nombre"
          />
          <button onClick={handleStartGame}>Start</button>
          <span id="info">{info}</span>
        </div>
      ) : (
        <>
          <div className="game-container">
            <div>
              <span>🤓 {playerName}</span>
              <div id="game-board-player" className="game-board" ref={gameBoardPlayerRef}>
                {createBoard(Array.from(gameBoardPlayerRef.current?.children || []), true)}
              </div>
            </div>
            <div>
              <span>👾 CPU</span>
              <div
                id="game-board-cpu"
                className="game-board cpu-board-bg"
                ref={gameBoardCpuRef}
                onClick={handleCpuBoardClick}
              >
                {createBoard(Array.from(gameBoardCpuRef.current?.children || []), false)}
              </div>
            </div>
          </div>
          <div>
            <span id="info">{info}</span>
            <div id="game-info">
              <p>🕹️ Turno: <span id="turn-display">{turnDisplay}</span></p>
            </div>
            <span>Caja Persona: ⬤👌 arrastra las piezas al tablero.</span>
            <div id="game-props" ref={shipsRef}>
              <div className="ship" id="ship1" draggable="true" data-length="1"></div>
              <div className="ship" id="ship2" draggable="true" data-length="2"></div>
              <div className="ship" id="ship3" draggable="true" data-length="3"></div>
              <div className="ship" id="ship4" draggable="true" data-length="3"></div>
              <div className="ship" id="ship5" draggable="true" data-length="5"></div>
            </div>
            <div className="btn-container">
              <div className="btn-restart" id="btn-restart" onClick={restartGame}>Restart</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;