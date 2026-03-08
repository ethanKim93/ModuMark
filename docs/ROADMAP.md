# ROADMAP
# ModuMark - 전체 릴리즈 계획

| 항목 | 내용 |
|------|------|
| 문서 버전 | v2.0 |
| 작성일 | 2026-03-07 |
| 최종 수정 | 2026-03-08 |
| 상위 문서 | [docs/BRD.md](./BRD.md) · [docs/PRD.md](./PRD.md) |
| 상태 | Active (Phase 1 완료, Phase 2A/2B 진행 예정) |

---

## 목차

1. [릴리즈 철학](#1-릴리즈-철학)
2. [전체 타임라인](#2-전체-타임라인)
3. [Phase 1: MVP 웹 서비스 출시 ✅ 완료](#3-phase-1-mvp-웹-서비스-출시)
4. [Phase 2A: 웹 기능 강화](#4-phase-2a-웹-기능-강화)
5. [Phase 2B: Tauri 데스크탑 앱](#5-phase-2b-tauri-데스크탑-앱)
6. [Phase 3: 기능 고도화](#6-phase-3-기능-고도화)
7. [도메인별 ROADMAP 연계](#7-도메인별-roadmap-연계)
8. [마일스톤 검증 기준](#8-마일스톤-검증-기준)

---

## 1. 릴리즈 철학

- **MVP 우선**: 핵심 가치(무료 WYSIWYG + PDF 통합)를 최소한의 기능으로 가능한 빨리 출시한다.
- **로컬 우선 보안**: 모든 파일 처리는 Phase 1부터 클라이언트에서 수행한다. 보안 원칙은 타협하지 않는다.
- **SEO 선행**: AdSense 수익을 위해 SEO 기반은 Phase 1에서 완성한다.
- **점진적 품질 향상**: Phase 2·3에서 기능을 추가하되, Phase 1의 핵심 품질은 항상 유지한다.

---

## 2. 전체 타임라인

```
[Phase 1: MVP ✅]    [Phase 2A: 웹 강화]    [Phase 2B: Tauri 앱]    [Phase 3: 고도화]
      │                      │                      │                      │
  완료 (2026-03)           4~6주                  4~6주                  지속적
      │                      │                      │                      │
편집기+PDF+SEO+         OCR+에디터 강화+        Tauri PoC+앱 빌드+     Mermaid+찾기바꾸기+
AdSense+배포            광고 안정화             코드서명+파일연결       PWA+광고최적화
```

### Gantt 형식 (주 단위)

```
Week  1~8          9  10 11 12 13 14 15 16 17 18 19 20 21 22 ...
Phase 1: MVP (완료)
  편집기+PDF+SEO   [████████ ✅]

Phase 2A: 웹 기능 강화 (병렬 진행 가능)
  에디터 Undo/Raw 모드           [████]
  OCR(Tesseract.js)                  [████]
  PDF 압축                                [██]
  광고 안정화(AdBlock+실패처리)              [██]
  Phase 2A 완료                               [V]

Phase 2B: Tauri 데스크탑 (2A와 병렬 가능)
  Tauri+Next.js 16 PoC          [██]
  Tauri 앱 빌드                      [████]
  코드서명+파일연결                         [██]
  세션백업+배포                               [████]
  Phase 2B 완료                                   [V]

Phase 3: 고도화
  자동 업데이터                                          [██]
  Mermaid+찾기바꾸기                                     [████]
  광고 최적화                                                [지속]
```

---

## 3. Phase 1: MVP 웹 서비스 출시 ✅ 완료

**완료일**: 2026-03-08
**결과**: 25/25 태스크 완료, Vercel 배포 완료, 단위 테스트 47개 통과

### Phase 1 포함 기능 (실제 구현)

| 도메인 | 기능 |
|--------|------|
| **Editor** | WYSIWYG 편집(Milkdown), .md 파일 열기·저장, **탭 기반 다중 문서**, 자동 저장(30초), 미저장 경고 |
| **PDF** | PDF 뷰어(PDF.js v5), 마크다운→PDF 변환(pdf-lib + NotoSansKR 한글), PDF 병합·분할, **썸네일 미리보기(dnd-kit)**, **페이지 추출**, **다중 선택**, **Undo(30단계)**, /pdf 통합 라우트 |
| **Platform** | Next.js 16.1.6 웹 앱, Vercel 배포, SEO 기본 구조, 소개·보안안내·개인정보처리방침 페이지, **다크/라이트/시스템 테마 전환(next-themes)**, AppHeader 레이아웃 |
| **Monetization** | AdSense 스크립트 통합, 광고 슬롯(lazy loading, CLS 방지), Tauri 앱 광고 미노출 처리, FloatingAdSlot |

### Phase 1 완료 기준 (Definition of Done)

- [x] 웹 브라우저에서 마크다운 WYSIWYG 편집 가능
- [x] 탭으로 여러 문서 동시 관리 가능
- [x] PDF 뷰어에서 PDF 열람 가능
- [x] 마크다운 → PDF 변환·다운로드 가능 (한글 지원)
- [x] PDF 병합·분할 가능
- [x] Vercel에 배포 완료
- [x] 소개·개인정보처리방침·이용약관 페이지 존재
- [x] 파일 처리 시 외부 서버 전송 없음 확인
- [x] AdSense 승인 신청 완료 (`ca-pub-placeholder`, 실제 ID 교체 필요)
- [x] 단위 테스트 47개 전체 통과 (`npm run test`)

### Phase 1 태스크 정의

> 아래 테이블이 shrimp-task-manager 태스크 생성의 Single Source of Truth이다.
> "Phase 1 실행해줘" 명령 시 roadmap-planner 에이전트가 이 테이블을 읽어 태스크를 자동 생성한다.

#### Platform 도메인 (가장 먼저 — 기반 인프라)

| # | 태스크명 | PRD 근거 | 의존성 | 테스트 기준 | 참조 파일 |
|---|---------|---------|--------|-----------|----------|
| P1 | 디자인 시스템 세팅 | design-tokens.md, design-system.md | 없음 | CSS 변수 정의, shadcn/ui 렌더링, 다크 테마 기본(`--background: #111921`) | globals.css (`@theme inline`, tailwind.config.ts 없음) |
| P2 | Next.js 앱 쉘 + 라우팅 | PL-M1 | P1 | 모든 라우트 접근 가능, build 오류 없음 | src/app/ |
| P3 | 앱 레이아웃 (사이드바+탭바+메인) | component-map.md | P2 | 사이드바 렌더링, StorageIndicator 표시, 탭바 렌더링 | AppShell.tsx, EditorSidebar.tsx, PdfSidebar.tsx |
| P4 | SEO: 메타태그·OG 태그 | PL-M2, PL-M5 | P2 | 각 페이지 title/description/OG 존재, BRD 정의값과 일치 | src/app/*/page.tsx |
| P5 | SEO: sitemap.xml + robots.txt | PL-M3, PL-M4 | P2 | sitemap에 /, /editor, /pdf, /download 등 모든 공개 경로 포함 | src/app/sitemap.ts, robots.ts |
| P6 | SEO: 구조화 데이터 (JSON-LD) | PL-S4 | P4 | SoftwareApplication JSON-LD 소개 페이지 삽입 확인 | JsonLd.tsx |
| P7 | 공개 페이지: 소개 (/) | PL-M7 | P4, P5, P6 | AdSense 승인 수준 콘텐츠, CTA 버튼, Lighthouse SEO 90점 이상 | src/app/page.tsx |
| P8 | 공개 페이지: 보안안내 (/security) | PL-S6 | P4 | "외부 서버 전송 없음" 명시, 콘텐츠 완성 | src/app/security/page.tsx |
| P9 | 공개 페이지: 개인정보처리방침·이용약관 | AdSense 요건 | P4 | Google AdSense 쿠키 관련 내용 포함, 두 페이지 모두 존재 | src/app/privacy/page.tsx, src/app/terms/page.tsx |
| P10 | 반응형 레이아웃 (375px~1440px) | PL-M6 | P3 | Playwright 375px/768px/1280px 3개 뷰포트 레이아웃 테스트 통과 | AppShell.tsx, EditorSidebar.tsx |

#### Editor 도메인

| # | 태스크명 | PRD 근거 | 의존성 | 테스트 기준 | 참조 파일 |
|---|---------|---------|--------|-----------|----------|
| E1 | Milkdown WYSIWYG 편집기 통합 | ED-M1, ED-M2 | P3 | 헤딩~리스트 모든 마크다운 요소 렌더링, 타이핑 지연 P95 100ms 이하 | MilkdownEditor.tsx |
| E2 | 탭 기반 다중 문서 (Zustand) | ED-M6 | E1 | 단위: openTab/closeTab/switchTab/중복방지. 통합: 탭 전환 시 각 탭 콘텐츠 독립 유지 | tabStore.ts, TabBar.tsx |
| E3 | .md 파일 열기 (File System Access API) | ED-M3 | E2 | 통합: API 모킹 파일 열기 → 탭 생성/파일명 표시. 폴백: input[type=file] | fileSystem.ts |
| E4 | .md 파일 저장 + 다른 이름으로 저장 | ED-M4, ED-M5 | E3 | E2E: 저장 → 재열기 시 내용 동일. Ctrl+S 저장 동작 확인 | fileSystem.ts |
| E5 | 미저장 변경사항 경고 | ED-S6 | E4 | E2E: 미저장 탭 닫기 시 확인 다이얼로그. beforeunload 이벤트 처리 | UnsavedChangesDialog.tsx |
| E6 | 자동 저장 (30초 디바운스) | ED-M7 | E4 | 단위: 30초 후 저장 트리거, 변경 시 재시작. 파일핸들 없으면 localStorage | useAutoSave.ts |
| E7 | PDF 내보내기 버튼 | ED-S5 | E2, PF2 | 버튼 클릭 → PDF 변환 → 다운로드. 로딩 상태 표시 | EditorToolbar.tsx |

#### PDF 도메인

| # | 태스크명 | PRD 근거 | 의존성 | 테스트 기준 | 참조 파일 |
|---|---------|---------|--------|-----------|----------|
| PF1 | PDF 뷰어 (PDF.js) | PDF-M1 | P3 | 통합: 100p PDF 이동·줌 정상, 페이지 이동 지연 500ms 이내 | PdfViewer.tsx, pdfViewer.ts |
| PF2 | 마크다운 → PDF 변환 (pdf-lib) | PDF-M2 | E1 | 통합: 에디터 콘텐츠 → PDF Blob 다운로드, 헤딩·코드블록 스타일 포함 | markdownToPdf.ts |
| PF3 | PDF 병합 (최대 20개, 100MB) | PDF-M3 | PF1 | 단위: 병합 페이지 수 합산 정확. E2E: 3개 파일 병합 → 다운로드 플로우 | pdfMerge.ts, PdfMerge.tsx |
| PF4 | PDF 분할 (페이지 범위 추출) | PDF-M4 | PF1 | 단위: 범위 1-3,5,7-10 추출 정확. E2E: 분할 → 다운로드 플로우 | pdfSplit.ts, PdfSplit.tsx |
| PF5 | 파일 크기 제한 안내 | PDF-S3 | PF3, PF4 | 단위: 100MB 초과 시 ValidationError 반환. 암호화 PDF 안내 메시지 표시 | pdfMerge.ts, pdfSplit.ts |
| PF6 | 처리 진행률 표시 | PDF-M5 | PF3, PF4 | 진행률 바 0~100%, 단계별 텍스트 표시, 처리 중 UI 블로킹 없음 | ProcessingProgress.tsx |

#### Monetization 도메인

| # | 태스크명 | PRD 근거 | 의존성 | 테스트 기준 | 참조 파일 |
|---|---------|---------|--------|-----------|----------|
| M1 | AdSense 스크립트 + 광고 슬롯 | MON-M1, MON-M2 | P7, P8, P9 | lazyOnload 적용, CLS ≤ 0.1, 모바일(375px) 사이드바 광고 숨김, 편집영역 오버레이 금지 | AdSlot.tsx, layout.tsx |
| M2 | Tauri 앱 광고 미노출 처리 | MON-M3 | M1 | isTauriApp()=true 시 AdSlot DOM 없음. 웹에서는 정상 표시 | environment.ts, useEnvironment.ts |

> **총 태스크 수**: Platform 10 + Editor 7 + PDF 6 + Monetization 2 = **25개**

#### 테스트 태스크 (구현 완료 후 — 필수)

| # | 태스크명 | 범위 | 의존성 | 성공 기준 |
|---|---------|------|--------|----------|
| T1 | 테스트 인프라 세팅 | Vitest + Playwright 설치/설정 | 전체 구현 완료 | vitest run, playwright test 실행 가능 |
| T2 | Phase 1 버그 수정 (QA) | Dialog, markdownToPdf, PDF export | T1 | 보고된 3건 버그 모두 해결 |
| T3 | 단위 테스트 | tabStore, pdfMerge, pdfSplit, markdownToPdf, environment | T2 | 커버리지 80%+, 0 failures |
| T4 | 통합 테스트 | Editor↔Tab, Editor↔FileSystem, PDF 플로우 | T3 | 모든 연동 시나리오 통과 |
| T5 | E2E 테스트 | 에디터, 탭, PDF, 반응형, 공개 페이지 | T4 | Critical Path 100% 통과 |

---

## 4. Phase 2A: 웹 기능 강화

**목표 기간**: Phase 1 완료 후 약 4~6주
**핵심 목표**: 웹 서비스 품질 고도화 — 에디터 강화, OCR, PDF 압축, 광고 안정화.

### Phase 2A 포함 기능

| 도메인 | 기능 |
|--------|------|
| **Editor** | Undo/Redo(에디터), WYSIWYG↔Raw 모드 전환, 키보드 단축키 확장, 웹 스토리지 한도 경고 |
| **PDF** | OCR (Tesseract.js, 한국어), PDF 압축 |
| **Monetization** | Ad Blocker 감지·안내, 광고 실패 처리 |

### Phase 2A 완료 기준 (Definition of Done)

- [ ] 에디터 Undo/Redo 100단계 동작 확인
- [ ] WYSIWYG ↔ Raw 모드 전환 정상
- [ ] Ctrl+S/T/W/Z 단축키 동작 확인
- [ ] 한국어 OCR 정확도 80% 이상 검증
- [ ] PDF 압축 기능 동작 확인 (압축 전후 파일 크기 감소)
- [ ] 웹 스토리지 한도 경고 표시 확인 (50MB 초과 시)
- [ ] Ad Blocker 감지 배너 표시 확인

### Phase 2A 태스크 정의

> 아래 테이블이 shrimp-task-manager 태스크 생성의 Single Source of Truth이다.
> "Phase 2A 실행해줘" 명령 시 roadmap-planner 에이전트가 이 테이블을 읽어 태스크를 자동 생성한다.

#### Editor 도메인

| # | 태스크명 | PRD 근거 | 의존성 | 테스트 기준 | 참조 파일 |
|---|---------|---------|--------|-----------|----------|
| E2-1 | 에디터 Undo/Redo | ED-M8 | Phase 1 E1 완료 | 단위: 100단계 이상 Undo 시 FIFO로 이전 이력 제거 | milkdownPlugin.ts |
| E2-2 | WYSIWYG ↔ Raw 모드 전환 | ED-M9 | Phase 1 E1 완료 | 단위: 모드 전환 전후 마크다운 AST 보존. 내용 동일 확인 | ModeToggle.tsx, RawEditor.tsx |
| E2-3 | 키보드 단축키 확장 | ED-M10 | Phase 1 E1 완료 | 통합: Ctrl+S 저장, Ctrl+T 새 탭, Ctrl+W 탭 닫기, Ctrl+Z Undo 정상 동작 | useKeyboard.ts |
| E2-5 | 웹 스토리지 한도 경고 | ED-S8 | Phase 1 E1 완료 | 단위: IndexedDB 49MB→정상, 51MB→경고. E2E: 경고 배지 + 앱 다운로드 안내 다이얼로그 표시 | StorageWarning.tsx |

#### PDF 도메인

| # | 태스크명 | PRD 근거 | 의존성 | 테스트 기준 | 참조 파일 |
|---|---------|---------|--------|-----------|----------|
| PF2-1 | PDF OCR (Tesseract.js) | PDF-M6 | Phase 1 PF1 완료 | 통합: 10p PDF OCR 완료, 결과 텍스트 반환. E2E: 한국어 인쇄 문서 80% 이상 정확도 | pdfOcr.ts, OcrPanel.tsx |
| PF2-2 | OCR 신뢰도 표시 | PDF-S5 | PF2-1 | 단위: 신뢰도 79%→LOW_CONFIDENCE, 80%→정상 (경계값 테스트) | OcrResult.tsx |
| PF2-3 | OCR 결과 → 에디터 탭 | PDF-S6 | PF2-1, Phase 1 E2 완료 | E2E: OCR 완료 후 에디터 탭에 추출 텍스트 표시 | ocrToEditor.ts |
| PF2-4 | PDF 압축 | PDF-S4 | Phase 1 PF1 완료 | 단위: 압축 후 파일 크기 감소 확인. E2E: 압축 레벨 선택 → 압축 → 다운로드 | pdfCompress.ts, PdfCompress.tsx |

#### Monetization 도메인

| # | 태스크명 | PRD 근거 | 의존성 | 테스트 기준 | 참조 파일 |
|---|---------|---------|--------|-----------|----------|
| M2-1 | Ad Blocker 감지·안내 | MON-S1 | Phase 1 M1 완료 | 단위: AdSense URL 차단 시 true 반환. E2E: 차단기 환경에서 안내 배너 표시, 닫기 후 미재표시 | useAdBlockDetect.ts, AdBlockBanner.tsx |
| M2-2 | 광고 실패 처리 | MON-S2 | Phase 1 M1 완료 | 통합: 광고 로딩 실패 시 슬롯 DOM 제거 및 레이아웃 복구, CLS 없음 | AdSlot.tsx |

> **총 태스크 수**: Editor 4 + PDF 4 + Monetization 2 = **10개**

---

## 5. Phase 2B: Tauri 데스크탑 앱

**목표 기간**: Phase 1 완료 후 약 4~6주 (Phase 2A와 병렬 진행 가능)
**핵심 목표**: Typora 대안으로서의 네이티브 데스크탑 경험 제공.

### Phase 2B 포함 기능

| 도메인 | 기능 |
|--------|------|
| **Platform** | Tauri 2.0 + Next.js 16 PoC, Windows 앱 빌드, 코드 서명, .md 파일 연결, GitHub Releases 배포, 세션 백업 인프라, 앱 다운로드 안내 |
| **Editor** | 세션 백업 시스템 (Tauri 전용) |

### Phase 2B 완료 기준 (Definition of Done)

- [ ] Tauri + Next.js 16 PoC 성공 (WebView에서 앱 정상 실행)
- [ ] Windows .msi/.exe 설치 파일 다운로드 가능
- [ ] 코드 서명 적용 (SmartScreen 경고 없음)
- [ ] .md 파일 더블클릭 → ModuMark 자동 실행
- [ ] Tauri 앱에서 광고 미노출 확인
- [ ] 세션 백업 동작 확인 (앱 재시작 후 탭 복원)

### Phase 2B 태스크 정의

> 아래 테이블이 shrimp-task-manager 태스크 생성의 Single Source of Truth이다.
> "Phase 2B 실행해줘" 명령 시 roadmap-planner 에이전트가 이 테이블을 읽어 태스크를 자동 생성한다.

#### Platform 도메인

| # | 태스크명 | PRD 근거 | 의존성 | 테스트 기준 | 참조 파일 |
|---|---------|---------|--------|-----------|----------|
| P2-0 | Tauri + Next.js 16 PoC | BRD A1 | Phase 1 완료 | Next.js 앱이 Tauri WebView에서 정상 실행, Tauri FS API로 .md 파일 읽기·쓰기 동작 확인 | src-tauri/, tauri.conf.json |
| P2-1 | Tauri 2.0 앱 빌드 (Windows) | PL-M8 | P2-0 | Windows .exe/.msi 빌드 성공, 앱 실행 정상 | src-tauri/ |
| P2-2 | 코드 서명 (Code Signing) | PL-M9 | P2-1 | SmartScreen 경고 없음, 서명 인증서 유효 | src-tauri/tauri.conf.json |
| P2-3 | .md 파일 연결 등록 | PL-M10 | P2-1 | .md 파일 더블클릭 → app.opened-files 이벤트 수신 → 탭 열기 | src-tauri/ |
| P2-4 | Tauri FS 로컬 파일 접근 | PL-M11 | P2-0 | .md 파일 읽기·쓰기·경로 처리 정상 | fileSystem.ts |
| P2-5 | GitHub Releases 배포 | PL-M12 | P2-2 | 빌드 파일 GitHub Releases에 업로드, 다운로드 링크 유효 | .github/workflows/ |
| P2-6 | 세션 백업 인프라 (Tauri) | PL-S7 | P2-4 | backup 디렉토리 자동 생성, `%APPDATA%/com.modumark/backup/` 경로 확인 | sessionBackup.ts |
| P2-7 | 앱 다운로드 안내 시스템 | PL-S8 | P2-1 | 웹 스토리지 한도 초과 시 안내 다이얼로그 표시, /download 페이지 CTA 연결 | DownloadPrompt.tsx |

#### Editor 도메인

| # | 태스크명 | PRD 근거 | 의존성 | 테스트 기준 | 참조 파일 |
|---|---------|---------|--------|-----------|----------|
| E2-4 | 세션 백업 시스템 (Tauri) | ED-S7 | P2-6 | 단위: 5초 debounce 후 .bak 생성, 명시적 저장 후 .bak 삭제. E2E: 강제 종료 후 재시작 시 탭 복원 | useSessionBackup.ts |

> **총 태스크 수**: Platform 8 + Editor 1 = **9개**

---

## 6. Phase 3: 기능 고도화

**목표 기간**: Phase 2 출시 후 지속
**핵심 목표**: 사용자 피드백 기반 기능 개선 및 수익 최적화.

### Phase 3 검토 기능

| 도메인 | 기능 |
|--------|------|
| **Editor** | Mermaid 다이어그램, 찾기·바꾸기, 이미지 드래그 앤 드롭 |
| **PDF** | PDF→마크다운 변환 |
| **Platform** | 자동 업데이터(Tauri), PWA, 다국어(영어) |
| **Monetization** | 광고 A/B 테스트, 수익 대시보드 |

### Phase 3 태스크 정의

> 아래 테이블이 shrimp-task-manager 태스크 생성의 Single Source of Truth이다.
> "Phase 3 실행해줘" 명령 시 roadmap-planner 에이전트가 이 테이블을 읽어 태스크를 자동 생성한다.

#### Editor 도메인

| # | 태스크명 | PRD 근거 | 의존성 | 테스트 기준 | 참조 파일 |
|---|---------|---------|--------|-----------|----------|
| E3-1 | Mermaid 다이어그램 | ED-C1 | Phase 2 완료 | Mermaid 문법 블록 렌더링 정상, 렌더링 오류 시 원본 코드 표시 | milkdownMermaid.ts |
| E3-2 | 찾기·바꾸기 | ED-C2 | Phase 2 완료 | Ctrl+F 패널 열림, 검색 하이라이트, 치환 동작 정상 | FindReplace.tsx |
| E3-3 | 이미지 드래그 앤 드롭 | ED-C3 | Phase 2 완료 | 에디터 영역에 이미지 드롭 → 마크다운 이미지 태그 삽입 | useImageDrop.ts |

#### PDF 도메인

| # | 태스크명 | PRD 근거 | 의존성 | 테스트 기준 | 참조 파일 |
|---|---------|---------|--------|-----------|----------|
| PF3-1 | PDF → 마크다운 변환 | PDF-C1 | Phase 2A 완료 | 단위: 텍스트 레이어 파싱 정확도, 마크다운 구조 변환 규칙. 통합: 변환 파이프라인 전체 흐름 | pdfToMarkdown.ts |

#### Platform 도메인

| # | 태스크명 | PRD 근거 | 의존성 | 테스트 기준 | 참조 파일 |
|---|---------|---------|--------|-----------|----------|
| P3-1 | 자동 업데이터 (Tauri) | PL-C1 | Phase 2B 완료 | 통합: 새 버전 감지 → 사용자 동의 → 자동 업데이트 설치 플로우 | src-tauri/tauri.conf.json |
| P3-2 | PWA (웹) | PL-C2 | Phase 1 완료 | 오프라인 캐싱 동작, 웹 앱 설치 가능 (Add to Home Screen) | next.config.ts, sw.ts |
| P3-3 | 다국어 UI (영어) | PL-C3 | Phase 1 완료 | 영어 UI 전환 가능, 모든 텍스트 번역 완료 | i18n/, messages/ |

#### Monetization 도메인

| # | 태스크명 | PRD 근거 | 의존성 | 테스트 기준 | 참조 파일 |
|---|---------|---------|--------|-----------|----------|
| M3-1 | 광고 A/B 테스트 | MON-C1 | Phase 2A 완료 | 단위: 그룹 할당 로직 정확성. 슬롯 위치·크기 조합 비교 가능 | abTest.ts |
| M3-2 | 수익 대시보드 | MON-C2 | M3-1 | AdSense API 연동, RPM·CTR 현황 확인 가능 | AdsDashboard.tsx |

> **총 태스크 수**: Editor 3 + PDF 1 + Platform 3 + Monetization 2 = **9개**

---

## 7. 도메인별 ROADMAP 연계

| 도메인 | ROADMAP 문서 |
|--------|------------|
| Editor | [docs/editor/ROADMAP.md](./editor/ROADMAP.md) |
| PDF | [docs/pdf/ROADMAP.md](./pdf/ROADMAP.md) |
| Platform | [docs/platform/ROADMAP.md](./platform/ROADMAP.md) |
| Monetization | [docs/monetization/ROADMAP.md](./monetization/ROADMAP.md) |

---

## 8. 마일스톤 검증 기준

### 8.1 Phase 1 완료 ✅

| 항목 | 결과 |
|------|------|
| 웹 서비스 구동 | Vercel 배포 완료 |
| 단위 테스트 | 47개 통과 |
| 빌드 | 성공 |

### 8.2 Phase 2A/2B 진입 조건

| 항목 | 기준 |
|------|------|
| 웹 서비스 안정성 | 크래시율 1% 미만 유지 |
| AdSense 신청 | AdSense 승인 신청 완료 (현재: `ca-pub-placeholder` → 실제 ID 교체 필요) |
| SEO 기반 | Google Search Console 인덱싱 확인 |
| Phase 2B 진입 추가 조건 | Tauri + Next.js 16 PoC(P2-0) 성공 |

### 8.3 전체 성공 지표 (출시 6개월)

| 지표 | 목표 |
|------|------|
| 웹 MAU | 10,000명 |
| Windows 앱 다운로드 | 5,000회 |
| AdSense 월 수익 | $200 이상 |
| 오가닉 검색 MAU | 3,000명 |
| NPS | 40 이상 |

---

## 문서 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| v1.0 | 2026-03-07 | 초안 작성 | 프로젝트 오너 |
| v1.1 | 2026-03-07 | Phase 2 통합 타임라인 업데이트: PDF 압축, 세션 백업, 웹 스토리지 한도 경고 추가 | 프로젝트 오너 |
| v1.2 | 2026-03-07 | Phase 1~3 태스크 정의 블록 추가 (도메인별 세부 항목, Single Source of Truth 확립) | 프로젝트 오너 |
| v2.0 | 2026-03-08 | Phase 1 완료 반영 (✅ 체크, 실제 구현 기능 기록). Phase 2 → 2A(웹)/2B(Tauri) 분리. P2-8(테마) 완료로 제거. PF3-2(썸네일) Phase 1 구현으로 제거. P2-0 Tauri+Next.js 16 PoC 신규 추가. 섹션 번호 재정렬 | 프로젝트 오너 |

---

*도메인별 상세 릴리즈 계획은 각 도메인 ROADMAP.md를 참조하세요.*
