# Feature: Tic-Tac-Toe Game

## Feature Description
Add a fully interactive Tic-Tac-Toe game to the application. Two players take turns on the same device playing on a 3×3 grid. The game tracks whose turn it is, detects wins and draws, shows session scores, and allows resetting to a new game. The game logic lives entirely in a React island — no database persistence is needed for the game itself.

## User Story
As a user visiting the site,
I want to play a game of Tic-Tac-Toe against another person on the same device,
So that I can have fun without needing any additional setup or account.

## Problem Statement
The application currently only demonstrates a "Hello World" CRUD island. There is no interactive game or entertainment feature showing how React islands handle complex stateful UI.

## Solution Statement
Add a `/tictactoe` page backed by a minimal Flask Blueprint that renders a Jinja2 template containing a React island. The island manages all game state (board, current player, winner, scores) locally in React — no API or database calls are needed. This keeps the implementation focused and follows the existing Islands architecture pattern perfectly.

## Relevant Files

### Existing Files (to modify)
- **`src/app/views/__init__.py`** — Register the new `tictactoe_bp` Blueprint.
- **`frontend/src/main.ts`** — Register the new `tictactoe` island in `islandRegistry`.
- **`src/app/templates/base.html`** — Base template that all pages extend (no edits needed, just reference).

### New Files (to create)
- **`src/app/views/tictactoe.py`** — Flask Blueprint with a single `GET /tictactoe` route.
- **`src/app/templates/tictactoe/index.html`** — Jinja2 template that mounts the React island.
- **`frontend/src/islands/tictactoe/index.tsx`** — Island entry point (mount function).
- **`frontend/src/islands/tictactoe/TicTacToeIsland.tsx`** — Root React component managing game state.
- **`frontend/src/islands/tictactoe/Board.tsx`** — Renders the 3×3 grid of squares.
- **`frontend/src/islands/tictactoe/Square.tsx`** — Individual clickable square.
- **`frontend/src/islands/tictactoe/gameLogic.ts`** — Pure helper functions (`calculateWinner`, `isDraw`) extracted for testability.
- **`frontend/src/islands/tictactoe/gameLogic.test.ts`** — Vitest unit tests for `calculateWinner` and `isDraw`.
- **`tests/test_tictactoe.py`** — pytest tests for the Flask route.
- **`e2e/tictactoe.spec.ts`** — Playwright E2E tests for the full game flow.

---

## Implementation Plan

### Phase 1: Foundation
Create the Flask route and Jinja2 template so the page is reachable and returns valid HTML with the island mount point.

### Phase 2: Core Implementation
Build the React island with all game logic: board state, turn tracking, win/draw detection, score tracking (in-memory across games within a session), and reset.

### Phase 3: Integration
Register the Blueprint and island, add a navigation link on the existing Hello page, write unit tests and E2E tests.

---

## Step by Step Tasks

### Step 1: Create the Flask Blueprint
- Create `src/app/views/tictactoe.py` with a Blueprint named `tictactoe_bp`.
- Add a single route `GET /tictactoe` that renders `tictactoe/index.html`.
- No initial props are needed (all state lives in React).

```python
from flask import Blueprint, render_template

tictactoe_bp = Blueprint('tictactoe', __name__)

@tictactoe_bp.route('/tictactoe')
def index():
    return render_template('tictactoe/index.html')
```

### Step 2: Register the Blueprint
- In `src/app/views/__init__.py`, import `tictactoe_bp` and call `app.register_blueprint(tictactoe_bp)` inside `register_blueprints`.

### Step 3: Create the Jinja2 Template
- Create `src/app/templates/tictactoe/index.html` extending `base.html`.
- Mount the island via `data-island="tictactoe"` (no `data-props` needed since there's no server-side data).
- Include a `<noscript>` fallback and a loading placeholder inside the island div (following the pattern in `hello/index.html`).

```html
{% extends "base.html" %}
{% block title %}Tic-Tac-Toe{% endblock %}
{% block content %}
<div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4">
  <h1 class="text-4xl font-bold text-gray-900 mb-8">Tic-Tac-Toe</h1>
  <div
    data-island="tictactoe"
    class="bg-white rounded-xl shadow-lg p-8"
  >
    <noscript>
      <p class="text-gray-600">JavaScript is required to play.</p>
    </noscript>
    <div class="animate-pulse text-gray-400 text-center">Loading game…</div>
  </div>
  <a href="/" class="mt-8 text-sm text-blue-600 hover:underline">← Back to Hello</a>
</div>
{% endblock %}
```

### Step 4: Register the Island in `frontend/src/main.ts`
- Add `tictactoe` to the `islandRegistry`:

```typescript
tictactoe: () => import('./islands/tictactoe'),
```

### Step 5: Create Island Entry Point (`frontend/src/islands/tictactoe/index.tsx`)
- Export a `mount(el, props)` function following the **exact** pattern of `frontend/src/islands/hello/index.tsx`.
- **Do NOT import React** — the project uses `"jsx": "react-jsx"` (new JSX transform), and `noUnusedLocals: true` in `tsconfig.json` will cause a TypeScript error on any unused import.
- **Clear `element.innerHTML`** before mounting to remove the server-rendered loading placeholder.

```typescript
import { createRoot } from 'react-dom/client';
import TicTacToeIsland from './TicTacToeIsland';

export function mount(element: HTMLElement, _props: unknown): void {
  element.innerHTML = '';
  createRoot(element).render(<TicTacToeIsland />);
}
```

### Step 6: Create `Square.tsx`
- Props: `value: 'X' | 'O' | null`, `onClick: () => void`, `isWinner: boolean`
- Renders a button styled with Tailwind:
  - Default: white background, gray border
  - `isWinner`: highlighted (e.g., yellow/green background)
  - `value === 'X'`: blue text; `value === 'O'`: red text
  - 64×64px (or `w-16 h-16`) square buttons with `text-2xl font-bold`
- **Must include `data-testid="square"`** on the `<button>` element for E2E test targeting.

### Step 7: Create `Board.tsx`
- Props: `squares: ('X' | 'O' | null)[]`, `onSquareClick: (i: number) => void`, `winnerSquares: number[]`
- Renders a 3×3 grid using CSS Grid (`grid grid-cols-3 gap-2`)
- Maps squares array to `<Square>` components, passing `isWinner` when the square index is in `winnerSquares`

### Step 8: Create `gameLogic.ts`
Extract pure game-logic functions into `frontend/src/islands/tictactoe/gameLogic.ts` so they can be unit-tested independently of React:

```typescript
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
```

### Step 9: Create `TicTacToeIsland.tsx`
This is the main stateful component. It owns all game logic.

**Imports:**
```typescript
import { useState } from 'react';
import { calculateWinner, isDraw } from './gameLogic';
import type { Squares } from './gameLogic';
import Board from './Board';
```

**State:**
```typescript
const [squares, setSquares] = useState<Squares>(Array(9).fill(null));
const [xIsNext, setXIsNext] = useState(true);
// xStartsNext tracks who opens each new game so the advantage alternates fairly
const [xStartsNext, setXStartsNext] = useState(false); // after first game X already went first
const [scores, setScores] = useState<{ X: number; O: number; draws: number }>({ X: 0, O: 0, draws: 0 });
```

**`handleClick(i: number)`:**

Compute winner/draw from `nextSquares` **synchronously before any `setState` call** — React state updates are asynchronous so reading `squares` state after `setSquares` would return stale data.

```typescript
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
```

**`handleReset()`:**

Use the dedicated `xStartsNext` state (not `xIsNext`) to reliably alternate who opens each new game, regardless of how the previous game ended.

```typescript
function handleReset(): void {
  const nextStarter = !xStartsNext;
  setXStartsNext(nextStarter);
  setXIsNext(nextStarter);
  setSquares(Array(9).fill(null));
}
```

**UI layout:**
- Scoreboard: show `X: {scores.X}  |  O: {scores.O}  |  Draws: {scores.draws}`
- Status message: "Player X's turn", "Player O's turn", "🎉 X wins!", "🎉 O wins!", "It's a draw!"
- `<Board>` component
- "New Game" button (calls `handleReset`)

### Step 10: Add Navigation Link to Hello Page
- In `src/app/templates/hello/index.html`, add a link to `/tictactoe` so users can discover the game.
  Example: add `<a href="/tictactoe" class="mt-4 inline-block text-blue-600 hover:underline">Play Tic-Tac-Toe →</a>` inside the `{% block content %}` section.

### Step 11: Write Vitest Unit Tests (`frontend/src/islands/tictactoe/gameLogic.test.ts`)
Test the pure game logic functions in isolation:

```typescript
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
    // X O X / X O X / O X O
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
    // X O X / X O X / O X O
    const squares: Squares = ['X', 'O', 'X', 'X', 'O', 'X', 'O', 'X', 'O'];
    expect(isDraw(squares)).toBe(true);
  });
});
```

### Step 12: Write pytest Unit Tests (`tests/test_tictactoe.py`)
Test the Flask route:

```python
class TestTicTacToePage:
    def test_index_returns_200(self, client):
        response = client.get('/tictactoe')
        assert response.status_code == 200

    def test_index_returns_html(self, client):
        response = client.get('/tictactoe')
        assert b'Tic-Tac-Toe' in response.data

    def test_index_has_island_mount_point(self, client):
        response = client.get('/tictactoe')
        assert b'data-island="tictactoe"' in response.data
```

### Step 13: Write Playwright E2E Tests (`e2e/tictactoe.spec.ts`)
Create a new spec file with the following test scenarios:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Tic-Tac-Toe', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tictactoe');
  });

  test('page loads with game board', async ({ page }) => {
    await expect(page.getByText("Player X's turn")).toBeVisible();
    // Use data-testid="square" (not a generic button locator) to avoid
    // matching the "New Game" button or other page buttons
    await expect(page.locator('[data-testid="square"]')).toHaveCount(9);
  });

  test('players can take turns', async ({ page }) => {
    const squares = page.locator('[data-testid="square"]');
    await squares.nth(0).click(); // X plays
    await expect(squares.nth(0)).toHaveText('X');
    await expect(page.getByText("Player O's turn")).toBeVisible();
    await squares.nth(4).click(); // O plays
    await expect(squares.nth(4)).toHaveText('O');
    await expect(page.getByText("Player X's turn")).toBeVisible();
  });

  test('detects a winner', async ({ page }) => {
    const squares = page.locator('[data-testid="square"]');
    // X wins top row: 0, 1, 2 with O at 3, 4
    await squares.nth(0).click(); // X
    await squares.nth(3).click(); // O
    await squares.nth(1).click(); // X
    await squares.nth(4).click(); // O
    await squares.nth(2).click(); // X wins
    await expect(page.getByText('🎉 X wins!')).toBeVisible();
  });

  test('detects a draw', async ({ page }) => {
    const squares = page.locator('[data-testid="square"]');
    // Force draw: X O X / X O X / O X O
    // X plays: 0,2,3,5,7  |  O plays: 1,4,6,8
    const moves = [0, 1, 2, 4, 3, 6, 5, 8, 7];
    for (const i of moves) {
      await squares.nth(i).click();
    }
    await expect(page.getByText("It's a draw!")).toBeVisible();
  });

  test('new game resets the board', async ({ page }) => {
    const squares = page.locator('[data-testid="square"]');
    await squares.nth(0).click();
    await page.getByRole('button', { name: 'New Game' }).click();
    for (let i = 0; i < 9; i++) {
      await expect(squares.nth(i)).toHaveText('');
    }
  });

  test('scores are tracked across games', async ({ page }) => {
    const squares = page.locator('[data-testid="square"]');
    // X wins
    await squares.nth(0).click();
    await squares.nth(3).click();
    await squares.nth(1).click();
    await squares.nth(4).click();
    await squares.nth(2).click();
    await expect(page.getByText(/X:\s*1/)).toBeVisible();
    await page.getByRole('button', { name: 'New Game' }).click();
    await expect(page.getByText(/X:\s*1/)).toBeVisible(); // score persists
  });
});
```

### Step 14: Run Validation Commands
Execute all validation commands listed below.

---

## Testing Strategy

### Unit Tests
- `frontend/src/islands/tictactoe/gameLogic.test.ts`: Vitest tests for all 8 win lines, draw detection, no false-positive wins on full non-winning boards.
- `tests/test_tictactoe.py`: HTTP 200, HTML response contains title, island mount point present.

### Edge Cases
- Clicking an already-filled square does nothing.
- Clicking any square after the game is over does nothing.
- Win detection covers all 8 winning lines (3 rows, 3 cols, 2 diagonals).
- Draw: all 9 squares filled with no winner.
- Score persists across "New Game" resets within the same page session.
- First player alternates on each "New Game" (X starts game 1, O starts game 2, etc.).
- Page works with JavaScript disabled (shows noscript fallback message in template).

---

## Acceptance Criteria
- [ ] `GET /tictactoe` returns HTTP 200 with valid HTML.
- [ ] The page displays a 3×3 game board with 9 clickable squares.
- [ ] Squares display "X" or "O" after being clicked in turn order (X first).
- [ ] Clicking an occupied square or a square after game-over has no effect.
- [ ] All 8 winning combinations are correctly detected and shown.
- [ ] A draw is correctly detected when all squares are filled with no winner.
- [ ] Winner squares are visually highlighted.
- [ ] A status message shows whose turn it is, who won, or "draw".
- [ ] A "New Game" button resets the board.
- [ ] Scores (X wins, O wins, Draws) update correctly and persist across new games.
- [ ] First player alternates on each "New Game" reset.
- [ ] A navigation link on the Hello page (`/`) points to `/tictactoe`.
- [ ] All existing tests continue to pass (zero regressions).
- [ ] New pytest tests pass.
- [ ] New Vitest unit tests for game logic pass.
- [ ] New Playwright E2E tests pass.

---

## Validation Commands

```bash
# 1. Backend unit tests (includes new tictactoe tests)
PYTHONPATH=src pytest tests/ -v

# 2. Frontend unit + component tests (includes new gameLogic tests)
cd frontend && npm test -- --run

# 3. Type checking (backend + frontend)
mypy src/ --ignore-missing-imports
cd frontend && npm run typecheck

# 4. Linting (backend + frontend)
flake8 src/ tests/
cd frontend && npm run lint

# 5. E2E tests for the new feature only
npx playwright test e2e/tictactoe.spec.ts --reporter=line

# 6. Full E2E suite (no regressions)
npx playwright test --reporter=line
```

---

## Notes
- **No database needed.** Game state is local to the React island. This keeps the feature lightweight and demonstrates that not all islands need server-side persistence.
- **Game logic in `gameLogic.ts`.** Keep `calculateWinner` and `isDraw` as exported pure functions in a dedicated `gameLogic.ts` file so they are independently testable with Vitest.
- **Do not import React in `.tsx` files unnecessarily.** The project uses `"jsx": "react-jsx"` (React 17+ automatic JSX transform). Importing `React` when it's not directly used will fail the TypeScript build due to `noUnusedLocals: true`.
- **Clear the island element before mounting.** Follow the `hello/index.tsx` pattern: `element.innerHTML = ''` before `createRoot(element).render(...)`.
- **`data-testid="square"`** must be added to each `<button>` in `Square.tsx` so E2E tests can reliably select squares without accidentally matching other buttons on the page.
- **Navigation link is required.** Add a link from `/` to `/tictactoe` in `hello/index.html`.
- **Future extension ideas:**
  - AI opponent using the minimax algorithm.
  - Persistent leaderboard using a `GameResult` SQLAlchemy model.
  - Move history with time-travel (undo).
  - Online multiplayer via WebSockets.
- **Future extension ideas:**
  - AI opponent using the minimax algorithm.
  - Persistent leaderboard using a `GameResult` SQLAlchemy model.
  - Move history with time-travel (undo).
  - Online multiplayer via WebSockets.
