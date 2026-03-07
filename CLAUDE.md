# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 운영 규칙

1. **CLAUDE.md 자동 업데이트**: 대화 중 습득한 프로젝트 관련 지식(구조, 패턴, 결정사항 등)은 즉시 이 파일에 반영한다.
2. **프로젝트 레벨 리소스**: 서브에이전트, 스킬 등 생성 요청은 프로젝트 디렉토리(`.claude/`) 안에 생성한다.

## 작업 프로세스

순서를 반드시 준수한다:

1. **BRD** (Business Requirements Document) - 비즈니스 목표, 문제 정의, 이해관계자, 성공 지표
2. **PRD** (Product Requirements Document) - 기능 명세, 사용자 스토리, UI/UX 요구사항
3. **ROADMAP** - 단계별 릴리즈 계획, 우선순위, 마일스톤
4. **TASK** - shrimp-task-manager MCP 툴로 관리

## Phase 실행 규칙

- **"Phase N 실행해줘"** → roadmap-planner 에이전트가 `docs/ROADMAP.md`의 "Phase N 태스크 정의" 블록을 읽어 shrimp-task-manager 태스크 자동 생성 + 첫 태스크 실행 시작
- **Single Source of Truth**: 통합 ROADMAP의 "Phase N 태스크 정의" 테이블이 태스크 생성의 기준. 도메인 ROADMAP/PRD는 상세 보강에만 사용
- **첫 Phase 실행**: `split_tasks(updateMode: "clearAllTasks")` → 기존 태스크 초기화 후 생성
- **추가 Phase 실행**: `split_tasks(updateMode: "append")` → 기존 태스크 유지하고 추가


## 프로젝트 에이전트

`.claude/agents/`에 프로젝트 전용 서브에이전트를 관리한다.

| 에이전트 | 파일 | 역할 |
|---|---|---|
| brd-specialist | `.claude/agents/brd-specialist.md` | 비즈니스 목표/문제 정의, 이해관계자 분석, KPI 도출, docs/BRD.md + docs/{domain}/BRD.md 작성 |
| prd-specialist | `.claude/agents/prd-specialist.md` | 기능 명세, 사용자 스토리, MoSCoW 우선순위, Figma 참조, docs/PRD.md 작성 |
| ddd-architect | `.claude/agents/ddd-architect.md` | 도메인 분석, Bounded Context 식별, docs/{domain}/ 구조 설계 |
| roadmap-planner | `.claude/agents/roadmap-planner.md` | Phase 계획, 마일스톤 정의, shrimp-task-manager 태스크 생성/관리, 도메인별/전체 ROADMAP 작성 |
| ui-designer | `.claude/agents/ui-designer.md` | Figma 디자인 → shadcn/ui + Tailwind CSS 변환, 디자인 시스템 관리, Gap 분석 |
| unit-tester | `.claude/agents/unit-tester.md` | 단위 테스트 작성 및 검증 (Jest, Vitest) |
| integration-tester | `.claude/agents/integration-tester.md` | 통합 테스트 작성 및 검증 (API·모듈 간 연동) |
| e2e-tester | `.claude/agents/e2e-tester.md` | E2E 테스트 작성 및 검증 (Playwright, Visual Regression) |

## 문서 구조

DDD 원칙에 따라 도메인을 분리하여 문서를 관리한다.

```
docs/
├── BRD.md               # 전체 비즈니스 요구사항 (1개)
├── PRD.md               # 전체 제품 요구사항 (1개)
├── ROADMAP.md           # 전체 로드맵 (1개)
├── figma/               # Figma 디자인 시스템 문서
│   ├── screen-editor.png      # 에디터 화면 스크린샷 (노드 3:3)
│   ├── screen-pdf.png         # PDF Merge 화면 스크린샷 (노드 3:192)
│   ├── screen-pdf-split.png   # PDF Split 화면 스크린샷 (노드 3:363)
│   ├── screen-ocr.png         # OCR 화면 스크린샷 (노드 3:542)
│   ├── design-system.md       # 디자인 철학, 색상, 타이포그래피, 레이아웃
│   ├── design-tokens.md       # Figma 토큰 → CSS 변수 → Tailwind 클래스 매핑
│   ├── component-map.md       # Figma 컴포넌트 → shadcn/ui 매핑
│   ├── gap-analysis.md        # PRD ↔ Figma 차이 분석 및 결정사항
│   └── feature-proposals.md   # 사용자 결정 대기 기능 제안서
└── {domain}/            # 도메인별 하위 폴더 (editor, pdf, platform, monetization)
    ├── BRD.md           # 도메인별 비즈니스 요구사항
    ├── PRD.md           # 도메인별 제품 요구사항
    ├── ROADMAP.md       # 도메인별 릴리즈 계획
    └── domain-model.md  # 도메인 모델 (Aggregate, Entity, VO 등)
```

- 전체 큰 그림 문서(BRD, PRD, ROADMAP)는 `docs/` 바로 아래에 위치
- 도메인별 세부 문서(BRD, PRD, ROADMAP, domain-model)는 `docs/{domain}/` 하위에 위치
- Figma 디자인 시스템 문서는 `docs/figma/` 하위에 위치
- Task 관리는 shrimp-task-manager MCP 툴 사용

## 프로젝트 개요

**ModuMark** - 마크다운 WYSIWYG 편집기 + PDF 처리를 하나의 앱에서 무료로 제공하는 통합 문서 도구.

**핵심 가치**:
- **무료**: 핵심 기능 전체 무료, AdSense 광고로 수익 창출
- **통합**: 마크다운 편집 + PDF(뷰어·병합·분할·OCR·변환)
- **보안 (로컬 우선)**: 파일이 외부 서버에 전송·저장되지 않음. 기업 보안 정책 준수
- **탭 기반 다중 문서**: 여러 문서를 새 창 없이 탭으로 관리
- **크로스 플랫폼**: Next.js 웹 서비스 + Windows 데스크탑 앱 (Tauri 2.0)

**도메인**: Editor, PDF, Platform, Monetization

**현황**: 문서 체계 구축 완료 (BRD·PRD·ROADMAP·domain-model·Figma 디자인 시스템). 코드 구현 단계 대기 중.

## 기술 스택

- **Framework**: Next.js 15 (App Router), React 19
- **Language**: TypeScript (any 타입 사용 금지)
- **Styling**: Tailwind CSS
- **UI**: shadcn/ui
- **상태관리**: Zustand
- **폼**: React Hook Form + Zod

## 개발 명령어

프로젝트 셋업 후 사용할 명령어:

```bash
# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 린트
npm run lint

# 타입 체크
npx tsc --noEmit
```

## 코딩 규칙

- **들여쓰기**: 2칸
- **네이밍**: 변수/함수 camelCase, 컴포넌트 PascalCase
- **주석**: 한국어 (비즈니스 로직만)
- **커밋 메시지**: 한국어

## 디자인 시스템 규칙

- **Figma 파일 키**: `pvCZGg1rsozlzWXHCxRwfT`
- **다크 테마 기본**: `--background: #111921`, 라이트 테마 선택적
- **Primary 컬러**: `#1773CF` (파란색)
- **폰트**: Inter (UI), Liberation Mono (코드 블록)
- **CSS 변수 기반 테마**: shadcn/ui 컨벤션 준수 (`hsl(var(--variable))`)
- **Source of Truth**: PRD > Figma > Code
- **Figma 변경 시**: ui-designer 에이전트가 토큰/컴포넌트 동기화
- **Gap 분석**: `docs/figma/gap-analysis.md` 참조, 미결 사항은 `feature-proposals.md` 참조
- **Visual Regression**: Phase 완료 시 e2e-tester가 스크린샷 비교 (허용 오차 1%)
- **반응형**: 375px(모바일) / 768px(태블릿) / 1280px+(데스크탑) 필수 대응

## 아키텍처

- **레이어드 아키텍처**: Controller → Service → Repository
- **DTO 패턴** 사용
- **의존성 주입** 적용
- API 응답 형식 일관성 유지
- DB 트랜잭션 처리 필수
- 에러 핸들링 필수
- 반응형 UI 필수 (모바일 우선)
