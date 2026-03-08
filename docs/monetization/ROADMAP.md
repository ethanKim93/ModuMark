# Monetization 도메인 ROADMAP
# ModuMark - 수익화 릴리즈 계획

| 항목 | 내용 |
|------|------|
| 문서 버전 | v2.0 |
| 작성일 | 2026-03-07 |
| 상위 문서 | [docs/ROADMAP.md](../ROADMAP.md) · [docs/monetization/PRD.md](./PRD.md) |
| 상태 | Active (Phase 1 완료) |

---

## Phase 1: AdSense 기본 통합 (목표: 출시 기반) ✅ 완료

**목표**: Google AdSense 기본 광고 슬롯을 통합하고, AdSense 심사 승인 요건을 충족하는 콘텐츠·페이지 구조를 갖춘다.

### 기능 범위

| 기능 | 우선순위 | 완료 여부 |
|------|---------|---------|
| AdSense 스크립트 통합 | P0 | ✅ 완료 (`layout.tsx`, `NEXT_PUBLIC_ADSENSE_ID=ca-pub-placeholder`) |
| AdSlot 컴포넌트 | P0 | ✅ 완료 (`components/ads/AdSlot.tsx`) |
| FloatingAdSlot 컴포넌트 | P0 | ✅ 완료 (`components/ads/FloatingAdSlot.tsx`) |
| Lazy Loading 적용 | P0 | ✅ 완료 (Intersection Observer) |
| CLS 방지 (min-height) | P0 | ✅ 완료 |
| 웹 전용 노출 | P0 | ✅ 완료 (`isTauriApp()` 확인, Tauri 앱 미렌더링) |
| 광고 정책 설정 | P1 | AdSense 승인 후 정책 센터에서 설정 예정 |
| 모바일 광고 숨김 | P1 | ✅ 완료 (375px 미만 SIDEBAR_RIGHT 숨김) |
| AdSense 승인 콘텐츠 | P1 | ✅ 완료 (/, /security, /privacy, /terms 페이지) |

### 테스트 기준

| 테스트 유형 | 범위 | 성공 기준 |
|-----------|------|----------|
| **단위 테스트** | `isWebEnvironment()` / `isTauriApp()`: 환경 감지 정확성 | 웹: 광고 렌더링, Tauri: 광고 null 렌더링 |
| **단위 테스트** | AdSlot 컴포넌트: position prop에 따른 min-height 값 정확성 | 각 position별 올바른 높이 적용 확인 |
| **통합 테스트** | Lazy Loading: 슬롯이 뷰포트 밖일 때 광고 로딩 요청 없음 | Network 탭에서 뷰포트 진입 전 AdSense 요청 없음 |
| **통합 테스트** | CLS 측정: 광고 로딩 전후 레이아웃 이동 없음 | CLS 값 0.1 이하 |
| **E2E 테스트** | Tauri 앱 광고 미노출: 앱에서 adsbygoogle DOM 없음 | Playwright로 앱 페이지에서 `.adsbygoogle` 요소 없음 확인 |
| **E2E 테스트** | 모바일 광고 숨김: 375px 화면에서 SIDEBAR_RIGHT 슬롯 미표시 | Playwright viewport 375px에서 사이드바 광고 hidden 확인 |

---

## Phase 2A: 광고 최적화 (목표: Phase 1 출시 후 3개월)

**목표**: 광고 뷰어빌리티·CTR·수익을 분석하여 광고 배치를 최적화한다. 광고 차단기 대응을 추가한다.

### 기능 범위

| 기능 | 우선순위 | 설명 |
|------|---------|------|
| Ad Blocker 감지 | P1 | fetch 기반 감지 로직 |
| Ad Blocker 안내 배너 | P1 | 비폭력적 안내 메시지, 닫기 버튼 |
| 광고 실패 처리 | P2 | 로딩 실패 시 슬롯 공간 자동 제거 |
| 광고 갱신 제어 | P2 | PDF 작업 완료·문서 열기 등 이벤트 기반 광고 갱신 |

### 테스트 기준

| 테스트 유형 | 범위 | 성공 기준 |
|-----------|------|----------|
| **단위 테스트** | Ad Blocker 감지 로직: fetch 성공/실패 케이스 | AdSense URL 요청 차단 시 `true` 반환 |
| **단위 테스트** | 광고 갱신 빈도 제어: 분당 최대 2회 제한 | 2회 초과 갱신 시도 시 무시 확인 |
| **통합 테스트** | 광고 실패 처리: 광고 로딩 실패 시 슬롯 DOM 제거 및 레이아웃 복구 | 광고 슬롯 공간 제거 후 주변 요소 CLS 없음 |
| **E2E 테스트** | Ad Blocker 안내: 차단기 환경에서 안내 배너 표시, 닫기 후 미재표시 | Playwright에서 AdSense URL 차단 후 배너 표시 확인 |

---

## Phase 2B: 수익 분석 + A/B 테스트 (향후)

**목표**: 광고 배치 전략을 데이터 기반으로 개선하여 RPM·CTR을 높인다.

### 기능 범위 (검토 중)

| 기능 | 설명 |
|------|------|
| 광고 배치 A/B 테스트 | 다양한 슬롯 위치·크기 조합 비교 |
| 수익 대시보드 | AdSense API 연동 내부 현황 확인 |
| 자동 광고 | AdSense 자동 광고 기능 테스트 |

### 테스트 기준

| 테스트 유형 | 범위 |
|-----------|------|
| **단위 테스트** | A/B 테스트 그룹 할당 로직 |
| **E2E 테스트** | 기존 광고 기능 전체 회귀 테스트 |

---

## 문서 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| v1.0 | 2026-03-07 | 초안 작성 | 프로젝트 오너 |
| v2.0 | 2026-03-08 | Phase 1 완료 체크박스 반영 (AdSlot, FloatingAdSlot, Lazy Loading 등), Phase 2를 2A(광고 최적화)/2B(A/B 테스트)로 분리, AdSense ID 환경변수 명시 | 프로젝트 오너 |
