import { useState, useEffect, useRef } from 'react';

const GameBoard = ({ playerName, onGameRestart }) => {
  const [playerGameBoard, setPlayerGameBoard] = useState(Array(10).fill().map(() => Array(10).fill(0)));
  const [cpuGameBoard, setCpuGameBoard] = useState(Array(10).fill().map(() => Array(10).fill(0)));
  const [playerTurn, setPlayerTurn] = useState(false); // Start with false; player cannot play until all ships are placed uwu
  const [playerShips, setPlayerShips] = useState([]);
  const [cpuShips, setCpuShips] = useState([]);
  const [info, setInfo] = useState('');
  const [turnDisplay, setTurnDisplay] = useState('Organiza tus barcos!');
  const [selectedShip, setSelectedShip] = useState(null);
  const [availableShips, setAvailableShips] = useState([
    { id: 'ship1', length: 1, name: 'Amarillo' },
    { id: 'ship2', length: 2, name: 'Lila' },
    { id: 'ship3', length: 3, name: 'Indigo' },
    { id: 'ship4', length: 3, name: 'Ceruleo' },
    { id: 'ship5', length: 5, name: 'Naranja' }
  ]);
  const [shipsPlaced, setShipsPlaced] = useState(false); // posicionamiento barcos en board.
  const [gameOver, setGameOver] = useState(false); // is game over?

  const gameBoardPlayerRef = useRef(null);
  const gameBoardCpuRef = useRef(null);
  const shipsRef = useRef(null);

  const createBoard = (squaresArray, isPlayerBoard, isInteractable) => {
    const board = [];
    for (let i = 0; i < 100; i++) {
      board.push(
        <div
          key={i}
          data-id={i}
          className={`square ${isPlayerBoard ? 'player-board' : 'cpu-board'}`}
          onClick={isInteractable && isPlayerBoard ? handleSquareClick : null}
          style={{ cursor: isInteractable ? 'pointer' : 'not-allowed' }} // not allowed goty
        />
      );
    }
    return board;
  };

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

  const placeShip = (ship, index, squares, gameBoard, shipsArray) => {
    const shipLength = parseInt(ship.dataset.length);
    const row = Math.floor(index / 10);
    const col = index % 10;
    const shipParts = [];

    for (let i = 0; i < shipLength; i++) {
      const square = squares[index + i];
      square.classList.add('taken', 'player-ship');
      gameBoard[row][col + i] = 1;
      shipParts.push({ row, col: col + i, hit: false });
    }

    shipsArray.push(shipParts);
    setSelectedShip(null);

    // Remove the placed ship de game-props
    setAvailableShips(availableShips.filter(s => s.id !== ship.id));

    setInfo(`Barco ${ship.id} en ${index}.`);

    // Check if all ships are placed
    if (availableShips.length === 1) { // because we've just placed one
      setTurnDisplay('Juega CPU');
      setShipsPlaced(true); // Mark ships as placed
      setTimeout(placeCpuShips, 500); // tobe more human.
    }
  };

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
    setTurnDisplay(`${playerName}`);
    setPlayerTurn(true); // Allow player to play
    setInfo('Barcos CPU READY ◝(ᵔᗜᵔ)◜');
  };

  const handleCpuBoardClick = (e) => {
    if (playerTurn && !gameOver && !e.target.classList.contains('hit') && !e.target.classList.contains('miss')) {
      const target = e.target;
      const index = parseInt(target.dataset.id);
      const row = Math.floor(index / 10);
      const col = index % 10;

      if (cpuGameBoard[row][col] === 1) {
        target.classList.add('hit');
        cpuGameBoard[row][col] = 2;
        checkShipSunk(cpuShips, row, col, gameBoardCpuRef.current);
        if (checkGameOver(cpuShips, `${playerName}`)) {
          setGameOver(true);
          return;
        }
        setInfo(`¡YEY! Barco enemigo! 𓁹‿𓁹 (${row}, ${col}).`);
      } else {
        target.classList.add('miss');
        cpuGameBoard[row][col] = 3;
        setInfo(`BUU... Aguas (${row}, ${col}).`);
      }
      setPlayerTurn(false);
      setTurnDisplay('CPU');
      setTimeout(() => {
        if (!gameOver) {
          cpuTurn();
        }
      }, 800);
    }
  };

  const cpuTurn = () => {
    if (gameOver) return; // Prevent CPU turn if game is over

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
      if (checkGameOver(playerShips, 'CPU')) {
        setGameOver(true);
        return;
      }
      setInfo(`CPU le achuntó! (⊙ _ ⊙ ) (${row}, ${col}).`);
    } else {
      target.classList.add('miss');
      playerGameBoard[row][col] = 3;
      setInfo(`CPU falló ( ≖‿ ≖ )(${row}, ${col}).`);
    }
    setPlayerTurn(true);
    setTurnDisplay(`${playerName}`);
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
          setInfo(`¡Barco hundido! WII! (  •̀ ᗜ •́  ৻) (${row}, ${col})`);
        }
      }
    });
  };

  const checkGameOver = (ships, playerName) => {
    if (ships.every(ship => ship.every(part => part.hit))) {
      setInfo(`${playerName} GANA!! (ꈍᴗꈍ)♡`);
      gameBoardCpuRef.current.removeEventListener('click', handleCpuBoardClick);
      gameBoardPlayerRef.current.removeEventListener('click', handleSquareClick);
      return true;
    }
    return false;
  };

  const handleSquareClick = (e) => {
    if (!gameOver) { // Prevent clicks if game is over
      const index = parseInt(e.target.dataset.id);
      const squares = Array.from(e.target.parentNode.children);

      if (selectedShip && isValidPlacement(parseInt(selectedShip.dataset.length), index, squares)) {
        placeShip(selectedShip, index, squares, playerGameBoard, playerShips);
      } else if (!selectedShip) {
        setInfo('Selecciona un barco.');
      } else {
        setInfo('Ops. Inténtalo de nuevo.');
      }
    }
  };

  const handleShipClick = (e) => {
    setSelectedShip(e.target);
  };

  useEffect(() => {
    const ships = document.querySelectorAll('.ship');
    ships.forEach(ship => {
      ship.addEventListener('click', handleShipClick);
    });

    return () => {
      ships.forEach(ship => {
        ship.removeEventListener('click', handleShipClick);
      });
    };
  }, []);

  const restartGame = () => {
    window.location.reload();
  };

  return (
    <div className="wrapper">
      <h1>BATTLESHIP: COLOR WARS</h1>
      <div className="game-container">

        <div>
          <span>👾 CPU</span>
          <div
            id="game-board-cpu"
            className="game-board cpu-board-bg"
            ref={gameBoardCpuRef}
            onClick={shipsPlaced && !gameOver ? handleCpuBoardClick : null}
            style={{ pointerEvents: (shipsPlaced && !gameOver) ? 'auto' : 'none' }}
          >
            {createBoard(Array.from(gameBoardCpuRef.current?.children || []), false, shipsPlaced && !gameOver)}
          </div>
        </div>

        <div>
          <span>🤓 {playerName}</span>
          <div id="game-board-player" className="game-board" ref={gameBoardPlayerRef}>
            {createBoard(Array.from(gameBoardPlayerRef.current?.children || []), true, !shipsPlaced && !gameOver)}
          </div>
        </div>
      </div>

      <div id="game-info">
        <div>🕹️ <span id="turn-display">{turnDisplay}</span></div>
        <div><span className='miss'>__</span> Vacio <span className='hit'>__</span> Barco <span className='sunk'>__</span> Hundido</div>
      </div>

      <p className='display-info' id="info">{info}</p>

      <p>{playerName}, 1. selecciona con clic 👇 ⬤ <br />2. Ordenalos con un clic en tú tablero 👆</p>
      <div id="game-props" ref={shipsRef}>
        {availableShips.map(ship => (
          <div
            key={ship.id}
            className="ship"
            id={ship.id}
            data-length={ship.length}
          />
        ))}
      </div>
      <div className="btn-container">
        <div className="btn-restart" id="btn-restart" onClick={restartGame}>Reiniciar Juego</div>
      </div>
    </div>
  );
};

export default GameBoard;