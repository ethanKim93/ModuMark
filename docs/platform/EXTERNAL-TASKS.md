# Platform 외부/수동 작업 체크리스트

코드 구현만으로 완성할 수 없는 외부 작업 목록입니다.
각 항목을 완료한 뒤 체크박스를 표시하세요.

---

## 1. Google AdSense 심사 신청

**현황**: `.env.local`에 placeholder ID 설정됨 (`ca-pub-placeholder`)
**파일**: `.env.local`, `src/components/ads/AdSlot.tsx`

### 작업 절차

1. [Google AdSense](https://adsense.google.com/) 계정 생성 / 로그인
2. 사이트 URL (`https://modumark.vercel.app`) 등록 후 심사 신청
3. 심사 통과 후 발급된 실제 pub ID 확인 (예: `ca-pub-1234567890123456`)
4. `.env.local` 업데이트:
   ```
   NEXT_PUBLIC_ADSENSE_ID=ca-pub-1234567890123456
   ```
5. Vercel 환경변수에도 동일하게 등록 (Production 환경)
6. 배포 후 `AdSlot.tsx`의 `isPlaceholder` 분기가 해제되는지 확인

### 확인 사항

- `src/components/ads/AdSlot.tsx` — `isPlaceholder` 조건: `!adsenseId || adsenseId === 'ca-pub-placeholder'`
- `src/app/layout.tsx` — AdSense Script 삽입 위치 확인
- Tauri 앱에서는 광고 자동 숨김 (`isTauri` 분기)

---

## 2. Windows 코드 서명 인증서

**현황**: `tauri.conf.json`의 `certificateThumbprint: null` (미설정)
**파일**: `.github/workflows/release.yml`, `src-tauri/tauri.conf.json`

### 작업 절차

1. EV(Extended Validation) 또는 OV(Organization Validation) 인증서 구매
   - 권장 업체: DigiCert, Sectigo, GlobalSign
   - EV 인증서 권장 (SmartScreen 경고 즉시 해소)
2. 발급된 인증서를 PFX 형식으로 내보내기
3. PFX 파일을 Base64로 인코딩:
   ```powershell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("certificate.pfx")) | clip
   ```
4. GitHub Secrets 등록 (저장소 → Settings → Secrets → Actions):
   - `WINDOWS_CERTIFICATE` — Base64 인코딩된 PFX 내용
   - `WINDOWS_CERTIFICATE_PASSWORD` — PFX 비밀번호
5. `src-tauri/tauri.conf.json` 업데이트:
   ```json
   "windows": {
     "certificateThumbprint": "<인증서 지문(thumbprint)>",
     "digestAlgorithm": "sha256",
     "timestampUrl": "http://timestamp.digicert.com"
   }
   ```

### release.yml 관련 시크릿

```yaml
# 이미 설정된 워크플로우 — Secrets만 GitHub에 등록하면 동작
WINDOWS_CERTIFICATE          # PFX Base64
WINDOWS_CERTIFICATE_PASSWORD # PFX 비밀번호
```

---

## 3. Tauri 자동 업데이터 키 생성

**현황**: `tauri.conf.json`의 `pubkey: ""` (미설정)
**파일**: `.github/workflows/release.yml`, `src-tauri/tauri.conf.json`

### 작업 절차

1. 키 쌍 생성 (1회만 실행):
   ```bash
   npx @tauri-apps/cli signer generate -w ~/.tauri/modumark.key
   ```
   → `~/.tauri/modumark.key` (개인키), `~/.tauri/modumark.key.pub` (공개키) 생성

2. 공개키를 `tauri.conf.json`에 등록:
   ```json
   "plugins": {
     "updater": {
       "pubkey": "<modumark.key.pub 파일 내용 전체>",
       "endpoints": [
         "https://github.com/modumark/modumark/releases/latest/download/latest.json"
       ]
     }
   }
   ```

3. GitHub Secrets 등록:
   - `TAURI_SIGNING_PRIVATE_KEY` — 개인키 파일 내용 전체
   - `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` — 키 생성 시 입력한 비밀번호

4. `latest.json` 업데이트 서버 구성 (GitHub Releases 사용 시 자동):
   - 릴리즈 시 `.sig` 파일이 자동 생성되어 업데이터가 서명 검증

### 주의

- 개인키는 절대 저장소에 커밋하지 않음
- 키를 분실하면 기존 설치본에서 자동 업데이트 불가 — 안전하게 백업 필수

---

## 4. 앱 아이콘 디자인 및 생성

**현황**: `src-tauri/icons/`에 기본 Tauri 아이콘 존재 (교체 필요)
**파일**: `src-tauri/icons/`, `src-tauri/tauri.conf.json`

### 작업 절차

1. 1024×1024 px PNG 마스터 아이콘 디자인 (`icon.png`)
   - 배경: `#1773CF` (Primary 컬러) 권장
   - 모서리: 둥근 사각형 (Squircle) 형태
   - 여백(safe zone): 아이콘 크기의 10%

2. 다중 해상도 자동 생성:
   ```bash
   npx @tauri-apps/cli icon src-tauri/icons/icon.png
   ```
   → `32x32.png`, `128x128.png`, `128x128@2x.png`, `icon.ico`, `icon.icns` 자동 생성

3. `tauri.conf.json` 아이콘 경로 확인 (이미 설정됨):
   ```json
   "icon": [
     "icons/32x32.png",
     "icons/128x128.png",
     "icons/128x128@2x.png",
     "icons/icon.icns",
     "icons/icon.ico"
   ]
   ```

---

## 5. PWA 아이콘 생성

**현황**: `public/manifest.json`에 아이콘 경로 등록됨, 실제 파일 미생성
**파일**: `public/manifest.json`, `public/icons/` (디렉토리 생성 필요)

### manifest.json 요구 아이콘

```json
"/icons/icon-192x192.png"  // 192×192 px
"/icons/icon-512x512.png"  // 512×512 px
```

### 작업 절차

1. `public/icons/` 디렉토리 생성:
   ```bash
   mkdir -p public/icons
   ```

2. 마스터 아이콘(1024×1024)에서 리사이즈:
   ```bash
   # sharp-cli 사용
   npx sharp-cli --input icon-master.png --output public/icons/icon-192x192.png resize 192 192
   npx sharp-cli --input icon-master.png --output public/icons/icon-512x512.png resize 512 512
   ```
   또는 [Favicon Generator](https://realfavicongenerator.net/) 등 온라인 도구 활용

3. `purpose: "maskable any"` 요건 충족:
   - 아이콘 주요 콘텐츠가 중앙 80% 영역(safe zone) 안에 위치해야 함
   - [Maskable App](https://maskable.app/) 에서 미리보기 확인

4. `src/app/sw.ts` 또는 Service Worker에서 아이콘 캐시 경로 포함 여부 확인

---

## 6. GitHub 저장소 URL 확인

**현황**: `tauri.conf.json`에 `modumark/modumark` 경로 하드코딩
**파일**: `src-tauri/tauri.conf.json`, `.github/workflows/release.yml`

### 확인 대상

| 파일 | 위치 | 현재 값 | 확인 필요 |
|------|------|---------|----------|
| `src-tauri/tauri.conf.json` | `plugins.updater.endpoints` | `https://github.com/modumark/modumark/releases/latest/download/latest.json` | 실제 저장소 주소와 일치 여부 |
| `.github/workflows/release.yml` | `softprops/action-gh-release` | (자동) | GITHUB_TOKEN 권한 확인 |

### 작업 절차

1. 실제 GitHub 저장소 URL 확인 (예: `https://github.com/{owner}/{repo}`)
2. `tauri.conf.json` 업데이터 엔드포인트 수정:
   ```json
   "endpoints": [
     "https://github.com/{owner}/{repo}/releases/latest/download/latest.json"
   ]
   ```
3. 첫 릴리즈 태그 생성 후 GitHub Actions 워크플로우 동작 확인:
   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```

---

## 7. docs/README.md 현황 업데이트

**현황**: Phase 현황 표가 Phase 2A를 "진행 예정"으로 표시 (실제 완료)
**파일**: `docs/README.md`

### 작업 절차

`docs/README.md`의 Phase 현황 표를 실제 구현 상태로 업데이트:

```markdown
| Phase | 상태 | 도메인 |
|-------|------|--------|
| Phase 1   | ✅ 완료 | Markdown, PDF, Platform, Monetization |
| Phase 2A  | ✅ 완료 | PDF (OCR·압축·뷰어 개선), Markdown (편집기 완성도) |
| Phase 2B  | ✅ 완료 | Platform (PWA, Tauri 데스크탑, 세션 백업, 스토리지 경고) |
| Phase 3   | ⏳ 대기 | Markdown (LaTeX, 파일 트리), PDF (고급 변환) |
```

---

## 요약

| # | 작업 | 우선순위 | 비고 |
|---|------|---------|------|
| 1 | Google AdSense 심사 신청 | 높음 | 수익화 핵심 |
| 2 | Windows 코드 서명 인증서 | 높음 | SmartScreen 경고 해소 |
| 3 | Tauri 자동 업데이터 키 생성 | 높음 | 배포 전 필수 |
| 4 | 앱 아이콘 디자인 및 생성 | 중간 | 브랜드 완성도 |
| 5 | PWA 아이콘 생성 | 중간 | `public/icons/` 디렉토리 생성 필요 |
| 6 | GitHub 저장소 URL 확인 | 낮음 | 저장소 생성 후 1회 확인 |
| 7 | docs/README.md 현황 업데이트 | 낮음 | 문서 정확성 유지 |
