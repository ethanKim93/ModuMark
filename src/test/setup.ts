import '@testing-library/jest-dom';

/* jsdom에 없는 브라우저 API 모킹 */
global.IntersectionObserver = class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof IntersectionObserver;
