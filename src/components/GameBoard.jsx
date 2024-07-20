import { forwardRef } from 'react';

const GameBoard = forwardRef(({ isPlayerBoard, onDrop, onClick }, ref) => {
  const createBoard = () => {
    const board = [];
    for (let i = 0; i < 100; i++) {
      board.push(
        <div
          key={i}
          data-id={i}
          className={`square ${isPlayerBoard ? 'player-board' : 'cpu-board'}`}
          onDragOver={e => e.preventDefault()}
          onDrop={e => isPlayerBoard ? onDrop(e) : null}
        />
      );
    }
    return board;
  };

  return (
    <div
      className={`game-board ${isPlayerBoard ? 'player-board' : 'cpu-board-bg'}`}
      ref={ref}
      onClick={!isPlayerBoard ? onClick : null}
    >
      {createBoard()}
    </div>
  );
});

GameBoard.displayName = 'GameBoard';

export default GameBoard;
