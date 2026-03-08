# ModuMark 앱 아이콘

Tauri 빌드에 필요한 아이콘 파일들입니다.

## 필요한 파일

- `32x32.png` — Windows 작은 아이콘
- `128x128.png` — Windows/Linux 중간 아이콘
- `128x128@2x.png` — macOS Retina 아이콘
- `icon.icns` — macOS 아이콘
- `icon.ico` — Windows 아이콘 (다중 크기 포함)

## 생성 방법

1. 256x256 이상의 PNG 소스 이미지 준비
2. `npx @tauri-apps/cli icon <source.png>` 실행
3. 자동으로 모든 크기 파일 생성됨

## 현재 상태

플레이스홀더 상태 — 실제 ModuMark 로고로 교체 필요.
`cargo tauri build` 전에 반드시 실제 아이콘 파일로 교체하세요.
