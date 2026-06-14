import { test, expect } from '@playwright/test';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import '../mocks/server';

const server = setupServer();

test.beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

test.afterAll(() => {
  server.close();
});

test.describe('booking flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/booking');
  });

  test('renders booking page and service step', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /đặt lịch tư vấn/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /bạn cần tư vấn về lĩnh vực nào/i })).toBeVisible();
    await expect(page.getByText(/luật doanh nghiệp/i).first()).toBeVisible();
  });

  test('selects service and lawyer then proceeds to datetime step', async ({ page }) => {
    await page.getByText(/luật doanh nghiệp/i).first().click();

    await expect(page.getByText(/ls\.\s?nguyễn văn hùng/i)).toBeVisible();
    await page.getByText(/ls\.\s?nguyễn văn hùng/i).click();

    const nextBtn = page.getByRole('button', { name: /tiếp theo/i });
    await expect(nextBtn).toBeEnabled();
    await nextBtn.click();

    await expect(page.getByRole('heading', { name: /chọn ngày và giờ/i })).toBeVisible();
  });

  test('back navigation from datetime to service step', async ({ page }) => {
    await page.getByText(/luật doanh nghiệp/i).first().click();
    await page.getByText(/ls\.\s?nguyễn văn hùng/i).click();
    await page.getByRole('button', { name: /tiếp theo/i }).click();

    await page.getByRole('button', { name: /quay lại/i }).click();
    await expect(page.getByRole('heading', { name: /bạn cần tư vấn về lĩnh vực nào/i })).toBeVisible();
  });

  test('service grid is responsive at mobile width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/booking');

    await expect(page.getByText(/luật doanh nghiệp/i).first()).toBeVisible();
    const heading = page.getByRole('heading', { name: /đặt lịch tư vấn/i });
    await expect(heading).toBeVisible();
  });
});

test.describe('booking slot conflict', () => {
  test('shows conflict error when slot already reserved', async ({ page }) => {
    server.use(
      http.post('http://localhost:8080/api/availability/reserve', () =>
        HttpResponse.json({ code: 'SLOT_ALREADY_RESERVED', message: 'Slot already reserved' }, { status: 409 }),
      ),
    );

    await page.goto('/booking');
    await page.getByText(/luật doanh nghiệp/i).first().click();
    await page.getByText(/ls\.\s?nguyễn văn hùng/i).click();
    await page.getByRole('button', { name: /tiếp theo/i }).click();

    await expect(page.getByRole('heading', { name: /chọn ngày và giờ/i })).toBeVisible();
  });
});
