import { test, expect } from '@playwright/test';

test.describe('Gomoku', () => {
  test('size selector displays preset options and custom input', async ({ page }) => {
    await page.goto('/gomoku');
    await expect(page.getByRole('button', { name: '10×10' })).toBeVisible();
    await expect(page.getByRole('button', { name: '15×15' })).toBeVisible();
    await expect(page.getByRole('button', { name: '19×19' })).toBeVisible();
    await expect(page.getByRole('spinbutton')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start Game' })).toBeVisible();
  });

  test('clicking a preset starts the game with correct grid', async ({ page }) => {
    await page.goto('/gomoku');
    await page.getByRole('button', { name: '10×10' }).click();
    await expect(page.getByText("Player X's turn")).toBeVisible();
    await expect(page.locator('[data-testid="cell"]').first()).toBeVisible();
  });

  test('players alternate turns', async ({ page }) => {
    await page.goto('/gomoku');
    await page.getByRole('button', { name: '10×10' }).click();
    await expect(page.getByText("Player X's turn")).toBeVisible();

    const firstCell = page.locator('[data-testid="cell"]').first();
    await firstCell.click();
    await expect(firstCell).toHaveText('X');
    await expect(page.getByText("Player O's turn")).toBeVisible();

    // Click a different cell
    const cells = page.locator('[data-testid="cell"]');
    await cells.nth(1).click();
    await expect(cells.nth(1)).toHaveText('O');
    await expect(page.getByText("Player X's turn")).toBeVisible();
  });

  test('horizontal 5-in-a-row triggers win', async ({ page }) => {
    await page.goto('/gomoku');
    await page.getByRole('button', { name: '10×10' }).click();

    // X plays row 0 cols 0-4, O plays row 1 cols 0-3
    for (let i = 0; i < 4; i++) {
      await page.locator(`[data-testid="cell"][data-row="0"][data-col="${i}"]`).click(); // X
      await page.locator(`[data-testid="cell"][data-row="1"][data-col="${i}"]`).click(); // O
    }
    await page.locator('[data-testid="cell"][data-row="0"][data-col="4"]').click(); // X wins

    await expect(page.getByText('🎉 X wins!')).toBeVisible();
  });

  test('winning cells are highlighted', async ({ page }) => {
    await page.goto('/gomoku');
    await page.getByRole('button', { name: '10×10' }).click();

    for (let i = 0; i < 4; i++) {
      await page.locator(`[data-testid="cell"][data-row="0"][data-col="${i}"]`).click();
      await page.locator(`[data-testid="cell"][data-row="1"][data-col="${i}"]`).click();
    }
    await page.locator('[data-testid="cell"][data-row="0"][data-col="4"]').click();

    // Check winning cells have yellow background
    const winCell = page.locator('[data-testid="cell"][data-row="0"][data-col="0"]');
    await expect(winCell).toHaveClass(/bg-yellow-200/);
  });

  test('clicking a filled cell does nothing', async ({ page }) => {
    await page.goto('/gomoku');
    await page.getByRole('button', { name: '10×10' }).click();

    const cell = page.locator('[data-testid="cell"][data-row="0"][data-col="0"]');
    await cell.click(); // X
    await expect(cell).toHaveText('X');
    await expect(page.getByText("Player O's turn")).toBeVisible();

    await cell.click(); // click again - should do nothing
    await expect(cell).toHaveText('X');
    await expect(page.getByText("Player O's turn")).toBeVisible();
  });

  test('clicks after game over do nothing', async ({ page }) => {
    await page.goto('/gomoku');
    await page.getByRole('button', { name: '10×10' }).click();

    for (let i = 0; i < 4; i++) {
      await page.locator(`[data-testid="cell"][data-row="0"][data-col="${i}"]`).click();
      await page.locator(`[data-testid="cell"][data-row="1"][data-col="${i}"]`).click();
    }
    await page.locator('[data-testid="cell"][data-row="0"][data-col="4"]').click();
    await expect(page.getByText('🎉 X wins!')).toBeVisible();

    // Try to click an empty cell - should do nothing
    const emptyCell = page.locator('[data-testid="cell"][data-row="2"][data-col="0"]');
    await emptyCell.click();
    await expect(emptyCell).toHaveText('');
  });

  test('New Game resets board but preserves scores', async ({ page }) => {
    await page.goto('/gomoku');
    await page.getByRole('button', { name: '10×10' }).click();

    // X wins
    for (let i = 0; i < 4; i++) {
      await page.locator(`[data-testid="cell"][data-row="0"][data-col="${i}"]`).click();
      await page.locator(`[data-testid="cell"][data-row="1"][data-col="${i}"]`).click();
    }
    await page.locator('[data-testid="cell"][data-row="0"][data-col="4"]').click();
    await expect(page.getByText(/X:\s*1/)).toBeVisible();

    await page.getByRole('button', { name: 'New Game' }).click();
    // Board is reset
    await expect(page.getByText("Player O's turn")).toBeVisible(); // O starts next
    // Scores preserved
    await expect(page.getByText(/X:\s*1/)).toBeVisible();
  });

  test('score increments correctly after wins', async ({ page }) => {
    await page.goto('/gomoku');
    await page.getByRole('button', { name: '10×10' }).click();

    // X wins first game
    for (let i = 0; i < 4; i++) {
      await page.locator(`[data-testid="cell"][data-row="0"][data-col="${i}"]`).click();
      await page.locator(`[data-testid="cell"][data-row="1"][data-col="${i}"]`).click();
    }
    await page.locator('[data-testid="cell"][data-row="0"][data-col="4"]').click();
    await expect(page.getByText(/X:\s*1/)).toBeVisible();
    await expect(page.getByText(/O:\s*0/)).toBeVisible();
  });

  test('custom size input works', async ({ page }) => {
    await page.goto('/gomoku');
    const input = page.getByRole('spinbutton');
    await input.fill('8');
    await page.getByRole('button', { name: 'Start Game' }).click();
    await expect(page.getByText("Player X's turn")).toBeVisible();
  });

  test('Change Size returns to size selector and resets scores', async ({ page }) => {
    await page.goto('/gomoku');
    await page.getByRole('button', { name: '10×10' }).click();

    // Play a move then change size
    await page.locator('[data-testid="cell"][data-row="0"][data-col="0"]').click();
    await page.getByRole('button', { name: 'Change Size' }).click();

    // Should see size selector again
    await expect(page.getByRole('button', { name: '15×15' })).toBeVisible();
    // Scores should be reset
    await expect(page.getByText(/X:\s*0/)).toBeVisible();
    await expect(page.getByText(/O:\s*0/)).toBeVisible();
  });
});
