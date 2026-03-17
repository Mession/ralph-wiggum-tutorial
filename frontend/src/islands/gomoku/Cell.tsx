import type { CSSProperties } from 'react';
import type { Player } from './gameLogic';

interface CellProps {
  row: number;
  col: number;
  value: Player | null;
  isWinner: boolean;
  onClick: () => void;
  style: CSSProperties;
}

export default function Cell({ row, col, value, isWinner, onClick, style }: CellProps) {
  const colorClass = value === 'X' ? 'text-blue-600' : value === 'O' ? 'text-red-600' : '';
  const bgClass = isWinner ? 'bg-yellow-200' : 'bg-white';

  return (
    <button
      data-testid="cell"
      data-row={row}
      data-col={col}
      onClick={onClick}
      style={style}
      className={`absolute border border-gray-300 text-sm font-bold ${colorClass} ${bgClass} hover:bg-gray-50 transition-colors`}
    >
      {value}
    </button>
  );
}
