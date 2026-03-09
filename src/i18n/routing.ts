import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ko', 'en'],
  defaultLocale: 'ko',
  /* 기본 로케일(ko)은 URL prefix 없음: /markdown (ko), /en/markdown (en) */
  localePrefix: 'as-needed',
});
