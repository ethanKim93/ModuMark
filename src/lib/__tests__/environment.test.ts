import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { isTauriApp, getEnvironment } from '../environment';

describe('environment', () => {
  describe('isTauriApp', () => {
    it('window.__TAURI__ 없으면 false를 반환한다', () => {
      expect(isTauriApp()).toBe(false);
    });

    it('window.__TAURI__ 존재 시 true를 반환한다', () => {
      (window as unknown as { [k: string]: unknown }).__TAURI__ = {};
      expect(isTauriApp()).toBe(true);
      delete (window as unknown as { [k: string]: unknown }).__TAURI__;
    });

    it('window가 undefined인 환경(SSR)에서 false를 반환한다', () => {
      /* window를 undefined로 모킹 */
      const originalWindow = global.window;
      // @ts-expect-error - SSR 환경 시뮬레이션
      global.window = undefined;
      expect(isTauriApp()).toBe(false);
      global.window = originalWindow;
    });
  });

  describe('getEnvironment', () => {
    it('Tauri 환경이 아니면 "web"을 반환한다', () => {
      expect(getEnvironment()).toBe('web');
    });

    it('Tauri 환경이면 "tauri"를 반환한다', () => {
      (window as unknown as { [k: string]: unknown }).__TAURI__ = {};
      expect(getEnvironment()).toBe('tauri');
      delete (window as unknown as { [k: string]: unknown }).__TAURI__;
    });
  });
});
