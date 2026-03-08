import { test, expect } from '@playwright/test';

test.describe('헤더 · 네비게이션 검증', () => {
  test('데스크탑(1280px): 에디터 헤더 표시', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/editor');
    await page.waitForSelector('.milkdown', { timeout: 10000 });

    const header = page.locator('header').first();
    await expect(header).toBeVisible();

    /* 헤더 너비가 뷰포트 너비만큼 충분히 넓음 */
    const box = await header.boundingBox();
    expect(box?.width).toBeGreaterThan(600);
  });

  test('모바일(375px): 에디터 헤더 표시', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/editor');
    await page.waitForSelector('.milkdown', { timeout: 10000 });

    const header = page.locator('header').first();
    await expect(header).toBeVisible();
  });

  test('AppHeader: Markdown · PDF 네비 링크 존재', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/editor');
    await page.waitForSelector('.milkdown', { timeout: 10000 });

    // AppHeader 내 nav에 링크 2개(Markdown, PDF) 존재
    const headerNav = page.locator('header nav');
    const links = headerNav.locator('a');
    await expect(links).toHaveCount(2);
  });

  test('AppHeader PDF 링크 클릭 → PDF 페이지 이동', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/editor');

    const pdfLink = page.locator('header nav a[href="/pdf"]');
    await expect(pdfLink).toBeAttached();
    await pdfLink.evaluate((el: HTMLAnchorElement) => el.click());
    await expect(page).toHaveURL('/pdf');
  });

  test('에디터 헤더: "파일 열기" 버튼 존재', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/editor');
    await page.waitForSelector('.milkdown', { timeout: 10000 });

    const openBtn = page.locator('button[title="파일 열기"]');
    await expect(openBtn).toBeVisible();
  });

  test('에디터 헤더: 광고 배너("키 미등록") 표시', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/editor');
    await page.waitForSelector('.milkdown', { timeout: 10000 });

    /* AdSense 키가 placeholder일 때 안내 텍스트가 DOM에 렌더링됨 */
    const adPlaceholder = page.locator('[data-testid="ad-placeholder"]').first();
    await expect(adPlaceholder).toHaveText('광고 영역 (키 미등록)');
  });

  test('PdfSidebar: 광고 플레이스홀더 표시', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/pdf');

    const adPlaceholder = page.locator('[data-testid="ad-placeholder"]').first();
    await expect(adPlaceholder).toBeVisible();
  });
});
