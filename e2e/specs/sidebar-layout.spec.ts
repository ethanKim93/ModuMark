import { test, expect } from '@playwright/test';

test.describe('레이아웃 검증', () => {
  test('데스크탑(1280px): 에디터 헤더 표시', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/editor');
    await page.waitForSelector('.milkdown', { timeout: 10000 });

    const header = page.locator('header').first();
    await expect(header).toBeVisible();
  });

  test('모바일(375px): 에디터 헤더 표시', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/editor');
    await page.waitForSelector('.milkdown', { timeout: 10000 });

    const header = page.locator('header').first();
    await expect(header).toBeVisible();
  });

  test('태블릿(768px): 에디터 헤더 표시', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/editor');
    await page.waitForSelector('.milkdown', { timeout: 10000 });

    const header = page.locator('header').first();
    await expect(header).toBeVisible();
  });

  test('에디터 헤더 높이가 0보다 크다', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/editor');
    await page.waitForSelector('.milkdown', { timeout: 10000 });

    const header = page.locator('header').first();
    const box = await header.boundingBox();
    expect(box?.height).toBeGreaterThan(0);
  });

  test('PdfSidebar 데스크탑(1280px): 사이드바 표시', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/pdf');

    const sidebar = page.locator('aside').first();
    await expect(sidebar).toBeVisible();
  });

  test('PdfSidebar 모바일(375px): 페이지 정상 렌더링', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/pdf');

    // 모바일에서도 헤더는 보임
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
  });
});
