import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { name: '모바일(375px)', width: 375, height: 812 },
  { name: '태블릿(768px)', width: 768, height: 1024 },
  { name: '데스크탑(1280px)', width: 1280, height: 800 },
];

test.describe('반응형 레이아웃', () => {
  for (const viewport of VIEWPORTS) {
    test(`에디터 페이지 ${viewport.name} 레이아웃 정상 렌더링`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/editor');
      await page.waitForSelector('.milkdown', { timeout: 10000 });

      /* 에디터 영역이 보임 */
      const editor = page.locator('.milkdown');
      await expect(editor).toBeVisible();

      /* 페이지 가로 스크롤 없음 확인 */
      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      const clientWidth = await page.evaluate(() => document.body.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5); // 5px 허용 오차
    });

    test(`랜딩 페이지 ${viewport.name} 레이아웃 정상 렌더링`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      const response = await page.goto('/');
      expect(response?.status()).toBe(200);
      await expect(page.locator('body')).toBeVisible();
    });
  }

  test('모바일(375px)에서 에디터 메인 영역이 표시된다', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/editor');
    await page.waitForSelector('.milkdown', { timeout: 10000 });
    /* 모바일에서 사이드바(w-14=56px)가 표시되므로 에디터 너비는 375-56=319px 이하 */
    const editor = page.locator('.milkdown');
    await expect(editor).toBeVisible();
    const box = await editor.boundingBox();
    expect(box?.width).toBeGreaterThan(200);
  });
});
