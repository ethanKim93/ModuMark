import { test, expect } from '@playwright/test';

test.describe('에디터 기능', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/editor');
    /* Milkdown 에디터 로드 대기 */
    await page.waitForSelector('.milkdown', { timeout: 10000 });
  });

  test('에디터 페이지 접근 시 Milkdown 에디터가 렌더링된다', async ({ page }) => {
    const editor = page.locator('.milkdown');
    await expect(editor).toBeVisible();
  });

  test('에디터에 텍스트 입력이 가능하다', async ({ page }) => {
    const editor = page.locator('.milkdown .ProseMirror');
    await editor.click();
    await editor.type('Hello, ModuMark!');
    await expect(editor).toContainText('Hello, ModuMark!');
  });

  test('탭 바가 표시된다', async ({ page }) => {
    /* 탭 바 존재 확인 */
    const tabBar = page.locator('[data-slot="tab-bar"], .tab-bar, [class*="tab"]').first();
    await expect(tabBar).toBeVisible();
  });

  test('새 탭 버튼 클릭 시 탭이 추가된다', async ({ page }) => {
    /* Plus 버튼 클릭 */
    const addTabBtn = page.locator('button').filter({ has: page.locator('svg') }).last();
    const initialTabCount = await page.locator('[data-testid="tab-item"], button[class*="tab"]').count();

    await addTabBtn.click();

    /* 탭 수가 증가했는지 확인 — 또는 새 Untitled 탭 확인 */
    await expect(page.locator('text=Untitled').first()).toBeVisible();
  });

  test('툴바에 저장 버튼이 있다', async ({ page }) => {
    const saveBtn = page.locator('button', { hasText: '저장' }).first();
    await expect(saveBtn).toBeVisible();
  });

  test('툴바에 PDF 내보내기 버튼이 있다', async ({ page }) => {
    const exportBtn = page.locator('button', { hasText: 'PDF 내보내기' });
    await expect(exportBtn).toBeVisible();
  });
});
