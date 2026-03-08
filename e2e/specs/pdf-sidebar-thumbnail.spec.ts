import { test, expect } from '@playwright/test';

test.describe('PDF 사이드바 썸네일 미리보기 검증 (이슈 3)', () => {
  test('/pdf/merge: PdfSidebar에 "파일 목록" 섹션 존재', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/pdf/merge');

    /* 파일 목록 레이블 */
    const label = page.locator('text=파일 목록');
    await expect(label).toBeVisible();
  });

  test('/pdf/merge: 파일 없을 때 "파일 없음" 안내 표시', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/pdf/merge');

    const emptyText = page.locator('text=파일 없음');
    await expect(emptyText).toBeVisible();
  });

  test('/pdf/split: PdfSidebar에 "파일 목록" 섹션이 없음 (merge만 표시)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/pdf/split');

    const label = page.locator('text=파일 목록');
    await expect(label).not.toBeVisible();
  });

  test('/pdf/merge 모바일(375px): 사이드바 썸네일 영역은 있지만 "파일 없음" 텍스트는 lg에서만 표시', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/pdf/merge');

    /* 모바일에서 lg:block이므로 "파일 없음" 텍스트는 숨겨짐 */
    const emptyText = page.locator('text=파일 없음');
    await expect(emptyText).toBeHidden();
  });

  test('/pdf/merge: PdfSidebar 높이가 0보다 크다', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/pdf/merge');

    const sidebar = page.locator('aside').first();
    const box = await sidebar.boundingBox();
    expect(box?.height).toBeGreaterThan(0);
  });
});
