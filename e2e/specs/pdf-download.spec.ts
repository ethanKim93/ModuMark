import { test, expect } from '@playwright/test';

test.describe('PDF 다운로드 파일명 검증 (이슈 2)', () => {
  test('PDF Split 페이지: 파일명 패턴 입력 필드 존재', async ({ page }) => {
    await page.goto('/pdf/split');

    /* 파일명 패턴 input이 렌더링됨 */
    const patternInput = page.locator('input[placeholder="{name}_p{from}-{to}"]');
    await expect(patternInput).toBeVisible();
  });

  test('PDF Split: 파일명 패턴 기본값이 올바름', async ({ page }) => {
    await page.goto('/pdf/split');

    const patternInput = page.locator('input[placeholder="{name}_p{from}-{to}"]');
    await expect(patternInput).toHaveValue('{name}_p{from}-{to}');
  });

  test('PDF Split: 패턴 힌트 텍스트({name}, {from}, {to}, {index}) 표시', async ({ page }) => {
    await page.goto('/pdf/split');

    /* 플레이스홀더 힌트 텍스트 */
    await expect(page.locator('text={name}')).toBeVisible();
    await expect(page.locator('text={from}')).toBeVisible();
    await expect(page.locator('text={to}')).toBeVisible();
    await expect(page.locator('text={index}')).toBeVisible();
  });

  test('PDF Merge 페이지: DownloadDialog가 숨겨진 상태로 시작', async ({ page }) => {
    await page.goto('/pdf/merge');

    /* 초기 상태에서 다이얼로그가 없어야 함 */
    const dialogTitle = page.locator('text=파일 저장');
    await expect(dialogTitle).not.toBeVisible();
  });

  test('PDF Split 페이지: DownloadDialog가 숨겨진 상태로 시작', async ({ page }) => {
    await page.goto('/pdf/split');

    const dialogTitle = page.locator('text=파일 저장');
    await expect(dialogTitle).not.toBeVisible();
  });
});

test.describe('PDF 다운로드 다이얼로그 - UI 확인', () => {
  test('PDF Merge: 파일 없을 때 병합 버튼 비활성화', async ({ page }) => {
    await page.goto('/pdf/merge');

    const mergeBtn = page.locator('button:has-text("PDF 병합")');
    await expect(mergeBtn).toBeDisabled();
  });

  test('PDF Split: 파일 없을 때 분할 버튼 비활성화', async ({ page }) => {
    await page.goto('/pdf/split');

    const splitBtn = page.locator('button:has-text("PDF 분할")');
    await expect(splitBtn).toBeDisabled();
  });
});
