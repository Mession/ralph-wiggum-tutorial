import { describe, it, expect } from 'vitest';
import { checkWin, isDraw, cellKey, WIN_LENGTH } from './gameLogic';
import type { Player, CellKey } from './gameLogic';

function makeBoard(moves: [number, number, Player][]): Map<CellKey, Player> {
  const board = new Map<CellKey, Player>();
  for (const [r, c, p] of moves) {
    board.set(cellKey(r, c), p);
  }
  return board;
}

describe('cellKey', () => {
  it('produces correct string keys', () => {
    expect(cellKey(0, 0)).toBe('0,0');
    expect(cellKey(14, 14)).toBe('14,14');
    expect(cellKey(99, 0)).toBe('99,0');
  });
});

describe('checkWin', () => {
  it('detects a horizontal win', () => {
    const board = makeBoard([
      [7, 3, 'X'], [7, 4, 'X'], [7, 5, 'X'], [7, 6, 'X'], [7, 7, 'X'],
    ]);
    const result = checkWin(board, 7, 5, 'X', 15);
    expect(result).not.toBeNull();
    expect(result!.winner).toBe('X');
    expect(result!.cells).toHaveLength(WIN_LENGTH);
  });

  it('detects a vertical win', () => {
    const board = makeBoard([
      [2, 5, 'O'], [3, 5, 'O'], [4, 5, 'O'], [5, 5, 'O'], [6, 5, 'O'],
    ]);
    const result = checkWin(board, 4, 5, 'O', 15);
    expect(result).not.toBeNull();
    expect(result!.winner).toBe('O');
    expect(result!.cells).toHaveLength(WIN_LENGTH);
  });

  it('detects a diagonal ↘ win', () => {
    const board = makeBoard([
      [0, 0, 'X'], [1, 1, 'X'], [2, 2, 'X'], [3, 3, 'X'], [4, 4, 'X'],
    ]);
    const result = checkWin(board, 2, 2, 'X', 15);
    expect(result).not.toBeNull();
    expect(result!.winner).toBe('X');
    expect(result!.cells).toHaveLength(WIN_LENGTH);
  });

  it('detects a diagonal ↙ win', () => {
    const board = makeBoard([
      [0, 4, 'O'], [1, 3, 'O'], [2, 2, 'O'], [3, 1, 'O'], [4, 0, 'O'],
    ]);
    const result = checkWin(board, 2, 2, 'O', 15);
    expect(result).not.toBeNull();
    expect(result!.winner).toBe('O');
    expect(result!.cells).toHaveLength(WIN_LENGTH);
  });

  it('returns null for 4-in-a-row (not enough)', () => {
    const board = makeBoard([
      [7, 3, 'X'], [7, 4, 'X'], [7, 5, 'X'], [7, 6, 'X'],
    ]);
    const result = checkWin(board, 7, 5, 'X', 15);
    expect(result).toBeNull();
  });

  it('detects win at board boundary', () => {
    const board = makeBoard([
      [0, 0, 'X'], [0, 1, 'X'], [0, 2, 'X'], [0, 3, 'X'], [0, 4, 'X'],
    ]);
    const result = checkWin(board, 0, 0, 'X', 15);
    expect(result).not.toBeNull();
    expect(result!.cells).toHaveLength(WIN_LENGTH);
  });

  it('detects win when placing stone in the middle of a sequence', () => {
    // Place stones 0,1,3,4 first, then place 2 to complete
    const board = makeBoard([
      [5, 0, 'X'], [5, 1, 'X'], [5, 2, 'X'], [5, 3, 'X'], [5, 4, 'X'],
    ]);
    const result = checkWin(board, 5, 2, 'X', 15);
    expect(result).not.toBeNull();
    expect(result!.winner).toBe('X');
    expect(result!.cells).toHaveLength(WIN_LENGTH);
  });
});

describe('isDraw', () => {
  it('returns false for an empty board', () => {
    const board = new Map<CellKey, Player>();
    expect(isDraw(board, 5)).toBe(false);
  });

  it('returns false for a partially filled board', () => {
    const board = makeBoard([[0, 0, 'X'], [0, 1, 'O']]);
    expect(isDraw(board, 5)).toBe(false);
  });

  it('returns true when the board is full', () => {
    const board = new Map<CellKey, Player>();
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        board.set(cellKey(r, c), (r + c) % 2 === 0 ? 'X' : 'O');
      }
    }
    expect(isDraw(board, 5)).toBe(true);
  });
});
