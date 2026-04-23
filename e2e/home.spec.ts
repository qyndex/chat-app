import { test, expect } from '@playwright/test';

test.describe('Chat App — home / room navigation', () => {
  test('home page shows the room list sidebar', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /rooms/i })).toBeVisible();
  });

  test('home page shows all three default rooms', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /general/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /random/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /tech talk/i })).toBeVisible();
  });

  test('home page shows "Select a room" placeholder', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/select a room/i)).toBeVisible();
  });

  test('navigating to a room shows the message input', async ({ page }) => {
    await page.goto('/room/general');
    await expect(page.getByPlaceholder(/type a message/i)).toBeVisible();
  });

  test('navigating to a room shows the Send button', async ({ page }) => {
    await page.goto('/room/general');
    await expect(page.getByRole('button', { name: /send/i })).toBeVisible();
  });

  test('clicking a room link navigates to that room URL', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /general/i }).click();
    await expect(page).toHaveURL(/\/room\/general/);
    await expect(page.getByPlaceholder(/type a message/i)).toBeVisible();
  });

  test('room list remains visible inside a room', async ({ page }) => {
    await page.goto('/room/tech');
    await expect(page.getByRole('heading', { name: /rooms/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /tech talk/i })).toBeVisible();
  });
});
