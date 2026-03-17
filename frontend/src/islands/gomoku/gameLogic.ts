export const WIN_LENGTH = 5;
export const DEFAULT_GRID_SIZE = 15;
export const MIN_GRID_SIZE = 5;
export const MAX_GRID_SIZE = 100;

export type Player = 'X' | 'O';
export type CellKey = string;
export type GamePhase = 'setup' | 'playing' | 'over';

export interface WinResult {
  winner: Player;
  cells: [number, number][];
}

export function cellKey(row: number, col: number): CellKey {
  return `${row},${col}`;
}

/**
 * Check if the last move at (lastRow, lastCol) creates a winning line of 5.
 * Scans bidirectionally from the placed stone in 4 directions: horizontal,
 * vertical, and both diagonals. O(WIN_LENGTH) per direction.
 */
export function checkWin(
  board: Map<CellKey, Player>,
  lastRow: number,
  lastCol: number,
  player: Player,
  gridSize: number
): WinResult | null {
  const directions: [number, number][] = [
    [0, 1],  // horizontal
    [1, 0],  // vertical
    [1, 1],  // diagonal ↘
    [1, -1], // diagonal ↙
  ];

  for (const [dr, dc] of directions) {
    const cells: [number, number][] = [[lastRow, lastCol]];

    // Count in positive direction
    for (let i = 1; i < WIN_LENGTH; i++) {
      const r = lastRow + dr * i;
      const c = lastCol + dc * i;
      if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) break;
      if (board.get(cellKey(r, c)) !== player) break;
      cells.push([r, c]);
    }

    // Count in negative direction
    for (let i = 1; i < WIN_LENGTH; i++) {
      const r = lastRow - dr * i;
      const c = lastCol - dc * i;
      if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) break;
      if (board.get(cellKey(r, c)) !== player) break;
      cells.push([r, c]);
    }

    if (cells.length >= WIN_LENGTH) {
      return { winner: player, cells };
    }
  }

  return null;
}

export function isDraw(board: Map<CellKey, Player>, gridSize: number): boolean {
  return board.size === gridSize * gridSize;
}
