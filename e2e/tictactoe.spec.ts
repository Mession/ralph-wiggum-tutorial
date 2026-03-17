import { test, expect } from '@playwright/test';

test.describe('Tic-Tac-Toe', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tictactoe');
  });

  test('page loads with game board', async ({ page }) => {
    await expect(page.getByText("Player X's turn")).toBeVisible();
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
