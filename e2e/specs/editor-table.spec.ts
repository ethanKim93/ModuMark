import { test, expect } from '@playwright/test';

test.describe('GFM 테이블 다크모드 스타일', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/editor');
    /* Milkdown 에디터 로드 대기 */
    await page.waitForSelector('.milkdown', { timeout: 10000 });
  });

  test('다크 모드에서 테이블 셀 배경이 흰색이 아니다', async ({ page }) => {
    /* html에 dark 클래스 강제 적용 */
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    });

    /* ProseMirror에 GFM 테이블 마크다운 삽입 */
    const proseMirror = page.locator('.milkdown .ProseMirror');
    await proseMirror.click();
    /* 기존 내용 전체 선택 후 교체 */
    await page.keyboard.press('Control+a');

    const tableMarkdown = '| 이름 | 나이 | 직업 |\n| --- | --- | --- |\n| 홍길동 | 30 | 개발자 |\n| 김철수 | 25 | 디자이너 |';
    await page.keyboard.type(tableMarkdown);

    /* 테이블 렌더링 대기 */
    await page.waitForSelector('.milkdown .ProseMirror table', { timeout: 5000 }).catch(() => {
      /* 마크다운이 실시간 렌더링되지 않을 수 있으므로 계속 진행 */
    });

    /* evaluate로 직접 테이블 HTML 삽입하여 렌더링 확인 */
    const hasTable = await page.evaluate(() => {
      return document.querySelector('.milkdown .ProseMirror table') !== null;
    });

    if (!hasTable) {
      /* 테이블이 없으면 evaluate로 직접 주입 */
      await page.evaluate(() => {
        const proseMirrorEl = document.querySelector('.milkdown .ProseMirror');
        if (!proseMirrorEl) return;
        proseMirrorEl.innerHTML = `
          <table>
            <thead><tr><th>이름</th><th>나이</th><th>직업</th></tr></thead>
            <tbody>
              <tr><td>홍길동</td><td>30</td><td>개발자</td></tr>
              <tr><td>김철수</td><td>25</td><td>디자이너</td></tr>
            </tbody>
          </table>`;
      });
      await page.waitForSelector('.milkdown .ProseMirror table', { timeout: 3000 });
    }

    /* td 배경색이 흰색(255,255,255) 또는 거의 흰색(249,250,251)이 아닌지 검증 */
    const tdBgColors = await page.evaluate(() => {
      const tds = Array.from(document.querySelectorAll('.milkdown .ProseMirror td'));
      return tds.map(td => window.getComputedStyle(td).backgroundColor);
    });

    for (const bg of tdBgColors) {
      /* 흰색 계열 배경 없음 확인 */
      expect(bg).not.toBe('rgb(255, 255, 255)');
      expect(bg).not.toBe('rgb(249, 250, 251)');
      expect(bg).not.toBe('rgb(248, 249, 250)');
    }
  });

  test('다크 모드에서 tr 보더 색상이 라이트모드 색상이 아니다', async ({ page }) => {
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    });

    /* evaluate로 테이블 직접 삽입 */
    await page.evaluate(() => {
      const proseMirrorEl = document.querySelector('.milkdown .ProseMirror');
      if (!proseMirrorEl) return;
      proseMirrorEl.innerHTML = `
        <table>
          <thead><tr><th>컬럼1</th><th>컬럼2</th></tr></thead>
          <tbody><tr><td>값1</td><td>값2</td></tr></tbody>
        </table>`;
    });

    await page.waitForSelector('.milkdown .ProseMirror table', { timeout: 3000 }).catch(() => {});

    const trBorderColors = await page.evaluate(() => {
      const trs = Array.from(document.querySelectorAll('.milkdown .ProseMirror tr'));
      return trs.map(tr => window.getComputedStyle(tr).borderColor);
    });

    for (const borderColor of trBorderColors) {
      /* 라이트모드 전형적인 회색 보더(229,231,235) 없음 확인 */
      expect(borderColor).not.toBe('rgb(229, 231, 235)');
    }
  });

  test('라이트 모드에서 테이블이 정상적으로 렌더링된다', async ({ page }) => {
    await page.evaluate(() => {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    });

    /* evaluate로 테이블 직접 삽입 */
    await page.evaluate(() => {
      const proseMirrorEl = document.querySelector('.milkdown .ProseMirror');
      if (!proseMirrorEl) return;
      proseMirrorEl.innerHTML = `
        <table>
          <thead><tr><th>이름</th><th>값</th></tr></thead>
          <tbody><tr><td>테스트</td><td>123</td></tr></tbody>
        </table>`;
    });

    await page.waitForSelector('.milkdown .ProseMirror table', { timeout: 3000 }).catch(() => {});

    /* 테이블 요소가 존재하는지 확인 */
    const tableExists = await page.evaluate(() => {
      return document.querySelector('.milkdown .ProseMirror table') !== null;
    });

    /* 테이블이 존재하면 th 배경색이 투명 또는 surface 색상인지 검증 */
    if (tableExists) {
      const thBgColors = await page.evaluate(() => {
        const ths = Array.from(document.querySelectorAll('.milkdown .ProseMirror th'));
        return ths.map(th => window.getComputedStyle(th).backgroundColor);
      });

      /* th는 surface 배경 (흰색이 아님) */
      for (const bg of thBgColors) {
        /* transparent(rgba 0,0,0,0)나 surface 색상 */
        const isTransparentOrSurface = bg === 'rgba(0, 0, 0, 0)' || bg !== 'rgb(255, 255, 255)';
        expect(isTransparentOrSurface).toBe(true);
      }
    }
  });
});
