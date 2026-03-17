export type Player = 'X' | 'O';
export type Squares = (Player | null)[];

export interface WinResult {
  winner: Player;
  line: number[];
}

const LINES: [number, number, number][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],             // diagonals
];

export function calculateWinner(squares: Squares): WinResult | null {
  for (const [a, b, c] of LINES) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a] as Player, line: [a, b, c] };
    }
  }
  return null;
}

export function isDraw(squares: Squares): boolean {
  return squares.every(Boolean) && calculateWinner(squares) === null;
}
