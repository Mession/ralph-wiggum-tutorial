# Implementation Plan — ralph-wiggum-tutorial

## Status

> **Starter Spec: ✅ Complete | Tic-Tac-Toe Feature: ✅ Complete | Gomoku Feature: ✅ Complete**
>
> _Last updated: 2026-03-17. All tests passing — 18 pytest, 23 vitest, 26 Playwright E2E (87 total)._

All three specs are fully implemented and validated.

---

## ✅ COMPLETED

**Starter spec (`specs/starter.md`) — all items verified complete:**

- [x] Flask backend, React Islands frontend, all scripts, CI, migrations, docs, config

**Tic-Tac-Toe feature (`specs/feature-tictactoe-abc123.md`) — all items verified complete:**

- [x] Game logic, React components, island registration, backend blueprint, navigation, all tests

**Gomoku feature (`specs/feature-gomoku-five-in-a-row-def456.md`) — all items verified complete:**

- [x] `@tanstack/react-virtual@^3` installed
- [x] Game logic (`gameLogic.ts`): `checkWin` (O(WIN_LENGTH) bidirectional scan), `isDraw`, `cellKey`, constants/types
- [x] 11 Vitest unit tests (`gameLogic.test.ts`): all 4 win directions, 4-in-a-row null, boundary, bidirectional, draw, cellKey
- [x] `Cell.tsx`: data-testid/data-row/data-col, color coding (blue X, red O), yellow winner highlight
- [x] `VirtualBoard.tsx`: dual `useVirtualizer` (row+column), 40px cells, 560px max viewport, 3 overscan
- [x] `SizeSelector.tsx`: preset buttons (10/15/19), custom input (5–100), Start Game with validation
- [x] `GomokuIsland.tsx`: phase state machine (setup→playing→over), score tracking, starter alternation, New Game/Change Size
- [x] Island entry (`index.tsx`) + registered in `main.ts`
- [x] Flask Blueprint (`gomoku_bp`), template with island mount, registered in `__init__.py`
- [x] Cross-page navigation: Hello↔TicTacToe↔Gomoku links
- [x] 3 pytest tests (`test_gomoku.py`): route 200, title, island mount point
- [x] 11 Playwright E2E tests (`e2e/gomoku.spec.ts`): size selection, turns, win, highlight, filled cell, post-game, new game, scores, custom size, change size
- [x] Full validation: pytest ✅ vitest ✅ mypy ✅ tsc ✅ flake8 ✅ eslint ✅ playwright ✅

### Key implementation learnings (Gomoku):
- `xStartsNext` must start as `false` and use pattern: `setXIsNext(xStartsNext); setXStartsNext(!xStartsNext)` — NOT the TicTacToe pattern which doesn't properly alternate
- Sparse `Map<string, Player>` with `cellKey("row,col")` is efficient for boards up to 100×100
- VirtualBoard viewport: `min(gridSize * CELL_SIZE, 560)` adapts to small grids
- Cells use absolute positioning with style from virtualizer, not CSS grid

---

## 🟡 MEDIUM PRIORITY — Improvements

- [ ] **Improve HelloIsland test coverage** — Current vitest tests cover render/form state only. Add tests for form submission (async API call) and delete interaction.
- [ ] **Consolidate shared types** — Gomoku and TicTacToe both define `Player = 'X' | 'O'`; could extract to `frontend/src/lib/types.ts`.

---

## ⬜ LOW PRIORITY — Nice-to-Have

- [ ] **Add TicTacToe vitest component tests** — Currently only `gameLogic.test.ts` unit tests; no component-level vitest tests.
- [ ] **Fix TicTacToe starter alternation** — TicTacToe's `handleReset` uses `!xStartsNext` pattern which doesn't alternate properly (X, X, O, O, X, X...). Not caught by tests but technically incorrect.
