import { useState } from 'react';
import { calculateWinner, isDraw } from './gameLogic';
import type { Squares } from './gameLogic';
import Board from './Board';

export default function TicTacToeIsland() {
  const [squares, setSquares] = useState<Squares>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [xStartsNext, setXStartsNext] = useState(false);
  const [scores, setScores] = useState<{ X: number; O: number; draws: number }>({ X: 0, O: 0, draws: 0 });

  const winResult = calculateWinner(squares);
  const draw = isDraw(squares);
  const winnerSquares = winResult ? winResult.line : [];

  let status: string;
  if (winResult) {
    status = `🎉 ${winResult.winner} wins!`;
  } else if (draw) {
    status = "It's a draw!";
  } else {
    status = `Player ${xIsNext ? 'X' : 'O'}'s turn`;
  }

  function handleClick(i: number): void {
    if (squares[i] || calculateWinner(squares)) return;

    const nextSquares = squares.slice() as Squares;
    nextSquares[i] = xIsNext ? 'X' : 'O';

    const result = calculateWinner(nextSquares);
    if (result) {
      setScores(s => ({ ...s, [result.winner]: s[result.winner] + 1 }));
    } else if (isDraw(nextSquares)) {
      setScores(s => ({ ...s, draws: s.draws + 1 }));
    }

    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  }

  function handleReset(): void {
    const nextStarter = !xStartsNext;
    setXStartsNext(nextStarter);
    setXIsNext(nextStarter);
    setSquares(Array(9).fill(null));
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-6 text-sm font-medium text-gray-600">
        <span>X: {scores.X}</span>
        <span>O: {scores.O}</span>
        <span>Draws: {scores.draws}</span>
      </div>

      <p className="text-lg font-semibold text-gray-800">{status}</p>

      <Board
        squares={squares}
        onSquareClick={handleClick}
        winnerSquares={winnerSquares}
      />

      <button
        onClick={handleReset}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        New Game
      </button>
    </div>
  );
}
