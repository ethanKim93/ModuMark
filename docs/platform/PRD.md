# Platform 도메인 PRD
# ModuMark - 플랫폼 제품 요구사항

| 항목 | 내용 |
|------|------|
| 문서 버전 | v2.2 |
| 작성일 | 2026-03-07 |
| 상위 문서 | [docs/PRD.md](../PRD.md) · [docs/platform/BRD.md](./BRD.md) |
| 상태 | Active (Phase 1 완료) |

---

## 목차

1. [기술 선정](#1-기술-선정)
2. [기능 요구사항 (MoSCoW)](#2-기능-요구사항-moscow)
3. [사용자 스토리](#3-사용자-스토리)
4. [SEO 구현 상세](#4-seo-구현-상세)
5. [비기능 요구사항](#5-비기능-요구사항)
6. [배포 전략](#6-배포-전략)

---

## 1. 기술 선정

### 1.1 Next.js 16.1.6 (App Router)

> **실제 설치 버전**: `create-next-app@latest` 결과 Next.js 16.1.6 설치됨. (문서 초안의 v15와 다름)

**선택 근거**:
- **SEO 필수**: React Server Components(RSC)로 서버 사이드 렌더링. 검색 엔진 크롤러가 완전한 HTML 수신 → Google AdSense 승인 조건 충족
- App Router의 Metadata API로 페이지별 title, description, OG 태그 관리 용이
- Vercel 무료 티어와 최적화 통합. 자동 CDN, Edge Network
- 동적 라우팅으로 향후 기능 확장 용이

**실제 기술 스택 (Phase 1 구현 완료)**:
- **shadcn/ui v4** + `@base-ui/react` (Radix UI 아님)
- **Tailwind CSS v4** CSS-first 설정 (`@theme inline` in globals.css, `tailwind.config.ts` 없음)
- **next-themes**: 다크/라이트/시스템 테마 전환 (`ThemeProvider.tsx`, `ThemeToggle.tsx`)

### 1.2 Tauri 2.0 (데스크탑 앱)

**선택 근거**:
- **경량 번들**: Rust 기반 네이티브 코어 + WebView2. Electron 대비 설치 파일 크기 ~10배 작음 (Electron ~100MB vs Tauri ~10-15MB)
- **보안 강화**: 최소 권한 원칙. FS, Dialog 등 Tauri 플러그인을 명시적으로 활성화
- Next.js 16.1.6 웹앱을 WebView로 직접 실행 → 웹/앱 코드 재사용
- Windows 파일 연결(.md/.pdf 기본 앱) 등록 지원 + 파일 타입별 자동 라우팅
- 자동 업데이터 플러그인 내장

**검증 필요 사항**: Tauri 2.0 + Next.js 16.1.6 App Router 통합 PoC (SSR 비활성화, 정적 export 또는 standalone 모드).

**대안 (Electron)**: Tauri PoC 실패 시. Next.js와의 통합 레퍼런스 다수. 번들 크기 큰 것이 단점.

### 1.3 레이아웃 컴포넌트 (Phase 1 구현 완료)

| 컴포넌트 | 역할 |
|----------|------|
| `AppShell.tsx` | 전체 레이아웃 래퍼 (사이드바 + 메인 영역) |
| `AppHeader.tsx` | 상단 헤더 (탭바 포함) |
| `TabBar.tsx` | 탭 기반 다중 문서 관리 |
| `PdfSidebar.tsx` | PDF 도구 전용 사이드바 |
| `ThemeToggle.tsx` | 다크/라이트/시스템 테마 전환 |
| `ThemeProvider.tsx` | next-themes 기반 테마 프로바이더 |
| `LandingHeader.tsx` | 랜딩 페이지 전용 헤더 (ThemeToggle 포함, 클라이언트 컴포넌트) |

### 1.3 Vercel (웹 배포)

- Next.js 공식 배포 플랫폼. 무료 티어로 MAU 10,000명 수준 지원 가능
- 자동 CI/CD (Git push → 자동 빌드·배포)
- Edge Network CDN으로 전 세계 빠른 응답
- Analytics, Speed Insights 내장

---

## 2. 기능 요구사항 (MoSCoW)

### Must Have

| 기능 ID | 기능 | 설명 |
|---------|------|------|
| PL-M1 | Next.js 웹 앱 배포 | Vercel 무료 티어에 Next.js 16.1.6 App Router 앱 배포 ✅ Phase 1 완료 |
| PL-M2 | SEO 기본 구조 | 공개 페이지 SSR/SSG, 페이지별 고유 메타태그 |
| PL-M3 | sitemap.xml | 자동 생성·제공. 모든 공개 페이지 포함 |
| PL-M4 | robots.txt | 검색 엔진 크롤링 허용 설정 |
| PL-M5 | OG 태그 | Facebook/카카오 공유 시 미리보기 이미지·제목·설명 |
| PL-M6 | 반응형 레이아웃 | 375px(모바일) ~ 1440px(데스크탑) 대응 |
| PL-M7 | 공개 소개 페이지 | 서비스 소개, 기능 설명, 사용법 가이드 (AdSense 승인용 콘텐츠) |

### Should Have

| 기능 ID | 기능 | 설명 |
|---------|------|------|
| PL-S1 | Windows 데스크탑 앱 | Tauri 2.0 기반 .exe/.msi 설치 파일 |
| PL-S2 | 코드 서명 | Windows SmartScreen 경고 방지 |
| PL-S3 | .md/.pdf 파일 연결 | Windows에서 .md 파일 더블클릭 → `/markdown` 에디터 실행, .pdf 파일 더블클릭 → `/pdf` 뷰어 실행. 파일 타입별 자동 라우팅 |
| PL-S9 | 파일 타입별 자동 라우팅 | 파일 연결로 열린 파일의 타입(.md → markdown, .pdf → pdf)에 따라 올바른 페이지로 자동 이동. `?openFile=` 쿼리 파라미터 활용 |
| PL-S4 | 구조화 데이터 | SoftwareApplication Schema.org JSON-LD |
| PL-S5 | 다크 모드 지원 | 시스템 설정 연동 + 수동 전환. **랜딩 페이지 포함 모든 페이지에서 테마 토글 제공** ✅ Phase 1 구현 완료 (next-themes, ThemeToggle.tsx), 랜딩 페이지 Phase 2A 보완 예정 |
| PL-S6 | 보안 안내 페이지 | "파일이 서버에 전송되지 않습니다" 명시적 안내 |
| PL-S7 | 세션 백업 인프라 (Tauri 앱 전용) | Tauri `app_data_dir()` API로 백업 디렉토리 접근. `{APP_DATA_DIR}/backup/` 경로에 `session.json` + `tab_{uuid}.md.bak` 파일 관리. Tauri FS 플러그인 사용. PROPOSAL-005 채택 |
| PL-S8 | 앱 다운로드 안내 시스템 | 웹 환경 IndexedDB 50MB 소프트 한도 초과 시 표시하는 앱 다운로드 안내 UI. 다운로드 페이지(`/download`)로 연결하는 CTA 포함 다이얼로그. PROPOSAL-005 채택 |

### Could Have

| 기능 ID | 기능 | 설명 |
|---------|------|------|
| PL-C1 | 자동 업데이터 | 새 버전 감지 → 사용자 동의 후 설치 (Tauri updater) |
| PL-C2 | 창 상태 저장 | 창 크기·위치 저장·복원 |
| PL-C3 | 앱 설정 페이지 | 테마, 언어, 자동 저장 간격 설정 |
| PL-C4 | PWA | Phase 2 이후 검토 |

---

## 3. 사용자 스토리

| ID | 스토리 | 수용 기준 |
|----|--------|----------|
| US-PL-01 | 나는 설치 없이 웹 브라우저에서 즉시 ModuMark를 사용하고 싶다 | 웹 URL 접속 후 2초 이내 에디터 사용 가능. 설치나 로그인 불필요 |
| US-PL-02 | 나는 Google에서 "무료 마크다운 에디터"를 검색하여 ModuMark를 찾고 싶다 | 핵심 키워드로 Google 검색 30위 이내 노출 (출시 6개월) |
| US-PL-03 | 나는 Windows에서 .md 또는 .pdf 파일을 더블클릭하여 ModuMark가 자동으로 열리게 하고 싶다 | 앱 설치 후 .md/.pdf 파일 연결 등록 옵션 제공. 더블클릭 시 파일 타입에 따라 올바른 페이지에서 ModuMark 실행 |
| US-PL-04 | 나는 보안 담당자로서 ModuMark가 파일을 서버에 보내지 않는다는 것을 공식 문서에서 확인하고 싶다 | 소개 페이지 및 개인정보 처리방침에 "모든 파일 처리는 로컬에서 수행됩니다" 명시 |
| US-PL-05 | 나는 앱을 설치할 때 바이러스 경고 없이 안전하게 설치하고 싶다 | 코드 서명된 .exe/.msi 설치 파일 제공. Windows SmartScreen 경고 없음 |
| US-PL-06 | 나는 첫 방문 시(랜딩 페이지) 다크/라이트 모드를 전환하고 싶다 | 랜딩 페이지 우측 상단에 ThemeToggle 버튼 표시. 다크 → 라이트 → 시스템 순환 동작. 페이지 이동 후에도 설정 유지 |
| US-PL-07 | 나는 Windows에서 .pdf 파일을 더블클릭하여 ModuMark PDF 뷰어로 열고 싶다 | 앱 설치 후 .pdf 파일을 더블클릭하면 ModuMark `/pdf` 뷰어 페이지에서 해당 파일이 자동으로 열림 |

---

## 4. SEO 구현 상세

### 4.1 페이지별 메타데이터 전략

| 페이지 | title | description | 타겟 키워드 |
|--------|-------|-------------|-----------|
| 메인 (/) | ModuMark - 무료 마크다운 편집기 + PDF 도구 | 무료로 마크다운 WYSIWYG 편집과 PDF 병합·분할·OCR을 하나의 앱에서. 설치 없이 웹에서 즉시 사용 | 무료 마크다운 에디터, 타이포라 대안 |
| 에디터 (/editor) | 마크다운 에디터 - ModuMark | 실시간 WYSIWYG 마크다운 편집기. 타이포라처럼 직관적인 무료 편집 경험 | 마크다운 WYSIWYG, 무료 마크다운 편집기 |
| PDF 기능 (/pdf) | PDF 병합·분할·OCR 무료 - ModuMark | 파일이 서버에 업로드되지 않는 안전한 PDF 도구. 병합, 분할, OCR을 무료로 | PDF 병합 무료, PDF 분할 무료, PDF OCR |
| 다운로드 (/download) | Windows 앱 다운로드 - ModuMark | ModuMark Windows 데스크탑 앱 무료 다운로드. 오프라인 사용 가능 | 마크다운 편집기 다운로드, 무료 PDF 편집기 |

### 4.2 Next.js Metadata API 구현

```typescript
// app/layout.tsx - 기본 메타데이터
export const metadata: Metadata = {
  title: {
    default: 'ModuMark - 무료 마크다운 편집기 + PDF 도구',
    template: '%s - ModuMark',
  },
  description: '무료로 마크다운 WYSIWYG 편집과 PDF 병합·분할·OCR을 하나의 앱에서.',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: 'ModuMark',
  },
}

// app/pdf/page.tsx - 페이지별 메타데이터 오버라이드
export const metadata: Metadata = {
  title: 'PDF 병합·분할·OCR 무료',
  description: '파일이 서버에 업로드되지 않는 안전한 PDF 도구...',
}
```

### 4.3 구조화 데이터

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "ModuMark",
  "applicationCategory": "ProductivityApplication",
  "operatingSystem": "Windows, Web",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "KRW" },
  "description": "무료 마크다운 WYSIWYG 편집기 + PDF 도구"
}
```

### 4.4 Core Web Vitals 최적화 전략

| 지표 | 목표 | 구현 전략 |
|------|------|----------|
| LCP | ≤ 2.5s | Next.js Image 컴포넌트, 폰트 최적화, 중요 CSS 인라인 |
| FID/INP | ≤ 100ms | React Server Components로 클라이언트 JS 최소화, 코드 스플리팅 |
| CLS | ≤ 0.1 | 이미지·광고 슬롯에 명시적 크기 지정, 폰트 폴백 최소화 |

---

## 5. 비기능 요구사항

### 5.1 성능

| 요구사항 | 목표 |
|---------|------|
| 웹 초기 로드 (LCP) | 2.5초 이하 |
| Lighthouse SEO 점수 | 90점 이상 |
| Lighthouse Performance 점수 | 80점 이상 |

### 5.2 보안

| 요구사항 | 구현 |
|---------|------|
| HTTPS 강제 | Vercel 기본 제공. HSTS 헤더 설정 |
| CSP 헤더 | XSS 방지. AdSense, Tesseract.js CDN 등 허용 도메인 명시 |
| **로컬 우선 아키텍처** | 파일 처리가 클라이언트에서 수행됨을 서비스 설명·개인정보처리방침에 명시 |
| Tauri 최소 권한 | `tauri.conf.json`의 permissions 설정. fs, dialog 등 필요 권한만 활성화 |

### 5.3 SEO

| 요구사항 | 목표 |
|---------|------|
| 오가닉 검색 MAU | 3,000명/월 (출시 6개월) |
| 핵심 키워드 Google 순위 | 3개 이상 30위 이내 (출시 6개월) |
| Search Console 월 노출수 | 10,000회 이상 (출시 3개월) |

---

## 6. 배포 전략

### 6.1 웹 배포 (Vercel)

```
개발 → GitHub main 브랜치 push
    ↓
Vercel 자동 빌드·배포 (CI/CD)
    ↓
Preview URL 생성 (PR별)
    ↓
main merge → 프로덕션 배포
```

### 6.2 데스크탑 앱 배포 (GitHub Releases)

```
태그 push (예: v1.0.0)
    ↓
GitHub Actions: tauri-action으로 Windows 빌드
    ↓
코드 서명 (GitHub Secrets에 인증서 저장)
    ↓
GitHub Releases에 .exe/.msi 파일 업로드
    ↓
웹 다운로드 페이지에서 링크 제공
```

### 6.3 버전 관리 전략

- **Semantic Versioning** (MAJOR.MINOR.PATCH)
- MAJOR: 하위 호환성 깨는 변경
- MINOR: 새 기능 추가 (하위 호환)
- PATCH: 버그 수정

---

## 문서 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| v1.0 | 2026-03-07 | 초안 작성 | 프로젝트 오너 |
| v1.1 | 2026-03-07 | PROPOSAL-005 채택: PL-S7 (세션 백업 인프라), PL-S8 (앱 다운로드 안내 시스템) Should Have 추가 | 프로젝트 오너 |
| v2.0 | 2026-03-08 | Phase 1 완료 반영: Next.js 16.1.6 기재, shadcn v4+@base-ui/react, Tailwind v4 CSS-first, next-themes 테마 전환(PL-S5) Phase 1 완료 표시, 레이아웃 컴포넌트 목록 현행화(AppShell, AppHeader, TabBar, PdfSidebar, ThemeToggle, ThemeProvider) | 프로젝트 오너 |
| v2.1 | 2026-03-09 | PL-S5 설명 보강: 랜딩 페이지 포함 전체 페이지 테마 토글. LandingHeader.tsx 추가. US-PL-06 추가: 랜딩 페이지 테마 전환 사용자 스토리 | 프로젝트 오너 |
| v2.2 | 2026-03-09 | PL-S3 확장: `.md/.pdf 파일 연결` + 파일 타입별 라우팅. PL-S9 신규: 파일 타입별 자동 라우팅. US-PL-03 확장: `.md 또는 .pdf 파일`. US-PL-07 신규: .pdf 파일 → PDF 뷰어. Tauri 설명 `.md/.pdf 파일 연결`로 변경 | 프로젝트 오너 |
