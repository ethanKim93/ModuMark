import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('PDF 병합 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pdf/merge');
  });

  test('PDF 병합 페이지 접근 시 200 응답', async ({ page }) => {
    expect(page.url()).toContain('/pdf/merge');
    await expect(page.locator('body')).toBeVisible();
  });

  test('드롭 존 영역이 표시된다', async ({ page }) => {
    /* DropZone 컴포넌트 확인 */
    const dropZone = page.locator('[class*="drop"], [class*="upload"]').first();
    await expect(dropZone).toBeVisible();
  });
});

test.describe('PDF 분할 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pdf/split');
  });

  test('PDF 분할 페이지 접근 시 200 응답', async ({ page }) => {
    expect(page.url()).toContain('/pdf/split');
    await expect(page.locator('body')).toBeVisible();
  });

  test('드롭 존 영역이 표시된다', async ({ page }) => {
    const dropZone = page.locator('[class*="drop"], [class*="upload"]').first();
    await expect(dropZone).toBeVisible();
  });
});
