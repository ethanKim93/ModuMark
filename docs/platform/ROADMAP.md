# Platform 도메인 ROADMAP
# ModuMark - 플랫폼 릴리즈 계획

| 항목 | 내용 |
|------|------|
| 문서 버전 | v3.0 |
| 작성일 | 2026-03-10 |
| 상위 문서 | [docs/README.md](../README.md) · [docs/platform/PRD.md](./PRD.md) |
| 상태 | Active (Phase 1 완료) |

---

## Phase 1: Next.js 웹 서비스 + SEO (목표: 최초 출시) ✅ 완료

**목표**: Vercel에 Next.js 16.1.6 기반 웹 서비스를 배포하고, AdSense 승인을 위한 SEO·콘텐츠 기반을 구축한다.

### 기능 범위

| 기능 | 우선순위 | 완료 여부 |
|------|---------|---------|
| Next.js 16.1.6 App Router 웹 앱 | P0 | ✅ 완료 (Vercel 배포) |
| 소개 페이지 (/) | P0 | ✅ 완료 |
| 에디터 페이지 (/editor) | P0 | ✅ 완료 |
| PDF 기능 페이지 (/pdf/merge, /pdf/split) | P0 | ✅ 완료 |
| 메타태그·OG 태그 | P0 | ✅ 완료 |
| sitemap.xml | P0 | ✅ 완료 |
| robots.txt | P0 | ✅ 완료 |
| 반응형 레이아웃 (375px ~ 1440px) | P0 | ✅ 완료 |
| **보안 안내 페이지 (/security)** | P1 | ✅ 완료 |
| 개인정보처리방침 페이지 (/privacy) | P1 | ✅ 완료 |
| 이용약관 페이지 (/terms) | P1 | ✅ 완료 |
| 구조화 데이터 (JSON-LD) | P1 | ✅ 완료 |
| **테마 전환 (다크/라이트/시스템)** | P1 | ✅ 완료 (next-themes, 원래 P2 예정 → Phase 1 선행 구현). 랜딩 페이지 토글 Phase 2 보완 |

### 테스트 기준

| 테스트 유형 | 범위 | 성공 기준 |
|-----------|------|----------|
| **단위 테스트** | Metadata 생성 함수: 각 페이지별 title/description 값 정확성 | 각 페이지 메타데이터가 BRD 정의 값과 일치 |
| **단위 테스트** | sitemap.xml 생성: 모든 공개 페이지 URL 포함 여부 | sitemap에 /, /editor, /pdf, /download 등 모든 공개 경로 포함 |
| **통합 테스트** | SSR 렌더링: 각 페이지가 검색 엔진이 읽을 수 있는 완전한 HTML로 렌더링 | curl로 페이지 요청 시 완전한 HTML 반환 (JS 없이 콘텐츠 포함) |
| **E2E 테스트** | 반응형 레이아웃: 375px, 768px, 1280px 화면에서 레이아웃 깨짐 없음 | Playwright viewport 테스트 통과 |
| **E2E 테스트** | Lighthouse SEO 점수: 소개 페이지 Lighthouse SEO 90점 이상 | Lighthouse CI 자동화 |
| **E2E 테스트** | Core Web Vitals: LCP ≤ 2.5s, CLS ≤ 0.1 | Lighthouse/Playwright 측정 |

---

## Phase 2: 웹 서비스 안정화 (목표: Phase 1 출시 후)

**목표**: Phase 1 출시 후 웹 서비스 성능·SEO 최적화 및 AdSense 승인 준비를 강화한다.

### 기능 범위

| 기능 | 우선순위 | 설명 |
|------|---------|------|
| Lighthouse SEO 90점 이상 달성 | P0 | Core Web Vitals 최적화 |
| **랜딩 페이지 테마 토글 UI 추가** | P0 | `LandingHeader.tsx` 분리 — ThemeToggle 포함. `page.tsx` 인라인 header → LandingHeader 교체. PL-BR10·US-PL-06 구현 |
| 다운로드 페이지 (/download) | P1 | Windows 앱 출시 후 다운로드 링크 제공 |
| AdSense 심사 신청 | P1 | 트래픽·콘텐츠 충분 시 신청 |

---

## Phase 3: Tauri 데스크탑 앱 (목표: Phase 2 완료 후)

**목표**: Windows 데스크탑 앱을 출시하여 Typora 대안으로서의 네이티브 경험을 제공한다.

### 전제 조건

- **P3-0**: Tauri 2.0 + Next.js 16.1.6 통합 PoC 완료 (Phase 3 첫 태스크)
- PoC 실패 시 Electron으로 대안 진행

### 기능 범위

| 기능 ID | 기능 | 우선순위 | 설명 |
|---------|------|---------|------|
| P3-0 | Tauri + Next.js 16 PoC | P0 | Tauri 2.0 + Next.js 16.1.6 통합 가능성 검증 (신규) |
| P3-1 | Tauri 2.0 앱 빌드 | P0 | Windows .exe/.msi 빌드 |
| P3-2 | 코드 서명 (Code Signing) | P0 | SmartScreen 경고 방지 |
| P3-3 | .md/.pdf 파일 연결 등록 | P0 | Windows 파일 기본 앱으로 ModuMark 등록 (.md + .pdf 모두) |
| P3-8 | 파일 타입별 자동 라우팅 | P0 | 파일 연결로 열린 파일이 타입에 따라 올바른 페이지로 자동 이동 (.md → `/markdown`, .pdf → `/pdf`) |
| P3-4 | 로컬 파일 시스템 접근 | P0 | Tauri FS 플러그인으로 파일 읽기·쓰기 |
| P3-5 | GitHub Releases 배포 | P0 | 빌드 파일 GitHub Releases에 업로드 |
| P3-6 | 창 상태 저장·복원 | P1 | 크기·위치 저장 |
| P3-7 | **세션 백업 인프라 (Tauri)** | P1 | `app_data_dir()` API로 `{APP_DATA_DIR}/backup/` 디렉토리 관리. session.json + tab_{uuid}.md.bak 파일 읽기·쓰기·삭제. PL-S7 구현 |
| — | **앱 다운로드 안내 시스템** | P2 | 웹 환경 스토리지 한도 초과 시 앱 다운로드 안내 다이얼로그 + `/download` 페이지 CTA. PL-S8 구현 |

### 테스트 기준 (Phase 3)

| 테스트 유형 | 범위 | 성공 기준 |
|-----------|------|----------|
| **단위 테스트** | 플랫폼 환경 감지 (`isTauriApp()`): 웹/Tauri 환경 정확히 구분 | 웹 환경: false, Tauri 환경: true 반환 |
| **통합 테스트** | Tauri FS API: 로컬 .md 파일 읽기·쓰기·경로 처리 | 실제 파일 읽기 → Milkdown 로딩, 저장 → 파일 내용 일치 |
| **통합 테스트** | .md 파일 연결: .md 파일 더블클릭 → `app:open-files` 이벤트 수신 → `/markdown` 탭 열기 | 파일 경로가 정확히 에디터 탭으로 전달됨 |
| **통합 테스트** | .pdf 파일 연결: .pdf 파일 더블클릭 → `app:open-files` 이벤트 수신 → `/pdf` 뷰어 열기 | PDF 파일이 뷰어에 자동으로 로드됨 |
| **E2E 테스트** | 앱 설치 플로우: .msi 설치 → 실행 → 편집 → 저장 전체 시나리오 | 설치 후 SmartScreen 경고 없음, 편집·저장 정상 동작 |
| **E2E 테스트** | 광고 미노출: 데스크탑 앱에서 광고 슬롯 DOM 없음 | `adsbygoogle` 관련 DOM 요소 없음 확인 |
| **통합 테스트** | 세션 백업 인프라: Tauri FS API로 backup 디렉토리 생성·파일 쓰기·읽기·삭제 정상 동작 | backup 디렉토리가 없을 시 자동 생성, 파일 CRUD 정상 확인 |
| **단위 테스트** | 앱 데이터 디렉토리 경로: `app_data_dir()`이 올바른 Windows 경로 반환 | `%APPDATA%/com.modumark/backup/` 경로 확인 |

### Phase 3 태스크 정의 (shrimp-task-manager용)

| 태스크 ID | 태스크명 | PRD 근거 | 의존성 | 테스트 기준 |
|----------|---------|---------|-------|------------|
| P3-0 | Tauri + Next.js 16 PoC | PL-S6 | Phase 2 완료 | Tauri 2.0 + Next.js 16 통합 빌드 성공 확인 |
| P3-1 | Tauri 2.0 앱 빌드 | PL-S6 | P3-0 | Windows .exe/.msi 빌드 성공 |
| P3-2 | 코드 서명 | PL-S6 | P3-1 | SmartScreen 경고 없음 확인 |
| P3-3 | .md/.pdf 파일 연결 등록 | PL-S6 | P3-1 | .md/.pdf 더블클릭 → 앱 실행 + 올바른 페이지 열림 확인 |
| P3-8 | 파일 타입별 자동 라우팅 | PL-S6 | P3-3 | .md → /markdown, .pdf → /pdf 자동 라우팅 확인 |
| P3-4 | 로컬 파일 시스템 접근 | PL-S7 | P3-1 | Tauri FS API 파일 읽기·쓰기 정상 동작 |
| P3-5 | GitHub Releases 배포 | PL-S6 | P3-2 | GitHub Releases에 .msi/.exe 업로드 확인 |
| P3-6 | 창 상태 저장·복원 | PL-S6 | P3-1 | 앱 재시작 후 창 크기·위치 복원 확인 |
| P3-7 | 세션 백업 인프라 (Tauri) | PL-S7 | P3-4 | backup 디렉토리 생성·파일 CRUD 정상 확인 |

---

## Phase 4: 자동 업데이터 + 강화 (향후)

**목표**: 앱 생태계 안정성 강화 및 장기 운영 기반 마련.

### 기능 범위 (검토 중)

| 기능 | 설명 |
|------|------|
| 자동 업데이터 | 새 버전 감지 → 사용자 동의 → 자동 업데이트 설치 (Tauri updater 플러그인) |
| 다국어 UI | 영어 지원 추가 (글로벌 확장) |
| PWA (웹) | 오프라인 캐싱, 설치 가능한 웹 앱 |

### 테스트 기준

| 테스트 유형 | 범위 |
|-----------|------|
| **통합 테스트** | 자동 업데이터 트리거·다운로드·설치 플로우 |
| **E2E 테스트** | 기존 기능 전체 회귀 테스트 |

---

## 문서 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| v1.0 | 2026-03-07 | 초안 작성 | 프로젝트 오너 |
| v1.1 | 2026-03-07 | Phase 2에 세션 백업 인프라 (PL-S7), 앱 다운로드 안내 시스템 (PL-S8) 추가 | 프로젝트 오너 |
| v2.0 | 2026-03-08 | Phase 1 완료 체크박스 반영, 테마 전환 Phase 1 구현 완료 기록, Phase 2를 2A(웹 안정화)/2B(Tauri)로 분리, P2-0(Tauri+Next.js 16 PoC) 신규 추가, Next.js 버전 16.1.6으로 정정 | 프로젝트 오너 |
| v2.1 | 2026-03-09 | Phase 1 테마 전환 항목에 랜딩 페이지 Phase 2A 보완 기록. Phase 2A에 "랜딩 페이지 테마 토글 UI 추가(LandingHeader.tsx)" 태스크 추가 | 프로젝트 오너 |
| v2.2 | 2026-03-09 | Phase 2B P2-3 확장: `.md/.pdf 파일 연결 등록`. P2-8 신규: 파일 타입별 자동 라우팅. 테스트 기준에 `.pdf 파일 연결 → PDF 뷰어 열기` 통합 테스트 추가 | 프로젝트 오너 |
| v3.0 | 2026-03-10 | Phase 번호 체계 변경: 서브 Phase(A/B) → 순차 번호. Phase 2A→2, 2B→3, 3→4로 재매핑. P2-x ID를 P3-x로 변경. Phase 3 태스크 정의 블록 추가. 의존성 참조 업데이트 | 프로젝트 오너 |
