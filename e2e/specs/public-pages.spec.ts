import { test, expect } from '@playwright/test';

test.describe('공개 페이지 접근', () => {
  test('랜딩 페이지(/) 접근 시 200 응답', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });

  test('보안 정책 페이지(/security) 접근 시 200 응답', async ({ page }) => {
    const response = await page.goto('/security');
    expect(response?.status()).toBe(200);
  });

  test('개인정보처리방침(/privacy) 접근 시 200 응답', async ({ page }) => {
    const response = await page.goto('/privacy');
    expect(response?.status()).toBe(200);
  });

  test('이용약관(/terms) 접근 시 200 응답', async ({ page }) => {
    const response = await page.goto('/terms');
    expect(response?.status()).toBe(200);
  });

  test('랜딩 페이지에 에디터 링크가 있다', async ({ page }) => {
    await page.goto('/');
    /* 에디터로 이동하는 링크 또는 버튼이 존재 */
    const editorLink = page.locator('a[href="/editor"], a[href*="editor"]').first();
    await expect(editorLink).toBeVisible();
  });
});
