# Implementation Plan — ralph-wiggum-tutorial

## Status

> **Starter Spec: ✅ Complete | Tic-Tac-Toe Feature: ✅ Complete**
>
> _Last verified: 2026-03-17. All tests passing — 15 pytest, 12 vitest, 15 Playwright E2E._

Both specs are fully implemented. The starter scaffold and Tic-Tac-Toe feature are complete with all tests passing, typechecks clean, and linting clean.

---

## ✅ COMPLETED

**Starter spec (`specs/starter.md`) — all items verified complete:**

- ✅ Flask backend, React Islands frontend, all scripts, CI, migrations, docs, config

**Tic-Tac-Toe feature (`specs/feature-tictactoe-abc123.md`) — all items verified complete:**

- ✅ Game logic: `gameLogic.ts` with `calculateWinner`, `isDraw`, types (`Player`, `Squares`, `WinResult`)
- ✅ React components: `Square.tsx`, `Board.tsx`, `TicTacToeIsland.tsx`, island entry `index.tsx`
- ✅ Island registration in `frontend/src/main.ts`
- ✅ Backend: `tictactoe_bp` Blueprint, `/tictactoe` route, Jinja2 template with island mount point
- ✅ Navigation link from Hello page to Tic-Tac-Toe
- ✅ Vitest unit tests (8 tests in `gameLogic.test.ts`): winner detection (row/col/diagonal), draw, edge cases
- ✅ pytest tests (3 tests in `test_tictactoe.py`): route 200, HTML content, island mount point
- ✅ Playwright E2E tests (6 tests in `tictactoe.spec.ts`): board load, turns, winner, draw, reset, scores
- ✅ Full validation: `script/test`, `script/typecheck`, `script/lint`, E2E — all passing, zero regressions

---

## ⬜ TODO — Low Priority / Nice-to-Have

- ⬜ **Create shared frontend directories** (`frontend/src/components/`, `frontend/src/hooks/`, `frontend/src/lib/`) — Only needed when islands share code.
- ⬜ **Improve HelloIsland test coverage** — Current vitest tests are basic render tests. Missing form submission and delete interaction tests.
