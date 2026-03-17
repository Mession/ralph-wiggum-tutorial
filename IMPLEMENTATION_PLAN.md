# Implementation Plan — ralph-wiggum-tutorial

## Status

> **Starter Spec: ✅ Complete | Tic-Tac-Toe Feature: ✅ Complete | Gomoku Feature: 🔴 Not Started**
>
> _Last updated: 2026-03-17. Existing tests passing — 15 pytest, 12 vitest, 15 Playwright E2E._

The starter scaffold and Tic-Tac-Toe feature are fully implemented. The Gomoku (Five in a Row) feature is completely unimplemented and is the primary work item.

---

## ✅ COMPLETED

**Starter spec (`specs/starter.md`) — all items verified complete:**

- [x] Flask backend, React Islands frontend, all scripts, CI, migrations, docs, config

**Tic-Tac-Toe feature (`specs/feature-tictactoe-abc123.md`) — all items verified complete:**

- [x] Game logic: `gameLogic.ts` with `calculateWinner`, `isDraw`, types (`Player`, `Squares`, `WinResult`)
- [x] React components: `Square.tsx`, `Board.tsx`, `TicTacToeIsland.tsx`, island entry `index.tsx`
- [x] Island registration in `frontend/src/main.ts`
- [x] Backend: `tictactoe_bp` Blueprint, `/tictactoe` route, Jinja2 template with island mount point
- [x] Navigation link from Hello page to Tic-Tac-Toe
- [x] Vitest unit tests (8 tests in `gameLogic.test.ts`): winner detection (row/col/diagonal), draw, edge cases
- [x] pytest tests (3 tests in `test_tictactoe.py`): route 200, HTML content, island mount point
- [x] Playwright E2E tests (6 tests in `tictactoe.spec.ts`): board load, turns, winner, draw, reset, scores
- [x] Full validation: `script/test`, `script/typecheck`, `script/lint`, E2E — all passing, zero regressions

---

## 🔴 HIGH PRIORITY — Gomoku Feature (`specs/feature-gomoku-five-in-a-row-def456.md`)

Zero Gomoku files exist. Everything below must be created from scratch.

### Phase 1: Dependencies

- [ ] **Install `@tanstack/react-virtual@^3`** in `frontend/` — Required for virtualized board rendering of large grids (up to 100×100)

### Phase 2: Game Logic (`frontend/src/islands/gomoku/gameLogic.ts`)

- [ ] **Create `frontend/src/islands/gomoku/gameLogic.ts`** — Pure functions, no React imports:
  - Constants: `WIN_LENGTH = 5`, `DEFAULT_GRID_SIZE = 15`, `MIN_GRID_SIZE = 5`, `MAX_GRID_SIZE = 100`
  - Types: `Player` ("X" | "O"), `CellKey` string, `GamePhase` ("setup" | "playing" | "over")
  - `cellKey(row, col)` → string key for sparse Map
  - `checkWin(board: Map<string, Player>, lastRow, lastCol, player)` → winning cells array or null. O(WIN_LENGTH) scan from last move in 4 directions (horizontal, vertical, both diagonals). Must count bidirectionally from the placed stone.
  - `isDraw(board, gridSize)` → boolean (board.size === gridSize * gridSize)

### Phase 3: Game Logic Tests (`frontend/src/islands/gomoku/gameLogic.test.ts`)

- [ ] **Create `frontend/src/islands/gomoku/gameLogic.test.ts`** — Vitest unit tests:
  - Horizontal win (5 in a row), vertical win, both diagonal wins
  - 4-in-a-row correctly returns null (not a win)
  - Boundary conditions (win touching board edges)
  - Bidirectional counting (placing stone in the middle of a sequence)
  - `isDraw` returns true when board is full, false otherwise
  - `cellKey` produces correct string keys

### Phase 4: React Components

- [ ] **Create `frontend/src/islands/gomoku/Cell.tsx`** — Pure component, button element with:
  - `data-testid="cell"`, `data-row`, `data-col` attributes
  - Tailwind styling: X = blue text, O = red text, winner cells = yellow background
  - Props: row, col, value (Player | null), isWinner (boolean), onClick, style (for virtualizer positioning)

- [ ] **Create `frontend/src/islands/gomoku/VirtualBoard.tsx`** — Virtualized board using `@tanstack/react-virtual` v3:
  - Two `useVirtualizer` instances: one for rows, one for columns
  - Fixed 560px × 560px viewport container
  - `CELL_SIZE = 40px`, `overscan = 3`
  - Renders only visible cells via Cell component
  - Props: gridSize, board (Map), winningCells, onCellClick, currentPlayer

- [ ] **Create `frontend/src/islands/gomoku/SizeSelector.tsx`** — Setup screen component:
  - Preset buttons: 10×10, 15×15, 19×19
  - Custom size input (number, range 5–100) with validation
  - "Start Game" button
  - Props: onSizeSelect (callback with grid size number)

- [ ] **Create `frontend/src/islands/gomoku/GomokuIsland.tsx`** — Root component managing all state:
  - State: `GamePhase` (setup → playing → over), board (Map), gridSize, currentPlayer, winner, winningCells, scores {X, O}
  - `handleCellClick(row, col)` — place stone, check win/draw, toggle player
  - `handleSizeSelect(size)` — transition from setup to playing
  - `handleNewGame()` — reset board, keep scores and size
  - `handleChangeSize()` — return to setup phase, reset scores
  - Renders: scoreboard (X/O scores), status bar (current turn / winner / draw), VirtualBoard or SizeSelector based on phase, New Game + Change Size buttons

### Phase 5: Island Entry & Registration

- [ ] **Create `frontend/src/islands/gomoku/index.tsx`** — Island mount function:
  - Export default mount function that takes a container element
  - Clear innerHTML, createRoot, render `<GomokuIsland />`
  - Do NOT import React (JSX transform handles it)

- [ ] **Register island in `frontend/src/main.ts`** — Add gomoku to the island registry map, lazy-loaded like other islands

### Phase 6: Flask Backend

- [ ] **Create `src/app/views/gomoku.py`** — Flask Blueprint:
  - `gomoku_bp = Blueprint("gomoku", __name__, template_folder="../templates")`
  - `GET /gomoku` → renders `gomoku/index.html`

- [ ] **Create `src/app/templates/gomoku/index.html`** — Jinja2 template:
  - Extends `base.html`
  - Contains `<div data-island="gomoku"></div>` mount point
  - Page title includes "Gomoku"
  - Nav links to `/` (Hello) and `/tictactoe`

- [ ] **Register blueprint in `src/app/views/__init__.py`** — Import and register `gomoku_bp`

### Phase 7: Cross-Page Navigation

- [ ] **Add nav link to `/gomoku` from Hello template** (`src/app/templates/hello/index.html`)
- [ ] **Add nav link to `/gomoku` from Tic-Tac-Toe template** (`src/app/templates/tictactoe/index.html`)

### Phase 8: Backend Tests

- [ ] **Create `tests/test_gomoku.py`** — 3 pytest tests:
  - `test_gomoku_returns_200` — GET /gomoku returns 200
  - `test_gomoku_contains_title` — Response contains "Gomoku" in page content
  - `test_gomoku_has_island_mount_point` — Response contains `data-island="gomoku"`

### Phase 9: E2E Tests

- [ ] **Create `e2e/gomoku.spec.ts`** — 11 Playwright E2E tests:
  1. Size selector displays preset options (10, 15, 19) and custom input
  2. Clicking a preset starts the game with correct grid
  3. Players alternate turns (X first, then O)
  4. Horizontal 5-in-a-row triggers win detection
  5. Winning cells are highlighted (yellow background)
  6. Clicking a filled cell does nothing (no player change)
  7. Clicks after game over do nothing
  8. "New Game" resets board but preserves scores
  9. Score increments correctly after wins
  10. Custom size input works (enter a number, click Start Game)
  11. "Change Size" returns to size selector and resets scores

### Phase 10: Validation

- [ ] **Run `script/test`** — All pytest + vitest tests pass (including new Gomoku tests)
- [ ] **Run `script/typecheck`** — mypy + tsc clean with no errors
- [ ] **Run `script/lint`** — flake8 + eslint clean
- [ ] **Run `script/test-e2e`** — All Playwright E2E tests pass (including 11 new Gomoku tests)

---

## 🟡 MEDIUM PRIORITY — Improvements

- [ ] **Create shared frontend directories** (`frontend/src/components/`, `frontend/src/hooks/`, `frontend/src/lib/`) — Create when 2+ islands share code. Gomoku and TicTacToe may share player types or utility functions; evaluate after Gomoku implementation.
- [ ] **Improve HelloIsland test coverage** — Current vitest tests cover render/form state only. Add tests for form submission (async API call) and delete interaction.

---

## ⬜ LOW PRIORITY — Nice-to-Have

- [ ] **Add TicTacToe vitest component tests** — Currently only `gameLogic.test.ts` unit tests exist; no component-level vitest tests for Square, Board, or TicTacToeIsland.
- [ ] **Consolidate shared types** — If Gomoku and TicTacToe share a `Player` type, extract to `frontend/src/lib/types.ts`.
- [ ] **Create `src/lib/` for shared backend utilities** — Not needed yet, but consolidate here if backend logic is shared across blueprints.
