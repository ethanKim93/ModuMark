# Monetization 도메인 ROADMAP
# ModuMark - 수익화 릴리즈 계획

| 항목 | 내용 |
|------|------|
| 문서 버전 | v3.0 |
| 작성일 | 2026-03-07 |
| 최종 수정 | 2026-03-11 |
| 상위 문서 | [docs/ROADMAP.md](../ROADMAP.md) · [docs/monetization/PRD.md](./PRD.md) |
| 상태 | Active (Phase 1 완료, AdSense 승인 완료, Phase 3 AdSense 콘텐츠 강화 계획) |

---

## Phase 1: AdSense 기본 통합 (목표: 출시 기반) ✅ 완료

**목표**: Google AdSense 기본 광고 슬롯을 통합하고, AdSense 심사 승인 요건을 충족하는 콘텐츠·페이지 구조를 갖춘다.

### 기능 범위

| 기능 | 우선순위 | 완료 여부 |
|------|---------|---------|
| AdSense 스크립트 통합 | P0 | ✅ 완료 (`layout.tsx`, `NEXT_PUBLIC_ADSENSE_ID=ca-pub-1815575117157423`) |
| AdSlot 컴포넌트 | P0 | ✅ 완료 (`components/ads/AdSlot.tsx`) |
| FloatingAdSlot 컴포넌트 | P0 | ✅ 완료 (`components/ads/FloatingAdSlot.tsx`) |
| Lazy Loading 적용 | P0 | ✅ 완료 (Intersection Observer) |
| CLS 방지 (min-height) | P0 | ✅ 완료 |
| 웹 전용 노출 | P0 | ✅ 완료 (`isTauriApp()` 확인, Tauri 앱 미렌더링) |
| 광고 정책 설정 | P1 | AdSense 승인 후 정책 센터에서 설정 예정 |
| 모바일 광고 숨김 | P1 | ✅ 완료 (375px 미만 SIDEBAR_RIGHT 숨김) |
| AdSense 승인 콘텐츠 | P1 | ✅ 완료 (/, /security, /privacy, /terms 페이지) |
| **ads.txt 파일 생성** | **P0** | **✅ 완료 (`public/ads.txt`, 퍼블리셔 인증)** |
| **google-adsense-account 메타 태그** | **P0** | **✅ 완료 (`layout.tsx` metadata.other)** |
| **AdSense 실제 ID 교체** | **P0** | **✅ 완료 (`ca-pub-1815575117157423`, `.env.local` 적용)** |

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

## Phase 3: AdSense 콘텐츠 강화

**목표**: AdSense 저가치 콘텐츠 정책 위반 리스크를 해소한다. 공개 페이지 콘텐츠 품질 강화, 네비게이션 일관성 확보, 가이드 콘텐츠 허브 구축을 통해 광고 게재를 안정적으로 유지하고 오가닉 트래픽을 확대한다.

**배경**: AdSense 승인은 완료되었으나, 도구 페이지(/markdown, /pdf, /pdf/merge 등)의 SSR 콘텐츠 부재로 크롤러가 페이지를 저가치로 판단할 수 있다. Phase 3는 이 리스크를 단계적으로 해소한다.

---

### Phase 3A: 공통 인프라 + 네비게이션 통일

**목표**: 모든 공개 페이지에 일관된 SiteHeader/SiteFooter를 적용하고, 도구 페이지에 SSR 콘텐츠를 삽입하며, GDPR 쿠키 동의 배너를 추가한다.

**PRD 근거**: MN-M7, MN-M8, MN-M9, MN-M10, MN-M12, MN-M13

#### Phase 3A 태스크 정의

| 태스크 ID | 태스크명 | PRD 근거 | 의존성 | 완료 기준 |
|----------|---------|---------|--------|---------|
| 3A-1 | SiteHeader 컴포넌트 생성 | MN-M7 | 없음 | `src/components/layout/SiteHeader.tsx` 생성. 로고, 홈·마크다운·PDF·About 네비 링크, ThemeToggle, 모바일 햄버거 메뉴 포함. 반응형(375px/768px/1280px) 동작 확인 |
| 3A-2 | SiteFooter 컴포넌트 생성 | MN-M8 | 없음 | `src/components/layout/SiteFooter.tsx` 생성. 도구 링크(마크다운·PDF 병합·PDF 분할·OCR), 법적 링크(개인정보처리방침·이용약관·보안정책), 연락처 `modu.markdown@gmail.com` 포함 |
| 3A-3 | ToolHero 컴포넌트 생성 | MN-M9 | 없음 | `src/components/common/ToolHero.tsx` 생성. title, description, features(string[]), usageSteps(string[]) props 수신. SSR 렌더링 확인 (`curl` 응답에 텍스트 포함) |
| 3A-4 | CookieConsentBanner 생성 | MN-M10 | 없음 | `src/components/common/CookieConsentBanner.tsx` 생성. 동의/거부 버튼, localStorage `cookie-consent` 키 저장, 동의 후 재표시 없음, 클라이언트 전용(`use client`) |
| 3A-5 | 공개 페이지 SiteHeader/SiteFooter 교체 | MN-M7, MN-M8 | 3A-1, 3A-2 | /, /privacy, /terms, /security 페이지에 SiteHeader/SiteFooter 적용 확인. 기존 헤더/푸터 대체. 빌드 성공 |
| 3A-6 | /markdown 페이지 ToolHero 삽입 | MN-M12 | 3A-3 | `src/app/markdown/page.tsx`에 ToolHero 삽입. `curl https://modumark.com/markdown`로 SSR 텍스트 800자 이상 확인 |
| 3A-7 | /pdf 페이지 ToolHero 삽입 | MN-M13 | 3A-3 | `src/app/pdf/page.tsx`에 ToolHero 삽입. `curl https://modumark.com/pdf`로 SSR 텍스트 800자 이상 확인 |
| 3A-8 | layout.tsx에 CookieConsentBanner 추가 | MN-M10 | 3A-4 | `src/app/layout.tsx`에 CookieConsentBanner 추가. 최초 방문 시 하단 배너 표시 확인. 동의 후 localStorage에 값 저장 확인 |

#### Phase 3A 테스트 기준

| 테스트 유형 | 범위 | 성공 기준 |
|-----------|------|----------|
| **빌드 테스트** | `npm run build` | 오류 없이 빌드 성공 |
| **SSR 확인** | `curl http://localhost:3000/markdown` | 응답 HTML에 ToolHero 텍스트 포함 (JS 미실행 상태) |
| **SSR 확인** | `curl http://localhost:3000/pdf` | 응답 HTML에 ToolHero 텍스트 포함 |
| **E2E 테스트** | SiteHeader 네비게이션 | 모든 공개 페이지에서 주요 링크 클릭 가능 확인 |
| **E2E 테스트** | CookieConsentBanner | 최초 방문 시 배너 표시, 동의 클릭 후 미재표시 |
| **반응형 테스트** | SiteHeader 모바일 | 375px viewport에서 햄버거 메뉴 동작 확인 |

---

### Phase 3B: 필수 페이지 + 콘텐츠 보강

**목표**: About 페이지 신설, 랜딩 페이지 콘텐츠 대폭 보강, PDF 하위 라우트 SSR 복원, GDPR 보강, 공개 페이지 광고 슬롯 추가, sitemap/구조화 데이터 업데이트를 수행한다.

**PRD 근거**: MN-M11, MN-M14, MN-M15, MN-M16, MN-M17, MN-M18, MN-M19

#### Phase 3B 태스크 정의

| 태스크 ID | 태스크명 | PRD 근거 | 의존성 | 완료 기준 |
|----------|---------|---------|--------|---------|
| 3B-1 | About 페이지 생성 | MN-M11 | 3A-1, 3A-2 | `src/app/about/page.tsx` 생성. SiteHeader/SiteFooter 적용. 서비스 소개(ModuMark 제작 목적), 핵심 기능(마크다운 편집·PDF 처리·로컬 우선 보안), 개인정보 철학, 연락처 `modu.markdown@gmail.com` 포함. SSR 텍스트 1000자 이상. Organization 스키마 포함 |
| 3B-2 | 랜딩 페이지 콘텐츠 보강 | MN-M19 | 3A-1, 3A-2 | `src/app/page.tsx` 수정. 사용 방법 3단계 섹션 추가(1.파일 열기·2.편집·3.저장/내보내기), FAQ 5~7개 섹션 추가(자주 묻는 질문), 전체 SSR 텍스트 1500자 이상 확인. FAQPage 구조화 데이터 적용 |
| 3B-3 | PDF 하위 라우트 SSR 복원 | MN-M14 | 3A-1, 3A-2, 3A-3 | `/pdf/merge`, `/pdf/split`, `/pdf/ocr` 각 페이지에서 redirect 제거. 각 페이지에 고유 ToolHero 삽입. SSR 텍스트 800자 이상. 독립적인 메타태그(title, description, og:) 적용 |
| 3B-4 | 개인정보처리방침 GDPR 보강 | MN-M15 | 없음 | `src/app/privacy/page.tsx` 수정. 쿠키 종류별 설명(필수/분석/광고 쿠키) 추가, 사용자 권리(열람·삭제·이의제기) 조항 추가, AdSense 쿠키 옵트아웃 방법 링크 추가, 연락처 이메일 명시 |
| 3B-5 | 공개 페이지 광고 슬롯 배치 | MN-M16 | 3B-1, 3B-2 | 랜딩 페이지 AdSlot 2개, About 페이지 AdSlot 2개, /privacy·/terms·/security 각 AdSlot 1개 추가. CLS 0 유지 확인 |
| 3B-6 | sitemap.ts 업데이트 | MN-M17 | 3B-1, 3B-3 | `src/app/sitemap.ts`에 `/about`, `/guide`, `/guide/markdown-basics`, `/guide/pdf-merge`, `/guide/pdf-split`, `/guide/ocr`, `/guide/keyboard-shortcuts`, `/pdf/merge`, `/pdf/split`, `/pdf/ocr` URL 추가. `curl http://localhost:3000/sitemap.xml`로 신규 URL 포함 확인 |
| 3B-7 | 구조화 데이터 보강 | MN-M18 | 3B-1, 3B-2 | `src/lib/structured-data.ts`에 `generateFAQSchema()`, `generateOrganizationSchema()` 함수 추가. 랜딩 페이지에 FAQPage 스키마 적용, About 페이지에 Organization 스키마 적용. Google Rich Results Test 통과 |

#### Phase 3B 테스트 기준

| 테스트 유형 | 범위 | 성공 기준 |
|-----------|------|----------|
| **빌드 테스트** | `npm run build` | 오류 없이 빌드 성공 |
| **SSR 확인** | `curl http://localhost:3000/about` | SSR 텍스트 1000자 이상 포함 |
| **SSR 확인** | `curl http://localhost:3000/pdf/merge` | SSR 텍스트 800자 이상, redirect 없음 |
| **SSR 확인** | `curl http://localhost:3000/pdf/split` | SSR 텍스트 800자 이상, redirect 없음 |
| **SSR 확인** | `curl http://localhost:3000/pdf/ocr` | SSR 텍스트 800자 이상, redirect 없음 |
| **SEO 테스트** | Lighthouse SEO 점수 | `/`, `/about`, `/pdf/merge`, `/pdf/split`, `/pdf/ocr` 각 90점 이상 |
| **구조화 데이터** | JSON-LD 유효성 | 랜딩 FAQPage, About Organization 스키마 렌더링 확인 |
| **sitemap** | `curl http://localhost:3000/sitemap.xml` | 신규 URL(/about, /guide/*, /pdf/merge 등) 포함 확인 |
| **E2E 테스트** | About 페이지 접근 | SiteHeader 네비게이션에서 About 링크 클릭 → /about 이동 |
| **E2E 테스트** | 광고 슬롯 CLS | 공개 페이지 광고 슬롯 로딩 후 CLS 0 유지 |

---

### Phase 3C: 가이드 콘텐츠 허브

**목표**: 마크다운 편집·PDF 처리·OCR 등 주요 기능의 사용법 가이드 5개를 신설하여 오가닉 검색 트래픽을 확대하고 AdSense 저가치 콘텐츠 리스크를 완전히 해소한다.

**PRD 근거**: MN-S5, MN-S6, MN-S7, MN-S8, MN-S9, MN-S10

#### Phase 3C 태스크 정의

| 태스크 ID | 태스크명 | PRD 근거 | 의존성 | 완료 기준 |
|----------|---------|---------|--------|---------|
| 3C-1 | 가이드 인덱스 페이지 생성 | MN-S5 | 3A-1, 3A-2 | `src/app/guide/page.tsx` 생성. SiteHeader/SiteFooter 적용. 전체 가이드 목록(마크다운 기초·PDF 병합·PDF 분할·OCR·키보드 단축키) 카드 레이아웃으로 표시. 각 카드에 제목·요약·링크 포함. SSR 500자 이상 |
| 3C-2 | 마크다운 기초 가이드 | MN-S6 | 3C-1 | `src/app/guide/markdown-basics/page.tsx` 생성. 헤딩(#~######), 볼드/이탤릭, 링크/이미지, 코드 인라인/블록, 테이블, 인용문, 목록(순서형/비순서형) 문법 예시 포함. SSR 텍스트 1000자 이상. 독립 메타태그(title, description) 포함 |
| 3C-3 | PDF 병합 가이드 | MN-S7 | 3C-1 | `src/app/guide/pdf-merge/page.tsx` 생성. PDF 파일 드래그앤드롭 방법, 순서 변경, 병합 실행, 다운로드 단계별 설명. 최대 20개 파일·100MB 제한 안내 포함. SSR 텍스트 1000자 이상 |
| 3C-4 | PDF 분할 가이드 | MN-S8 | 3C-1 | `src/app/guide/pdf-split/page.tsx` 생성. 페이지 범위 지정 방법(예: 1-3, 5), 분할 실행, 다운로드 단계별 설명. SSR 텍스트 1000자 이상 |
| 3C-5 | OCR 가이드 | MN-S9 | 3C-1 | `src/app/guide/ocr/page.tsx` 생성. PDF에서 텍스트 추출 방법, 지원 언어(한국어·영어), 결과 복사·마크다운 변환 활용법 설명. 로컬 처리(서버 미전송) 보안 강점 언급. SSR 텍스트 1000자 이상 |
| 3C-6 | 키보드 단축키 가이드 | MN-S10 | 3C-1 | `src/app/guide/keyboard-shortcuts/page.tsx` 생성. 마크다운 에디터 단축키(저장·PDF 내보내기·새 탭 등), PDF 도구 단축키 전체 목록 표 형식으로 제공. SSR 텍스트 1000자 이상 |

#### Phase 3C 테스트 기준

| 테스트 유형 | 범위 | 성공 기준 |
|-----------|------|----------|
| **빌드 테스트** | `npm run build` | 오류 없이 빌드 성공 |
| **SSR 확인** | `curl http://localhost:3000/guide` | SSR 텍스트 포함, 가이드 목록 링크 확인 |
| **SSR 확인** | 각 가이드 페이지 6개 | 각 페이지 SSR 텍스트 1000자 이상 |
| **SEO 테스트** | Lighthouse SEO 점수 | 가이드 페이지 6개 각 90점 이상 |
| **E2E 테스트** | 가이드 내비게이션 | /guide에서 각 하위 가이드 링크 클릭 → 정상 이동 |
| **E2E 테스트** | SiteFooter 가이드 링크 | SiteFooter에서 주요 가이드 링크 접근 가능 |

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
| v2.1 | 2026-03-10 | AdSense 승인 완료: 실제 ID(`ca-pub-1815575117157423`) 적용, ads.txt·메타 태그 항목 추가 및 완료 처리, 상태 업데이트 | 프로젝트 오너 |
| v3.0 | 2026-03-11 | Phase 3 (AdSense 콘텐츠 강화) 추가: Phase 3A(공통 인프라+네비게이션 통일, 태스크 3A-1~3A-8), Phase 3B(필수 페이지+콘텐츠 보강, 태스크 3B-1~3B-7), Phase 3C(가이드 콘텐츠 허브, 태스크 3C-1~3C-6) 태스크 정의 테이블 포함. 새 기능 MN-M7~M19·MN-S5~S10 반영. 각 Phase 테스트 기준(빌드·SSR curl·Lighthouse·E2E) 추가 | 프로젝트 오너 |
