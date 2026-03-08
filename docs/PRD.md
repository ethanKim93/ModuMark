# PRD (Product Requirements Document)
# ModuMark - 제품 요구사항 정의서

| 항목 | 내용 |
|------|------|
| 문서 버전 | v2.0 |
| 작성일 | 2026-03-07 |
| 최종 수정 | 2026-03-08 |
| 상위 문서 | [docs/BRD.md](./BRD.md) |
| 상태 | Active (Phase 1 완료, Phase 2A/2B 진행 예정) |

---

## 목차

1. [제품 개요](#1-제품-개요)
2. [기술 스택 선정](#2-기술-스택-선정)
3. [사용자 스토리 맵](#3-사용자-스토리-맵)
4. [전체 기능 목록 (MoSCoW)](#4-전체-기능-목록-moscow)
5. [비기능 요구사항](#5-비기능-요구사항)
6. [도메인별 PRD 연계](#6-도메인별-prd-연계)

---

## 1. 제품 개요

### 1.1 제품 비전

**ModuMark**는 마크다운 WYSIWYG 편집과 PDF 처리를 하나의 앱에서 무료로 제공하는 통합 문서 도구이다. Windows 데스크탑 앱과 웹 서비스를 동시에 제공하며, 모든 파일 처리는 로컬에서 수행되어 기업 보안 정책도 준수한다.

### 1.2 핵심 차별점 요약

| 차별점 | 설명 | 대상 경쟁 제품 |
|--------|------|--------------|
| 무료 WYSIWYG 편집 | Typora 수준의 편집 경험을 무료로 | Typora ($14.99) |
| 마크다운 + PDF 통합 | 두 가지 기능을 하나의 앱에서 | 알PDF + 별도 에디터 |
| 로컬 우선·보안 | 파일이 외부 서버에 전송되지 않음 | iLovePDF, Smallpdf (서버 업로드) |
| 탭 기반 다중 문서 | 여러 문서를 탭으로 동시 관리 | 단일 창 에디터 대비 |

---

## 2. 기술 스택 선정

### 2.1 프론트엔드 / 웹

| 기술 | 실제 버전 | 선택 근거 |
|------|----------|----------|
| **Next.js (App Router)** | **16.1.6** | SSR/SSG로 SEO 최적화 필수. React Server Components로 초기 로딩 성능 향상. Vercel 무료 배포와 완벽 통합 |
| **React** | **19.2.3** | Concurrent Features로 에디터 렌더링 성능 향상 |
| **TypeScript** | 최신 | 타입 안전성으로 에디터·PDF 처리 같은 복잡한 상태 관리 안정화 |
| **Tailwind CSS v4** | **v4 (CSS-first)** | `tailwind.config.ts` 없음, `globals.css`의 `@theme inline` 블록에서 CSS 변수 직접 매핑. 커스텀 다크 변형: `@custom-variant dark (&:is(.dark *))` |
| **shadcn/ui v4** | **v4 + @base-ui/react** | Radix UI 아님 — `@base-ui/react` 사용. `Dialog` 등 컴포넌트 API 차이 있음 |
| **Zustand** | **5.0.11** | 경량 상태 관리. 탭 상태(tabStore), PDF 파일 상태(pdfFileStore) 등 관리 |
| **next-themes** | 최신 | 다크/라이트/시스템 테마 전환. `attribute="class"`, `defaultTheme="dark"` |
| **lucide-react** | 최신 | 아이콘 라이브러리 |
| **@dnd-kit** | 최신 | PDF 썸네일 드래그 정렬 (`@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities`) |

### 2.2 에디터

| 기술 | 선택 근거 |
|------|----------|
| **Milkdown** | ProseMirror 기반 WYSIWYG 마크다운 에디터. 마크다운 호환성 최고 수준. 플러그인 아키텍처로 확장 가능. Typora 수준의 편집 경험 구현 가능 |
| **대안 (TipTap)** | Milkdown 품질 미달 시 대안. ProseMirror 기반, 더 큰 커뮤니티. 마크다운 완전 호환은 추가 플러그인 필요 |

### 2.3 PDF 처리

| 기술 | 선택 근거 |
|------|----------|
| **pdf-lib** | 순수 JavaScript PDF 생성·편집 라이브러리. 서버 의존 없이 클라이언트에서 병합·분할·생성 가능. 보안 원칙(로컬 처리) 완벽 충족 |
| **PDF.js (Mozilla)** | PDF 렌더링 뷰어. 브라우저 네이티브에 가까운 렌더링 품질. Mozilla 재단 관리로 안정적 |
| **Tesseract.js** | WebAssembly 기반 OCR 엔진. 브라우저에서 직접 실행되어 서버 전송 없음. 한국어 언어팩 지원 |

### 2.4 데스크탑 앱

| 기술 | 선택 근거 |
|------|----------|
| **Tauri 2.0** | Rust 기반 경량 데스크탑 프레임워크. Electron 대비 번들 크기 ~10배 작음. 네이티브 파일 시스템 API. WebView2 기반으로 Next.js 웹앱을 그대로 활용 가능 |
| **대안 (Electron)** | Tauri 통합 PoC 실패 시 대안. 더 큰 생태계, Next.js 통합 레퍼런스 풍부. 번들 크기 큰 것이 단점 |

### 2.5 배포 인프라

| 기술 | 선택 근거 |
|------|----------|
| **Vercel** | Next.js 최적화 플랫폼. 무료 티어로 초기 트래픽 수용. 자동 CI/CD, Edge Network CDN |
| **GitHub Actions** | 데스크탑 앱 빌드·배포 자동화. Tauri 빌드 워크플로우 공식 지원 |

---

## 3. 사용자 스토리 맵

```
[사용자 활동]     편집 시작       문서 관리          PDF 작업          공유·완료
                     │               │                  │                │
[사용자 태스크]  앱 실행·접근    파일 열기·저장       PDF 처리         변환·저장
                 새 문서 작성    탭 관리             뷰어·병합·분할   내보내기
                 WYSIWYG 편집   자동저장             OCR             다운로드
                     │               │                  │                │
[스토리 (웹)]   웹 접속 즉시    File System API     클라이언트 PDF   PDF 다운로드
                 편집 시작       로컬 파일 열기       처리(pdf-lib)    저장
                     │               │                  │                │
[스토리 (앱)]   .md 더블클릭    Tauri FS API        Tesseract.js    파일 시스템
                 자동 실행       네이티브 저장        OCR (로컬)      직접 저장
```

---

## 4. 전체 기능 목록 (MoSCoW)

### Must Have (MVP 필수)

| 기능 | 도메인 | 설명 |
|------|--------|------|
| WYSIWYG 마크다운 편집 | Editor | Milkdown 기반 실시간 렌더링 편집 |
| 마크다운 기본 요소 지원 | Editor | 헤딩, 굵게, 기울임, 코드, 표, 리스트, 링크 |
| .md 파일 열기·저장 | Editor | 로컬 파일 시스템 접근 (웹: File API, 앱: Tauri FS) |
| **탭 기반 다중 문서** | Editor | 새 문서/파일이 탭으로 열림, 탭 전환·닫기 |
| 자동 저장 (30초) | Editor | 변경 감지 후 자동 저장 |
| PDF 뷰어 | PDF | PDF.js 기반 렌더링·페이지 이동 |
| 마크다운 → PDF 변환 | PDF | 현재 문서를 PDF로 변환·다운로드 |
| PDF 병합 | PDF | 여러 PDF를 하나로 합치기 |
| PDF 분할 | PDF | 페이지 범위 추출하여 새 PDF 생성 |
| SSR/SSG 웹 페이지 | Platform | SEO 최적화 공개 페이지 |
| 메타태그·OG 태그 | Platform | SEO 필수 메타데이터 |
| sitemap.xml / robots.txt | Platform | 검색 엔진 크롤링 최적화 |
| 반응형 레이아웃 | Platform | 375px ~ 1440px 대응 |
| Google AdSense 통합 | Monetization | 광고 슬롯 배치, lazy loading |

### Should Have (Phase 2A/2B 목표)

> **✅ 이미 구현됨**: Phase 1에서 Should Have 일부 선구현 완료

| 기능 | 도메인 | 상태 | 설명 |
|------|--------|------|------|
| **테마 전환 (다크·라이트·시스템)** | Platform | **✅ 구현 완료** | next-themes 기반 3단계 테마 토글. 다크 기본, CSS 변수 기반 |
| PDF 페이지 썸네일 미리보기 | PDF | **✅ 구현 완료** | PdfThumbnailList + dnd-kit 드래그 정렬, 다중 선택 |
| PDF 페이지 추출 | PDF | **✅ 구현 완료** | extractPages.ts, 개별 페이지/범위 추출 |
| Undo/Redo (에디터) | Editor | Phase 2A | 편집 이력 관리 (Milkdown 플러그인) |
| WYSIWYG ↔ Raw 모드 전환 | Editor | Phase 2A | 파워 유저 지원 |
| 키보드 단축키 | Editor | Phase 2A | Ctrl+S, Ctrl+T, Ctrl+W 등 |
| PDF OCR (Tesseract.js) | PDF | Phase 2A | 스캔·이미지 PDF 텍스트 추출 |
| PDF 압축 | PDF | Phase 2A | 파일 크기 감소 |
| Ad Blocker 감지·안내 | Monetization | Phase 2A | 비폭력적 안내 메시지 |
| Windows 데스크탑 앱 | Platform | Phase 2B | Tauri 2.0 + Next.js 16 PoC 선행 |
| .md 파일 기본 앱 등록 | Platform | Phase 2B | Windows 파일 연결 |
| 코드 서명 (Code Signing) | Platform | Phase 2B | SmartScreen 경고 방지 |
| 세션 백업 | Editor | Phase 2B | 앱 재시작 후 탭 복원 (Tauri 전용) |
| 웹 스토리지 한도 경고 | Editor | Phase 2A | IndexedDB 50MB 초과 경고 |
| 구조화 데이터 (Schema.org) | Platform | **✅ 구현 완료** | SoftwareApplication JSON-LD |

### Could Have (Phase 2 검토)

| 기능 | 도메인 | 설명 |
|------|--------|------|
| PDF → 마크다운 변환 | PDF | PDF 텍스트 레이어 추출 |
| 자동 업데이터 | Platform | 새 버전 감지·설치 |
| 광고 A/B 테스트 | Monetization | 배치 최적화 |
| Mermaid 다이어그램 | Editor | Phase 2 검토 |
| 수식 (LaTeX) | Editor | Phase 3 검토 |

### Won't Have (현재 범위 제외)

| 기능 | 제외 이유 |
|------|----------|
| 클라우드 동기화 | 로컬 우선 정책, 백엔드 복잡도 |
| 실시간 협업 | 1인 개발 리소스 초과 |
| 사용자 계정 / 로그인 | 운영 복잡도 |
| macOS / Linux 앱 | 1차 출시 범위 초과 |
| 모바일 앱 | 개발 리소스 부족 |

---

## 5. 비기능 요구사항

### 5.1 성능

| 요구사항 | 목표값 | 측정 방법 |
|---------|--------|----------|
| 초기 페이지 로드 (LCP) | 2.5초 이하 | Lighthouse / CrUX |
| 타이핑 → 렌더링 지연 | P95 100ms 이하 | 브라우저 Performance API |
| PDF 처리 (10MB 이하) | 10초 이내 | 기능 완료 시간 측정 |
| CLS (레이아웃 이동) | 0.1 이하 | Lighthouse / CrUX |

### 5.2 보안

| 요구사항 | 구현 방법 |
|---------|----------|
| **파일 서버 전송 없음** | 모든 파일 처리(편집, PDF, OCR)를 클라이언트에서 수행. Vercel 서버리스 함수에 파일 데이터 미전송 |
| Content Security Policy (CSP) | XSS 방지를 위한 CSP 헤더 설정. AdSense 스크립트 도메인만 허용 |
| 로컬 파일 접근 최소 권한 | 웹: File System Access API (사용자 명시적 허용 필요). 앱: Tauri FS 권한 최소화 |
| 광고-파일 처리 격리 | 광고 스크립트와 파일 처리 로직은 완전히 분리된 컨텍스트에서 실행 |
| HTTPS 강제 | 모든 웹 트래픽 HTTPS, HSTS 설정 |

### 5.3 접근성 (Accessibility)

| 요구사항 | 목표 |
|---------|------|
| WCAG 2.1 Level AA | 색상 대비, 키보드 탐색, 스크린 리더 지원 |
| 키보드 전용 사용 | 마우스 없이 모든 핵심 기능 사용 가능 |
| Focus 관리 | 탭 전환·모달 등에서 포커스 적절히 관리 |

### 5.4 SEO

| 요구사항 | 구현 방법 |
|---------|----------|
| SSR/SSG | Next.js App Router Server Components |
| 고유 메타태그 | 각 페이지별 title, description, OG 태그 |
| sitemap.xml | next-sitemap 또는 App Router 내장 sitemap |
| Core Web Vitals | LCP ≤ 2.5s, FID ≤ 100ms, CLS ≤ 0.1 |
| 구조화 데이터 | SoftwareApplication Schema.org 마크업 |

---

## 6. 도메인별 PRD 연계

| 도메인 | 문서 | 핵심 내용 |
|--------|------|----------|
| Editor | [docs/editor/PRD.md](./editor/PRD.md) | Milkdown WYSIWYG, 탭 기반 다중 문서, 파일 관리 |
| PDF | [docs/pdf/PRD.md](./pdf/PRD.md) | pdf-lib 병합·분할·추출, Tesseract.js OCR, 썸네일, Undo |
| Platform | [docs/platform/PRD.md](./platform/PRD.md) | Next.js 16, Tauri 2.0 (Phase 2B), SEO, AppHeader 레이아웃 |
| Monetization | [docs/monetization/PRD.md](./monetization/PRD.md) | AdSense 통합, FloatingAdSlot, 광고 배치 전략 |

---

## 문서 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| v1.0 | 2026-03-07 | 초안 작성 | 프로젝트 오너 |
| v2.0 | 2026-03-08 | Phase 1 완료 반영: 기술 스택 실제 버전 수정(Next.js 16.1.6, shadcn v4+@base-ui, Tailwind v4), MoSCoW 재분류(이미 구현된 기능 표시), Phase 2 → 2A/2B 분리 반영 | 프로젝트 오너 |

---

*본 문서는 ModuMark 전체 제품 요구사항을 정의합니다. 도메인별 세부 요구사항은 각 도메인 PRD를 참조하세요.*
