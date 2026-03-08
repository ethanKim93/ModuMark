import { test, expect } from '@playwright/test';

test.describe('PDF 사이드바 썸네일 미리보기 검증 (이슈 3)', () => {
  test('/pdf: PdfSidebar에 "페이지 목록" 섹션 존재', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/pdf');

    /* 페이지 목록 레이블 (max-lg:hidden 이므로 1280px에서 표시됨) */
    const label = page.locator('text=페이지 목록');
    await expect(label).toBeVisible();
  });

  test('/pdf: 파일 없을 때 "페이지 없음" 안내 표시', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/pdf');

    const emptyText = page.locator('text=페이지 없음');
    await expect(emptyText).toBeVisible();
  });

  test('/pdf/split → /pdf: PdfSidebar에 "페이지 목록" 섹션 존재 (redirect)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/pdf/split');
    // redirect되어 /pdf로 이동
    await expect(page).toHaveURL('/pdf');

    const label = page.locator('text=페이지 목록');
    await expect(label).toBeVisible();
  });

  test('/pdf 모바일(375px): 사이드바 "페이지 목록" 텍스트는 lg에서만 표시', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/pdf');

    /* 모바일에서 max-lg:hidden이므로 "페이지 목록" 텍스트는 숨겨짐 */
    const label = page.locator('text=페이지 목록');
    await expect(label).toBeHidden();
  });

  test('/pdf: PdfSidebar 높이가 0보다 크다', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/pdf');

    const sidebar = page.locator('aside').first();
    const box = await sidebar.boundingBox();
    expect(box?.height).toBeGreaterThan(0);
  });
});
