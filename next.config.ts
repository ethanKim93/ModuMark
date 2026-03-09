import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const isTauriApp = process.env.TAURI_ENV_TARGET_TRIPLE !== undefined;

const nextConfig: NextConfig = {
  // Tauri 빌드 시 정적 HTML 내보내기 활성화
  // 웹 배포(Vercel)에서는 기본 모드 유지
  ...(isTauriApp && { output: 'export' }),

  // 이미지 최적화: Tauri 정적 빌드에서는 비활성화
  ...(isTauriApp && {
    images: {
      unoptimized: true,
    },
  }),

  // Turbopack 명시적 설정 (serwist webpack 플러그인과 공존)
  turbopack: {},
};

// Tauri 빌드(정적 export)나 dev 환경에서는 PWA 서비스 워커 비활성화
// 프로덕션 웹 빌드에서만 PWA 활성화
const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: isTauriApp || process.env.NODE_ENV !== "production",
});

export default withSerwist(nextConfig);
