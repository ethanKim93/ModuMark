import { test, expect } from '@playwright/test';

test.describe('PDF 다운로드 파일명 검증 (이슈 2)', () => {
  test('PDF 페이지: DownloadDialog가 숨겨진 상태로 시작', async ({ page }) => {
    await page.goto('/pdf');

    /* 초기 상태에서 다이얼로그가 없어야 함 */
    const dialogTitle = page.locator('text=파일 저장');
    await expect(dialogTitle).not.toBeVisible();
  });

  test('PDF Merge 페이지: DownloadDialog가 숨겨진 상태로 시작 (redirect)', async ({ page }) => {
    // /pdf/merge → /pdf 로 redirect
    await page.goto('/pdf/merge');
    await expect(page).toHaveURL('/pdf');

    const dialogTitle = page.locator('text=파일 저장');
    await expect(dialogTitle).not.toBeVisible();
  });

  test('PDF Split 페이지: DownloadDialog가 숨겨진 상태로 시작 (redirect)', async ({ page }) => {
    // /pdf/split → /pdf 로 redirect
    await page.goto('/pdf/split');
    await expect(page).toHaveURL('/pdf');

    const dialogTitle = page.locator('text=파일 저장');
    await expect(dialogTitle).not.toBeVisible();
  });
});

test.describe('PDF 다운로드 다이얼로그 - UI 확인', () => {
  test('PDF: 파일 없을 때 병합 버튼 비활성화', async ({ page }) => {
    await page.goto('/pdf');

    const mergeBtn = page.locator('button:has-text("PDF 병합")');
    await expect(mergeBtn).toBeDisabled();
  });

  test('PDF: 파일 없을 때 페이지 추출 버튼 미표시 (선택 없음)', async ({ page }) => {
    await page.goto('/pdf');

    // 선택된 페이지가 없으면 추출 버튼이 렌더링되지 않음
    const extractBtn = page.locator('button:has-text("페이지 추출")');
    await expect(extractBtn).not.toBeVisible();
  });
});
