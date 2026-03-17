interface SquareProps {
  value: 'X' | 'O' | null;
  onClick: () => void;
  isWinner: boolean;
}

export default function Square({ value, onClick, isWinner }: SquareProps) {
  const colorClass = value === 'X' ? 'text-blue-600' : value === 'O' ? 'text-red-600' : '';
  const bgClass = isWinner ? 'bg-yellow-200' : 'bg-white';

  return (
    <button
      data-testid="square"
      onClick={onClick}
      className={`w-16 h-16 border border-gray-300 rounded text-2xl font-bold ${colorClass} ${bgClass} hover:bg-gray-50 transition-colors`}
    >
      {value}
    </button>
  );
}
