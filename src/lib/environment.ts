/* 실행 환경 감지 유틸 */

export function isTauriApp(): boolean {
  if (typeof window === 'undefined') return false;
  /* Tauri는 window.__TAURI__ 객체를 주입 */
  return '__TAURI__' in window;
}

export function getEnvironment(): 'tauri' | 'web' {
  return isTauriApp() ? 'tauri' : 'web';
}
