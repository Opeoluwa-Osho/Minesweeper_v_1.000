import { useState } from 'react';
import { MinesweeperGame , GameBoard } from './Minesweeper';
import { Box } from '@mui/material';

export default function App() {
  const [rows, cols, mines] = [10, 10, 10];
  const [board] = useState(() => new GameBoard(rows, cols, mines));
  const [game] = useState(() => new MinesweeperGame(board));
  const [gameState, setGameState] = useState({
    status: game.gameStatus,
  });

  const handleClick = (row: number, col: number) => {
    game.revealCell(row, col);
    setGameState({ ...gameState, status: game.gameStatus });
  };

  const handleRightClick = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    game.toggleFlag(row, col);
    setGameState({ ...gameState });
  };

  return (
    <Box>
      <Box>
        <Box>Mines: {board.remainingMines}</Box>
        <Box>Status: {gameState.status}</Box>
      </Box>
      <Box className="board">
        {Array.from({ length: rows }).map((_, row) => (
          <Box key={row} className="row">
            {Array.from({ length: cols }).map((_, col) => {
              const cell = board.getCell(row, col);
              return (
                <button
                  key={col}
                  className={`cell ${cell.isRevealed ? 'revealed' : ''} ${cell.isFlagged ? 'flagged' : ''}`}
                  onClick={() => handleClick(row, col)}
                  onContextMenu={(e) => handleRightClick(e, row, col)}
                  disabled={gameState.status !== 0}
                >
                  {cell.isFlagged && !cell.isRevealed && '🚩'}
                  {cell.isRevealed && cell.isMine && '💣'}
                  {cell.isRevealed && !cell.isMine && cell.neighborMines > 0 && cell.neighborMines}
                </button>
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
}