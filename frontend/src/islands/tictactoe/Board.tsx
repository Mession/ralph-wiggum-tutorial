import type { Squares } from './gameLogic';
import Square from './Square';

interface BoardProps {
  squares: Squares;
  onSquareClick: (i: number) => void;
  winnerSquares: number[];
}

export default function Board({ squares, onSquareClick, winnerSquares }: BoardProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {squares.map((value, i) => (
        <Square
          key={i}
          value={value}
          onClick={() => onSquareClick(i)}
          isWinner={winnerSquares.includes(i)}
        />
      ))}
    </div>
  );
}
