import { test, expect } from '@playwright/test';

test.describe('에디터 FloatingAdSlot', () => {
  test('데스크탑에서 광고 플레이스홀더가 표시되고 유지된다', async ({ page }) => {
    // 데스크탑 뷰포트 (lg+ 조건: 1024px 이상)
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/editor');
    await page.waitForSelector('.milkdown', { timeout: 10000 });

    // FloatingAdSlot 내부 ad-placeholder 확인
    const adPlaceholder = page.locator('[data-testid="ad-placeholder"]');
    await expect(adPlaceholder).toBeVisible({ timeout: 5000 });

    // 2초 대기 후에도 여전히 visible (사라지지 않는지 확인)
    await page.waitForTimeout(2000);
    await expect(adPlaceholder).toBeVisible();
  });

  test('모바일에서는 FloatingAdSlot이 숨겨진다', async ({ page }) => {
    // 모바일 뷰포트 (lg 미만: 1024px 이하)
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/editor');
    await page.waitForSelector('.milkdown', { timeout: 10000 });

    // FloatingAdSlot 컨테이너가 hidden lg:block이므로 모바일에서는 숨겨짐
    const floatingContainer = page.locator('.fixed.bottom-4.left-4');
    await expect(floatingContainer).toBeHidden();
  });
});
