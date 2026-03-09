# ModuMark 문서 인덱스

**ModuMark** - 마크다운 WYSIWYG 편집기 + PDF 처리를 하나의 앱에서 무료로 제공하는 통합 문서 도구.

## 도메인 문서

| 도메인 | BRD | PRD | ROADMAP | 도메인 모델 |
|--------|-----|-----|---------|------------|
| [markdown/](markdown/) | [BRD](markdown/BRD.md) | [PRD](markdown/PRD.md) | [ROADMAP](markdown/ROADMAP.md) | [domain-model](markdown/domain-model.md) |
| [pdf/](pdf/) | [BRD](pdf/BRD.md) | [PRD](pdf/PRD.md) | [ROADMAP](pdf/ROADMAP.md) | [domain-model](pdf/domain-model.md) |
| [platform/](platform/) | [BRD](platform/BRD.md) | [PRD](platform/PRD.md) | [ROADMAP](platform/ROADMAP.md) | [domain-model](platform/domain-model.md) |
| [monetization/](monetization/) | [BRD](monetization/BRD.md) | [PRD](monetization/PRD.md) | [ROADMAP](monetization/ROADMAP.md) | [domain-model](monetization/domain-model.md) |

## 파일 설명

| 파일 | 설명 |
|------|------|
| `BRD.md` | 비즈니스 요구사항 — 비즈니스 목표, 이해관계자, KPI |
| `PRD.md` | 제품 요구사항 — 기능 명세, 사용자 스토리, MoSCoW 우선순위 |
| `ROADMAP.md` | 릴리즈 계획 — Phase별 기능 범위, 완료 기준, **태스크 정의** |
| `domain-model.md` | 도메인 모델 — Aggregate, Entity, Value Object, 도메인 이벤트 |

## Figma 디자인 시스템

`docs/figma/` — 디자인 토큰, 컴포넌트 매핑, Gap 분석

## Phase 현황

| Phase | 상태 | 도메인 |
|-------|------|--------|
| Phase 1 | 완료 | Markdown, PDF, Platform, Monetization |
| Phase 2A | 진행 예정 | Markdown (편집기 완성도), PDF (OCR + 압축 + 뷰어 개선) |
| Phase 2B | 대기 | Markdown (Tauri 세션 백업), PDF (Tauri FS 최적화) |
| Phase 3 | 대기 | Markdown (LaTeX, 파일 트리), PDF (고급 변환) |
