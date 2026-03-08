import type { NextConfig } from "next";

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
};

export default nextConfig;
