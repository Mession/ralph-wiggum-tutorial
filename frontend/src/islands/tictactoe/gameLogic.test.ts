import { describe, it, expect } from 'vitest';
import { calculateWinner, isDraw } from './gameLogic';
import type { Squares } from './gameLogic';

describe('calculateWinner', () => {
  it('returns null for an empty board', () => {
    expect(calculateWinner(Array(9).fill(null))).toBeNull();
  });

  it('detects a row win', () => {
    const squares: Squares = ['X', 'X', 'X', 'O', 'O', null, null, null, null];
    const result = calculateWinner(squares);
    expect(result?.winner).toBe('X');
    expect(result?.line).toEqual([0, 1, 2]);
  });

  it('detects a column win', () => {
    const squares: Squares = ['O', 'X', null, 'O', 'X', null, 'O', null, null];
    const result = calculateWinner(squares);
    expect(result?.winner).toBe('O');
    expect(result?.line).toEqual([0, 3, 6]);
  });

  it('detects a diagonal win', () => {
    const squares: Squares = ['X', 'O', 'O', null, 'X', null, null, null, 'X'];
    const result = calculateWinner(squares);
    expect(result?.winner).toBe('X');
    expect(result?.line).toEqual([0, 4, 8]);
  });

  it('returns null when board is full with no winner', () => {
    const squares: Squares = ['X', 'O', 'X', 'X', 'O', 'X', 'O', 'X', 'O'];
    expect(calculateWinner(squares)).toBeNull();
  });
});

describe('isDraw', () => {
  it('returns false for an empty board', () => {
    expect(isDraw(Array(9).fill(null))).toBe(false);
  });

  it('returns false when there is a winner', () => {
    const squares: Squares = ['X', 'X', 'X', 'O', 'O', null, null, null, null];
    expect(isDraw(squares)).toBe(false);
  });

  it('returns true when all squares filled and no winner', () => {
    const squares: Squares = ['X', 'O', 'X', 'X', 'O', 'X', 'O', 'X', 'O'];
    expect(isDraw(squares)).toBe(true);
  });
});
