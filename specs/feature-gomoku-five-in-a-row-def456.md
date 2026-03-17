# Feature: Gomoku — Five in a Row on a Large Grid

## Feature Description
Add a Gomoku (Five in a Row) game to the application. Two players take turns on the same device placing pieces on an N×N grid (configurable from 5×5 up to 100×100, defaulting to 15×15). The first player to place 5 consecutive pieces in a row, column, or diagonal wins. The board is rendered using a virtualized scrollable viewport so that even a 100×100 grid (10,000 cells) remains fast and responsive. All game logic lives in a React island — no database persistence is needed.

## User Story
As a user visiting the site,
I want to play Gomoku (Five in a Row) on a large grid of my chosen size,
So that I can enjoy a more strategic and longer-form game than classic 3×3 Tic-Tac-Toe.

## Problem Statement
The existing application only has a 3×3 Tic-Tac-Toe game. There is no game that demonstrates: (1) configurable/dynamic game rules, (2) efficient rendering of large data sets inside a React island, or (3) a more strategic two-player experience.

## Solution Statement
Add a `/gomoku` page backed by a new Flask Blueprint. The React island manages all game state using a `Map<string, Player>` for memory-efficient sparse board representation, detects wins in O(winLength) time by scanning only from the last-placed piece, and renders the board through `@tanstack/react-virtual` v3 so any grid from 5×5 to 100×100 renders smoothly inside a fixed-size scrollable viewport. A grid-size selector lets players choose a preset (10×10, 15×15, 19×19) or enter a custom size up to 100.

---

## Relevant Files

### Existing Files (to modify)
- **`src/app/views/__init__.py`** — Register the new `gomoku_bp` Blueprint alongside the existing ones.
- **`frontend/src/main.ts`** — Register the `gomoku` island in `islandRegistry`.
- **`frontend/package.json`** — Add `@tanstack/react-virtual` as a production dependency.
- **`src/app/templates/hello/index.html`** — Add a navigation link to `/gomoku`.
- **`src/app/templates/tictactoe/index.html`** — Add a navigation link to `/gomoku` (once tictactoe is implemented).

### New Files (to create)
- **`src/app/views/gomoku.py`** — Flask Blueprint with a single `GET /gomoku` route.
- **`src/app/templates/gomoku/index.html`** — Jinja2 template mounting the `gomoku` island.
- **`frontend/src/islands/gomoku/index.tsx`** — Island entry point (clears placeholder, mounts React root).
- **`frontend/src/islands/gomoku/GomokuIsland.tsx`** — Root stateful component: owns board state, turn tracking, scores, grid-size config.
- **`frontend/src/islands/gomoku/VirtualBoard.tsx`** — Renders the N×N grid inside a fixed scrollable viewport using `useVirtualizer` (rows) and `useVirtualizer` (columns, `horizontal: true`) from `@tanstack/react-virtual`.
- **`frontend/src/islands/gomoku/Cell.tsx`** — Individual cell button; shows `X` / `O` / empty, highlights winning cells.
- **`frontend/src/islands/gomoku/SizeSelector.tsx`** — UI for choosing grid size presets or entering a custom value; only shown before a game starts or after "New Game" with size change.
- **`frontend/src/islands/gomoku/gameLogic.ts`** — Pure exported functions: `checkWin`, `isDraw`, `cellKey`, `WIN_LENGTH`, `DEFAULT_GRID_SIZE`.
- **`frontend/src/islands/gomoku/gameLogic.test.ts`** — Vitest unit tests for all game logic.
- **`tests/test_gomoku.py`** — pytest tests for the Flask route.
- **`e2e/gomoku.spec.ts`** — Playwright E2E tests covering game flow on a small grid.

---

## Implementation Plan

### Phase 1: Foundation
Install `@tanstack/react-virtual`, create the Flask Blueprint and Jinja2 template, register the Blueprint and island so `GET /gomoku` returns a valid HTML page with the island mount point.

### Phase 2: Core Implementation
Build `gameLogic.ts` with its full test suite first (TDD), then build the React components bottom-up: `Cell` → `VirtualBoard` → `SizeSelector` → `GomokuIsland`.

### Phase 3: Integration
Wire navigation links, write pytest route tests and Playwright E2E tests, run full validation suite.

---

## Step by Step Tasks

### Step 1: Install `@tanstack/react-virtual`
- In `frontend/`, run: `npm install @tanstack/react-virtual@^3`
- The `@^3` pin is **required** — v2 ships an incompatible API (`useVirtual`) and must not be installed accidentally.
- This adds it to `dependencies` in `frontend/package.json` (production dependency, not devDependency, because the component is rendered at runtime).

### Step 2: Create `gameLogic.ts`
Create `frontend/src/islands/gomoku/gameLogic.ts` with all pure game-logic exports:

```typescript
export const WIN_LENGTH = 5;
export const DEFAULT_GRID_SIZE = 15;
export const MIN_GRID_SIZE = 5;
export const MAX_GRID_SIZE = 100;

export type Player = 'X' | 'O';
export type Board = Map<string, Player>;

export interface WinResult {
  player: Player;
  cells: Array<[number, number]>;  // [row, col] pairs of the 5 winning cells
}

export function cellKey(row: number, col: number): string {
  return `${row},${col}`;
}

/**
 * Check for a win after placing `player` at (row, col).
 * Scans only the 4 directions from the last move — O(WIN_LENGTH) per call.
 */
export function checkWin(
  board: Board,
  row: number,
  col: number,
  player: Player,
  gridSize: number,
): WinResult | null {
  const directions: Array<[number, number]> = [
    [0, 1],   // horizontal
    [1, 0],   // vertical
    [1, 1],   // diagonal ↘
    [1, -1],  // diagonal ↙
  ];

  for (const [dr, dc] of directions) {
    const cells: Array<[number, number]> = [[row, col]];

    // positive direction
    for (let i = 1; i < WIN_LENGTH; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) break;
      if (board.get(cellKey(r, c)) !== player) break;
      cells.push([r, c]);
    }

    // negative direction
    for (let i = 1; i < WIN_LENGTH; i++) {
      const r = row - dr * i;
      const c = col - dc * i;
      if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) break;
      if (board.get(cellKey(r, c)) !== player) break;
      cells.unshift([r, c]);
    }

    if (cells.length >= WIN_LENGTH) {
      return { player, cells: cells.slice(0, WIN_LENGTH) };
    }
  }

  return null;
}

/**
 * Board is a draw when every cell is filled and there is no winner.
 * On large boards this is practically impossible, but the logic is correct.
 */
export function isDraw(board: Board, gridSize: number): boolean {
  return board.size === gridSize * gridSize;
}
```

### Step 3: Write Vitest Unit Tests (`frontend/src/islands/gomoku/gameLogic.test.ts`)
Tests must cover every branch of `checkWin` and `isDraw`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  checkWin, isDraw, cellKey,
  WIN_LENGTH, DEFAULT_GRID_SIZE,
} from './gameLogic';
import type { Board, Player } from './gameLogic';

function makeBoard(entries: Array<[number, number, Player]>): Board {
  const board: Board = new Map();
  for (const [r, c, p] of entries) board.set(cellKey(r, c), p);
  return board;
}

const G = DEFAULT_GRID_SIZE;

describe('checkWin', () => {
  it('returns null on an empty board', () => {
    expect(checkWin(new Map(), 7, 7, 'X', G)).toBeNull();
  });

  it('detects a horizontal win', () => {
    const board = makeBoard([[0,0,'X'],[0,1,'X'],[0,2,'X'],[0,3,'X'],[0,4,'X']]);
    const result = checkWin(board, 0, 4, 'X', G);
    expect(result?.player).toBe('X');
    expect(result?.cells).toHaveLength(WIN_LENGTH);
  });

  it('detects a vertical win', () => {
    const board = makeBoard([[0,0,'O'],[1,0,'O'],[2,0,'O'],[3,0,'O'],[4,0,'O']]);
    const result = checkWin(board, 4, 0, 'O', G);
    expect(result?.player).toBe('O');
    expect(result?.cells).toHaveLength(WIN_LENGTH);
  });

  it('detects a diagonal win (↘)', () => {
    const board = makeBoard([[0,0,'X'],[1,1,'X'],[2,2,'X'],[3,3,'X'],[4,4,'X']]);
    expect(checkWin(board, 4, 4, 'X', G)?.player).toBe('X');
  });

  it('detects a diagonal win (↙)', () => {
    const board = makeBoard([[0,4,'O'],[1,3,'O'],[2,2,'O'],[3,1,'O'],[4,0,'O']]);
    expect(checkWin(board, 4, 0, 'O', G)?.player).toBe('O');
  });

  it('does not trigger on 4 in a row', () => {
    const board = makeBoard([[0,0,'X'],[0,1,'X'],[0,2,'X'],[0,3,'X']]);
    expect(checkWin(board, 0, 3, 'X', G)).toBeNull();
  });

  it('respects grid boundaries (no wrap-around)', () => {
    // Place 4 X near left edge and 1 X across boundary — should not win
    const board = makeBoard([[0,0,'X'],[0,1,'X'],[0,2,'X'],[0,3,'X']]);
    // The 5th piece would be at col -1 — out of bounds
    expect(checkWin(board, 0, 3, 'X', G)).toBeNull();
  });

  it('counts pieces in both directions to find 5', () => {
    // Pieces at cols 1,2,3,4,5 — check from the middle (col 3)
    const board = makeBoard([[5,1,'X'],[5,2,'X'],[5,3,'X'],[5,4,'X'],[5,5,'X']]);
    const result = checkWin(board, 5, 3, 'X', G);
    expect(result?.player).toBe('X');
    expect(result?.cells).toHaveLength(WIN_LENGTH);
  });
});

describe('isDraw', () => {
  it('returns false for a partially filled board', () => {
    const board = makeBoard([[0,0,'X']]);
    expect(isDraw(board, 2)).toBe(false);
  });

  it('returns true when all cells are filled', () => {
    const board: Board = new Map();
    for (let r = 0; r < 2; r++)
      for (let c = 0; c < 2; c++)
        board.set(cellKey(r, c), (r + c) % 2 === 0 ? 'X' : 'O');
    expect(isDraw(board, 2)).toBe(true);
  });

  it('returns false for empty board', () => {
    expect(isDraw(new Map(), G)).toBe(false);
  });
});
```

### Step 4: Create `Cell.tsx`

```typescript
interface CellProps {
  row: number;           // required to set data-row attribute for E2E tests
  col: number;           // required to set data-col attribute for E2E tests
  value: 'X' | 'O' | null;
  isWinner: boolean;
  onClick: () => void;
  style: React.CSSProperties; // absolute position + dimensions injected by VirtualBoard
}
```

- Render a `<button>` with the injected `style`.
- `data-testid="cell"`, `data-row={row}`, `data-col={col}` — **required for E2E tests**.
- Tailwind classes for visual states:
  - Empty, unhovered: `bg-gray-50 border border-gray-200 hover:bg-blue-50`
  - `value === 'X'`: `text-blue-600 font-bold`
  - `value === 'O'`: `text-red-500 font-bold`
  - `isWinner`: `bg-yellow-200 border-yellow-400`
- Text size: `text-sm` default.
- `disabled` attribute when `value !== null` (already filled) or `isWinner` is irrelevant to interaction.

### Step 5: Create `VirtualBoard.tsx`

Props:
```typescript
interface VirtualBoardProps {
  gridSize: number;
  board: Board;
  winCells: Set<string>;  // Set of cellKey strings for the 5 winning cells
  onCellClick: (row: number, col: number) => void;
  disabled: boolean;      // true when game is over
}
```

Implementation notes:
- Fixed viewport: `width: 560px, height: 560px` (or `min(560px, 90vw)` for responsive).
- `CELL_SIZE = 40` px — fixed for all grid sizes; board scrolls for large grids.
- Use two `useVirtualizer` instances from `@tanstack/react-virtual`:

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import { cellKey } from './gameLogic';
import { Cell } from './Cell';
import type { Board } from './gameLogic';

const CELL_SIZE = 40;

export function VirtualBoard({ gridSize, board, winCells, onCellClick, disabled }: VirtualBoardProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: gridSize,
    getScrollElement: () => parentRef.current,
    estimateSize: () => CELL_SIZE,
    overscan: 3,
  });

  const colVirtualizer = useVirtualizer({
    count: gridSize,
    horizontal: true,
    getScrollElement: () => parentRef.current,
    estimateSize: () => CELL_SIZE,
    overscan: 3,
  });

  return (
    <div
      ref={parentRef}
      className="overflow-auto border border-gray-300 rounded-lg"
      style={{ width: Math.min(560, gridSize * CELL_SIZE), height: Math.min(560, gridSize * CELL_SIZE) }}
    >
      <div
        style={{
          height: rowVirtualizer.getTotalSize(),
          width: colVirtualizer.getTotalSize(),
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().flatMap(virtualRow =>
          colVirtualizer.getVirtualItems().map(virtualCol => {
            const key = cellKey(virtualRow.index, virtualCol.index);
            return (
              <Cell
                key={key}
                row={virtualRow.index}
                col={virtualCol.index}
                value={board.get(key) ?? null}
                isWinner={winCells.has(key)}
                onClick={() => !disabled && onCellClick(virtualRow.index, virtualCol.index)}
                style={{
                  position: 'absolute',
                  top: virtualRow.start,
                  left: virtualCol.start,
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
```

### Step 6: Create `SizeSelector.tsx`
- Renders preset buttons (10×10, 15×15, 19×19) — clicking a preset immediately calls `onSelect(size)`.
- A number input for custom size with a **"Start Game"** submit button (this exact label is used by E2E tests).
- Validates custom size: integer, `MIN_GRID_SIZE` (5) ≤ value ≤ `MAX_GRID_SIZE` (100); show an inline validation message if out of range.
- The "Start Game" button is disabled when the custom input is invalid.

```typescript
interface SizeSelectorProps {
  onSelect: (size: number) => void;
}

const PRESETS = [10, 15, 19];
```

Example layout (Tailwind):
```tsx
<div className="space-y-4">
  <p className="text-gray-600 font-medium">Choose a grid size:</p>
  <div className="flex gap-3">
    {PRESETS.map(size => (
      <button key={size} onClick={() => onSelect(size)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        {size}×{size}
      </button>
    ))}
  </div>
  <div className="flex items-center gap-3">
    <input type="number" min={MIN_GRID_SIZE} max={MAX_GRID_SIZE}
      className="w-24 border rounded px-2 py-1" />
    <button className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50">
      Start Game
    </button>
  </div>
</div>
```

### Step 7: Create `GomokuIsland.tsx`
This is the root stateful component. It owns all game state.

**Imports:**
```typescript
import { useState } from 'react';
import { checkWin, isDraw, cellKey, DEFAULT_GRID_SIZE } from './gameLogic';
import type { Board, Player, WinResult } from './gameLogic';
import { VirtualBoard } from './VirtualBoard';
import { SizeSelector } from './SizeSelector';
```

**Do NOT import `useCallback`** — it is not needed here and `noUnusedLocals: true` will cause a build error if imported and unused.

**State:**
```typescript
type GamePhase = 'setup' | 'playing' | 'over';

const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE);
const [board, setBoard] = useState<Board>(new Map());
const [xIsNext, setXIsNext] = useState(true);
const [xStartsNext, setXStartsNext] = useState(false);
const [winResult, setWinResult] = useState<WinResult | null>(null);
const [drawDetected, setDrawDetected] = useState(false);
const [scores, setScores] = useState<{ X: number; O: number; draws: number }>({ X: 0, O: 0, draws: 0 });
const [phase, setPhase] = useState<GamePhase>('setup');
```

**`handleCellClick(row, col)`:**
- Guard: return if `phase !== 'playing'` or cell already filled.
- Create `nextBoard = new Map(board)`, set `nextBoard.set(cellKey(row, col), currentPlayer)`.
- Compute `result = checkWin(nextBoard, row, col, currentPlayer, gridSize)` synchronously from `nextBoard`.
- If win: update scores, set winResult, set phase `'over'`.
- Else if `isDraw(nextBoard, gridSize)`: update scores, set drawDetected, set phase `'over'`.
- Else: continue playing.
- Batch all state updates: `setBoard`, `setXIsNext`, `setWinResult`, `setDrawDetected`, `setScores`, `setPhase`.

**`handleSizeSelect(size)`:**
- Set `gridSize = size`, reset `board = new Map()`, `winResult = null`, `drawDetected = false`.
- Set `xIsNext = true` (X always opens a fresh game after size selection).
- Set `phase = 'playing'`.
- Keep `scores` unchanged.

**`handleNewGame()`:**
- Reset `board = new Map()`, `winResult = null`, `drawDetected = false`.
- **Go directly to `phase = 'playing'` with the SAME grid size** — do NOT go to `'setup'`. This keeps the board visible immediately.
- Alternate starting player using `xStartsNext`: `const nextStarter = !xStartsNext; setXStartsNext(nextStarter); setXIsNext(nextStarter);`
- Keep `scores` and `gridSize` unchanged.
- To change the grid size, the user must click the **"Change Size"** button (see UI layout below), which sets `phase = 'setup'`.

**`winCells` (derived Set):**
```typescript
const winCellsSet = new Set(winResult?.cells.map(([r, c]) => cellKey(r, c)) ?? []);
```

**UI layout:**
- Scoreboard: `X: {scores.X} | O: {scores.O} | Draws: {scores.draws}` — always visible once a game has been played.
- Status bar: "Player X's turn", "Player O's turn", "🎉 X wins!", "🎉 O wins!", "It's a draw!" — visible when `phase === 'playing' || phase === 'over'`.
- `<SizeSelector onSelect={handleSizeSelect} />` — shown only when `phase === 'setup'`.
- `<VirtualBoard ... />` — shown only when `phase === 'playing' || phase === 'over'`.
- **"New Game"** button — visible when `phase === 'playing' || phase === 'over'`; resets board, same grid size.
- **"Change Size"** button — visible when `phase === 'playing' || phase === 'over'`; calls `setPhase('setup')` to show the size selector again.
- Grid size label e.g. `Grid: 15×15` — shown during playing/over phase.

### Step 8: Create Island Entry Point (`frontend/src/islands/gomoku/index.tsx`)
Follow the canonical pattern from `hello/index.tsx` exactly:

```typescript
import { createRoot } from 'react-dom/client';
import { GomokuIsland } from './GomokuIsland';

export function mount(element: HTMLElement, _props: unknown): void {
  element.innerHTML = '';
  createRoot(element).render(<GomokuIsland />);
}
```

**Do NOT import React** — `"jsx": "react-jsx"` is in tsconfig and `noUnusedLocals: true` would cause a build error.

### Step 9: Create the Flask Blueprint (`src/app/views/gomoku.py`)

```python
from flask import Blueprint, render_template

gomoku_bp = Blueprint('gomoku', __name__)


@gomoku_bp.route('/gomoku')
def index():
    return render_template('gomoku/index.html')
```

### Step 10: Create the Jinja2 Template (`src/app/templates/gomoku/index.html`)

```html
{% extends "base.html" %}
{% block title %}Gomoku — Five in a Row{% endblock %}
{% block content %}
<div class="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
  <h1 class="text-4xl font-bold text-gray-900 mb-2">Gomoku</h1>
  <p class="text-gray-500 mb-6">Five in a row — up to 100×100 grid</p>

  <div
    data-island="gomoku"
    class="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl"
  >
    <noscript>
      <p class="text-gray-600">JavaScript is required to play.</p>
    </noscript>
    <div class="animate-pulse text-gray-400 text-center">Loading game…</div>
  </div>

  <div class="mt-6 flex gap-6 text-sm text-blue-600">
    <a href="/" class="hover:underline">← Hello</a>
    <a href="/tictactoe" class="hover:underline">3×3 Tic-Tac-Toe</a>
  </div>
</div>
{% endblock %}
```

### Step 11: Register Blueprint and Island
- In `src/app/views/__init__.py`:
  ```python
  from .gomoku import gomoku_bp
  app.register_blueprint(gomoku_bp)
  ```
- In `frontend/src/main.ts`, add to `islandRegistry`:
  ```typescript
  gomoku: () => import('./islands/gomoku'),
  ```

### Step 12: Add Navigation Links
- In `src/app/templates/hello/index.html`, add inside the content section:
  ```html
  <a href="/gomoku" class="mt-2 inline-block text-blue-600 hover:underline">Play Gomoku (Five in a Row) →</a>
  ```
- In `src/app/templates/tictactoe/index.html` (when it exists), add a link to `/gomoku`.

### Step 13: Write pytest Unit Tests (`tests/test_gomoku.py`)

```python
class TestGomokuPage:
    def test_index_returns_200(self, client):
        response = client.get('/gomoku')
        assert response.status_code == 200

    def test_index_contains_title(self, client):
        response = client.get('/gomoku')
        assert b'Gomoku' in response.data

    def test_index_has_island_mount_point(self, client):
        response = client.get('/gomoku')
        assert b'data-island="gomoku"' in response.data
```

### Step 14: Write Playwright E2E Tests (`e2e/gomoku.spec.ts`)

> **Note on E2E with virtualization:** All E2E scenarios use the 10×10 preset grid. At 40px per cell the entire 10×10 board fits within the 400×400px viewport, so no scrolling is required and all cells are in the DOM.

```typescript
import { test, expect } from '@playwright/test';

test.describe('Gomoku', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gomoku');
  });

  test('page loads with size selector', async ({ page }) => {
    await expect(page.getByText('Gomoku')).toBeVisible();
    await expect(page.getByRole('button', { name: '10×10' })).toBeVisible();
    await expect(page.getByRole('button', { name: '15×15' })).toBeVisible();
    await expect(page.getByRole('button', { name: '19×19' })).toBeVisible();
  });

  test('selecting a size starts the game', async ({ page }) => {
    await page.getByRole('button', { name: '10×10' }).click();
    await expect(page.getByText("Player X's turn")).toBeVisible();
    await expect(page.locator('[data-testid="cell"]')).toHaveCount(100);
  });

  test('players can take turns', async ({ page }) => {
    await page.getByRole('button', { name: '10×10' }).click();
    const cells = page.locator('[data-testid="cell"]');
    await cells.nth(0).click();
    await expect(cells.nth(0)).toHaveText('X');
    await expect(page.getByText("Player O's turn")).toBeVisible();
    await cells.nth(1).click();
    await expect(cells.nth(1)).toHaveText('O');
    await expect(page.getByText("Player X's turn")).toBeVisible();
  });

  test('detects five in a row (horizontal)', async ({ page }) => {
    await page.getByRole('button', { name: '10×10' }).click();
    const cells = page.locator('[data-testid="cell"]');
    // X plays row 0: cols 0,1,2,3,4 interleaved with O plays at row 1
    // Move sequence: X@(0,0), O@(1,0), X@(0,1), O@(1,1), X@(0,2), O@(1,2), X@(0,3), O@(1,3), X@(0,4) → X wins
    const moves = [0, 10, 1, 11, 2, 12, 3, 13, 4]; // cell indices in a 10-wide grid
    for (const i of moves) {
      await cells.nth(i).click();
    }
    await expect(page.getByText('🎉 X wins!')).toBeVisible();
  });

  test('winner cells are highlighted', async ({ page }) => {
    await page.getByRole('button', { name: '10×10' }).click();
    const cells = page.locator('[data-testid="cell"]');
    const moves = [0, 10, 1, 11, 2, 12, 3, 13, 4];
    for (const i of moves) await cells.nth(i).click();
    // The winning cells (0-4) should have the yellow winner class
    for (let i = 0; i < 5; i++) {
      await expect(cells.nth(i)).toHaveClass(/bg-yellow-200/);
    }
  });

  test('clicking a filled cell does nothing', async ({ page }) => {
    await page.getByRole('button', { name: '10×10' }).click();
    const cells = page.locator('[data-testid="cell"]');
    await cells.nth(0).click(); // X plays
    await cells.nth(0).click(); // try to overwrite — should still be X, still O's turn
    await expect(cells.nth(0)).toHaveText('X');
    await expect(page.getByText("Player O's turn")).toBeVisible();
  });

  test('clicking after game over does nothing', async ({ page }) => {
    await page.getByRole('button', { name: '10×10' }).click();
    const cells = page.locator('[data-testid="cell"]');
    const moves = [0, 10, 1, 11, 2, 12, 3, 13, 4];
    for (const i of moves) await cells.nth(i).click();
    await expect(page.getByText('🎉 X wins!')).toBeVisible();
    await cells.nth(5).click(); // try to play after win
    await expect(cells.nth(5)).toHaveText(''); // still empty
  });

  test('new game resets the board', async ({ page }) => {
    await page.getByRole('button', { name: '10×10' }).click();
    const cells = page.locator('[data-testid="cell"]');
    await cells.nth(0).click(); // X plays
    await page.getByRole('button', { name: 'New Game' }).click();
    // "New Game" stays on same grid size and goes directly to playing phase.
    // Board is still visible and all cells are cleared.
    await expect(page.getByText("Player O's turn")).toBeVisible(); // O starts second game
    for (let i = 0; i < 9; i++) {
      await expect(cells.nth(i)).toHaveText('');
    }
  });

  test('scores are tracked across games', async ({ page }) => {
    await page.getByRole('button', { name: '10×10' }).click();
    const cells = page.locator('[data-testid="cell"]');
    const moves = [0, 10, 1, 11, 2, 12, 3, 13, 4];
    for (const i of moves) await cells.nth(i).click();
    await expect(page.getByText(/X:\s*1/)).toBeVisible();
    await page.getByRole('button', { name: 'New Game' }).click();
    // Board resets but scores persist and board is still visible
    await expect(page.getByText(/X:\s*1/)).toBeVisible();
    await expect(cells.nth(0)).toHaveText(''); // board is cleared
  });

  test('custom grid size works', async ({ page }) => {
    // Use 10×10 for custom too — at 40px/cell the entire 400×400px board fits in
    // the 560px viewport, so all 100 cells are in the DOM (no virtualizer trimming).
    const input = page.getByRole('spinbutton');
    await input.fill('10');
    await page.getByRole('button', { name: 'Start Game' }).click();
    await expect(page.getByText("Player X's turn")).toBeVisible();
    await expect(page.locator('[data-testid="cell"]')).toHaveCount(100);
  });

  test('change size returns to size selector', async ({ page }) => {
    await page.getByRole('button', { name: '10×10' }).click();
    await page.getByRole('button', { name: 'Change Size' }).click();
    await expect(page.getByRole('button', { name: '15×15' })).toBeVisible();
    await expect(page.locator('[data-testid="cell"]')).toHaveCount(0); // board hidden
  });
});
```

### Step 15: Run Validation Commands
Execute all commands in the **Validation Commands** section.

---

## Testing Strategy

### Unit Tests (`frontend/src/islands/gomoku/gameLogic.test.ts`)
- `checkWin`: horizontal, vertical, diagonal (both directions), 4-in-a-row does NOT win, boundary conditions (no wrap-around), win detected from the middle piece of a 5-run.
- `isDraw`: empty board → false, partially filled → false, fully filled → true.
- `cellKey`: deterministic string format (`"${row},${col}"`).

### Edge Cases
- Clicking a cell that is already filled → no state change.
- Clicking any cell after `phase === 'over'` → no state change.
- Win detected on the very last available cell (simultaneous draw+win should award the win).
- Grid boundary: placing at row 0 / col 0 / row N-1 / col N-1 — no out-of-bounds access.
- Very large grid (100×100): board renders without crashing, virtualizer handles overscan correctly.
- Custom size validation: entry below `MIN_GRID_SIZE` or above `MAX_GRID_SIZE` is rejected or clamped.
- `xStartsNext` alternates reliably regardless of how the previous game ended (mid-game resign, full board, win).

---

## Acceptance Criteria
- [ ] `GET /gomoku` returns HTTP 200 with valid HTML containing `data-island="gomoku"`.
- [ ] A size-selector is shown before the game starts with presets 10×10, 15×15, 19×19 and a custom input (5–100) with a **"Start Game"** button.
- [ ] Selecting a size renders an N×N virtual board and shows "Player X's turn".
- [ ] Players can take turns; each click places X or O alternately.
- [ ] Five consecutive pieces in any row, column, or diagonal (all 4 directions) are correctly detected.
- [ ] Winning cells are visually highlighted.
- [ ] A status message shows whose turn it is, who won, or "It's a draw!".
- [ ] Clicking a filled cell or any cell after game-over has no effect.
- [ ] **"New Game"** resets the board with the same grid size, goes directly to playing phase, starting player alternates.
- [ ] **"Change Size"** returns to the size-selector (setup phase), board is hidden.
- [ ] Scores (X wins, O wins, Draws) persist across new games within the session.
- [ ] A 100×100 grid renders without freezing (only visible rows/columns are in the DOM at any time).
- [ ] Navigation links from `/` and `/tictactoe` point to `/gomoku`.
- [ ] All existing tests continue to pass (zero regressions).
- [ ] New pytest route tests pass.
- [ ] New Vitest game-logic unit tests pass.
- [ ] New Playwright E2E tests pass.

---

## Validation Commands

```bash
# 1. Install the new package (v3 pin required — v2 has incompatible API)
cd frontend && npm install @tanstack/react-virtual@^3 && cd ..

# 2. Backend unit tests (includes new gomoku route tests)
PYTHONPATH=src pytest tests/ -v

# 3. Frontend unit tests (includes gameLogic.test.ts)
cd frontend && npm test -- --run

# 4. Type checking (backend + frontend)
mypy src/ --ignore-missing-imports
cd frontend && npm run typecheck

# 5. Linting (backend + frontend)
flake8 src/ tests/
cd frontend && npm run lint

# 6. E2E tests for the new feature
npx playwright test e2e/gomoku.spec.ts --reporter=line

# 7. Full E2E suite — zero regressions
npx playwright test --reporter=line
```

---

## Notes

- **`@tanstack/react-virtual` v3 API**: Install with `@^3`. The hook is `useVirtualizer` (not the v2 `useVirtual`). Import from `'@tanstack/react-virtual'`. Both row and column virtualizers attach to the **same** `parentRef` scroll container. The column virtualizer requires `horizontal: true`. `getTotalSize()` and `getVirtualItems()` are methods, not properties.

- **`New Game` vs `Change Size`**: "New Game" always keeps the current grid size and goes to `playing` phase — the board stays visible and resets immediately. "Change Size" goes to `setup` phase — board hidden, size selector shown. This distinction is tested in E2E.

- **Sparse `Map` vs flat array**: A `Map<string, Player>` is used for board state because a 100×100 board has 10,000 potential cells but typically only ~50–200 will be filled during a game. This keeps React state minimal. The key is always `"${row},${col}"` (via `cellKey`).

- **Do NOT import React in `.tsx` entry files**: The project uses `"jsx": "react-jsx"` (React 17+ automatic JSX transform) and `noUnusedLocals: true`. Importing `React` without using it explicitly will cause a TypeScript build error. Same applies to any other unused import (e.g. `useCallback`).

- **Win-detection is O(WIN_LENGTH) per move**: Scans only 4 directions from the newly placed piece, ≤4 steps each way. Any winning 5-in-a-row that includes the newly placed piece is found. Previous moves were already checked, so a board-wide scan is never needed.

- **E2E cell count is viewport-constrained**: `toHaveCount(N)` only works when the grid is small enough that all cells fit in the viewport. At `CELL_SIZE=40`, a 10×10 board (400×400px) fits in the 560px viewport — all 100 cells are in the DOM. A 20×20 board (800×800px) does NOT fit — use label checks or size ≤14×14 for count assertions.

- **Cell `data-testid`**: Each `<Cell>` button must have `data-testid="cell"` (plus `data-row` and `data-col` props) so Playwright nth() selectors work reliably.

- **Future extension ideas**:
  - AI opponent using minimax with alpha-beta pruning (practical up to ~10×10).
  - "Forbidden moves" rule (standard Gomoku: double-three, double-four forbidden for black).
  - Persistent leaderboard using a `GameResult` SQLAlchemy model.
  - Online multiplayer via WebSockets (Flask-SocketIO).
  - Timed moves with a per-player countdown clock.
