import { useState } from 'react';
import { checkWin, isDraw, cellKey } from './gameLogic';
import type { Player, CellKey, GamePhase, WinResult } from './gameLogic';
import VirtualBoard from './VirtualBoard';
import SizeSelector from './SizeSelector';

export default function GomokuIsland() {
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [gridSize, setGridSize] = useState(15);
  const [board, setBoard] = useState<Map<CellKey, Player>>(new Map());
  const [xIsNext, setXIsNext] = useState(true);
  const [xStartsNext, setXStartsNext] = useState(false);
  const [winResult, setWinResult] = useState<WinResult | null>(null);
  const [drawDetected, setDrawDetected] = useState(false);
  const [scores, setScores] = useState({ X: 0, O: 0 });

  const winningCells = new Set<string>(
    winResult ? winResult.cells.map(([r, c]) => cellKey(r, c)) : []
  );

  let status: string;
  if (winResult) {
    status = `🎉 ${winResult.winner} wins!`;
  } else if (drawDetected) {
    status = "It's a draw!";
  } else {
    status = `Player ${xIsNext ? 'X' : 'O'}'s turn`;
  }

  function handleCellClick(row: number, col: number): void {
    if (phase === 'over') return;
    const key = cellKey(row, col);
    if (board.has(key)) return;

    const currentPlayer: Player = xIsNext ? 'X' : 'O';
    const nextBoard = new Map(board);
    nextBoard.set(key, currentPlayer);

    const win = checkWin(nextBoard, row, col, currentPlayer, gridSize);
    if (win) {
      setWinResult(win);
      setScores((s) => ({ ...s, [currentPlayer]: s[currentPlayer] + 1 }));
      setPhase('over');
    } else if (isDraw(nextBoard, gridSize)) {
      setDrawDetected(true);
      setPhase('over');
    }

    setBoard(nextBoard);
    setXIsNext(!xIsNext);
  }

  function handleSizeSelect(size: number): void {
    setGridSize(size);
    setBoard(new Map());
    setWinResult(null);
    setDrawDetected(false);
    setXIsNext(true);
    setXStartsNext(false);
    setPhase('playing');
  }

  function handleNewGame(): void {
    // xStartsNext tracks who starts the NEXT game (false=O, true=X)
    setXIsNext(xStartsNext);
    setXStartsNext(!xStartsNext);
    setBoard(new Map());
    setWinResult(null);
    setDrawDetected(false);
    setPhase('playing');
  }

  function handleChangeSize(): void {
    setBoard(new Map());
    setWinResult(null);
    setDrawDetected(false);
    setScores({ X: 0, O: 0 });
    setPhase('setup');
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-6 text-sm font-medium text-gray-600">
        <span>X: {scores.X}</span>
        <span>O: {scores.O}</span>
      </div>

      {phase !== 'setup' && (
        <p className="text-lg font-semibold text-gray-800">{status}</p>
      )}

      {phase === 'setup' ? (
        <SizeSelector onSizeSelect={handleSizeSelect} />
      ) : (
        <>
          <VirtualBoard
            gridSize={gridSize}
            board={board}
            winningCells={winningCells}
            onCellClick={handleCellClick}
            currentPlayer={xIsNext ? 'X' : 'O'}
          />
          <div className="flex gap-3">
            <button
              onClick={handleNewGame}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              New Game
            </button>
            <button
              onClick={handleChangeSize}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Change Size
            </button>
          </div>
        </>
      )}
    </div>
  );
}
