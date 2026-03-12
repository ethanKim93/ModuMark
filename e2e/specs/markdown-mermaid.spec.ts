import { test, expect } from '@playwright/test';

test.describe('Mermaid 다이어그램 렌더링', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/markdown');
    /* Milkdown 에디터 로드 대기 */
    await page.waitForSelector('.milkdown', { timeout: 10000 });
  });

  test('```mermaid 코드 블록 입력 시 mermaid-container가 DOM에 생성된다', async ({ page }) => {
    const editor = page.locator('.milkdown .ProseMirror');
    await editor.click();

    /* Raw 모드로 전환하여 mermaid 코드 블록 입력 */
    const rawToggle = page.locator('button').filter({ hasText: /raw/i }).first();
    if (await rawToggle.isVisible()) {
      await rawToggle.click();
      const textarea = page.locator('textarea');
      await textarea.fill('```mermaid\nflowchart TD\n  A[시작] --> B[종료]\n```');
      /* WYSIWYG 모드로 복귀 */
      await rawToggle.click();
    }

    /* mermaid 컨테이너 존재 확인 */
    const mermaidContainer = page.locator('[data-mermaid="true"]');
    await expect(mermaidContainer).toBeAttached({ timeout: 5000 });
  });

  test('mermaid-container 내에 SVG 또는 렌더링 영역이 존재한다', async ({ page }) => {
    const editor = page.locator('.milkdown .ProseMirror');
    await editor.click();

    const rawToggle = page.locator('button').filter({ hasText: /raw/i }).first();
    if (await rawToggle.isVisible()) {
      await rawToggle.click();
      const textarea = page.locator('textarea');
      await textarea.fill('```mermaid\nflowchart LR\n  A --> B --> C\n```');
      await rawToggle.click();
    }

    /* mermaid-svg-wrapper가 존재하는지 확인 */
    const svgWrapper = page.locator('.mermaid-svg-wrapper');
    await expect(svgWrapper).toBeAttached({ timeout: 5000 });
  });
});
