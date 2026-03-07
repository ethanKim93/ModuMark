# Figma 수동 수정 체크리스트

Figma API 제약으로 자동 수정이 불가하여 Figma 앱에서 직접 수정해야 하는 항목 목록.

| 항목 | 내용 |
|------|------|
| 버전 | v1.0 |
| 작성일 | 2026-03-07 |
| Figma 파일 키 | `pvCZGg1rsozlzWXHCxRwfT` |
| 상태 | 수동 수정 대기 |

---

## 수정 필요 배경

`gap-analysis.md` 섹션 2·3에서 식별된 "PRD에 있고 Figma에 없는 기능" 및 feature-proposals 결정에 따라 Figma 디자인에 다음 항목을 반영해야 한다.

---

## 카테고리 1: feature-proposals 결정 반영 (PROPOSAL 기각/채택)

| # | 항목 | Figma 위치 | 작업 내용 | 우선순위 |
|---|------|-----------|---------|---------|
| FIG-001 | AI Floating Toolbar 제거 | 에디터 화면 (`3:3`) 내 AI 관련 노드 | AI Floating Toolbar 컴포넌트 노드 숨김 또는 삭제. PROPOSAL-001 기각 반영 | 높음 |
| FIG-002 | "PDF Tools Pro" → "PDF Power Tools" | PDF Merge 사이드바 (`3:192`) 섹션 레이블 텍스트 노드 | 텍스트를 "PDF Power Tools"로 변경. PROPOSAL-007 결정 반영 | 높음 |

---

## 카테고리 2: PRD 요구사항 → Figma 반영 (gap-analysis.md 섹션 2·3)

| # | 항목 | Figma 추가 위치 | 작업 내용 | 근거 |
|---|------|----------------|---------|------|
| FIG-003 | 미저장 탭 `●` 마커 | 에디터 탭바 (`3:3`) | 탭 이름 앞에 `●` 마커가 표시된 상태 디자인 추가 | E-BR9, gap-analysis.md 섹션 2 |
| FIG-004 | 탭 닫기 확인 Dialog | 에디터 화면 | 미저장 탭 닫기 시 확인 모달 컴포넌트 추가 (저장/취소/닫기 버튼) | E-BR3, E-BR9 |
| FIG-005 | Raw Markdown 전환 버튼 | 에디터 우상단 또는 상태바 | WYSIWYG ↔ Raw 모드 전환 토글 버튼 디자인 추가 | E-BR5, ED-S2 |
| FIG-006 | 모바일 레이아웃 (375px) | 에디터·PDF 화면 전체 | 사이드바 숨김, 하단 내비게이션 바 추가한 375px 화면 프레임 | 반응형 필수, PL-M6 |
| FIG-007 | 에디터 하단 상태바 | 에디터 화면 하단 | 단어 수·글자 수·저장 상태·WYSIWYG/Raw 전환 버튼 포함 상태바 디자인 | ED-S3 |
| FIG-008 | OCR 처리 진행률 Progress Bar | OCR 화면 (`3:542`) | OCR 처리 중 Progress Bar 컴포넌트 및 로딩 상태 화면 | PDF-M5 |
| FIG-009 | PDF 처리 진행률 오버레이 | PDF Merge·Split 화면 | 병합/분할 작업 중 진행률 오버레이 또는 Progress Bar 디자인 | PDF-M5 |

---

## 카테고리 3: PROPOSAL-005 채택 반영 (Storage UI 업데이트)

| # | 항목 | Figma 위치 | 작업 내용 | 근거 |
|---|------|-----------|---------|------|
| FIG-010 | Storage Indicator 경고 상태 | 에디터·PDF 사이드바 | 50MB 초과 시 빨간색 경고 상태 Storage Indicator 디자인 추가 | PROPOSAL-005 채택, ED-S8 |
| FIG-011 | 앱 다운로드 안내 다이얼로그 | 전역 모달 | "저장 공간이 부족합니다. 데스크탑 앱을 다운로드하세요." 형태의 Dialog 컴포넌트 | ED-S8, PL-S8 |

---

## 카테고리 4: PROPOSAL-006 채택 반영 (Learn More 링크)

| # | 항목 | Figma 위치 | 작업 내용 | 근거 |
|---|------|-----------|---------|------|
| FIG-012 | "Learn More" 링크 | 에디터 사이드바 Cloud Sync Disabled 배지 (`3:3`) | 배지 옆 또는 내부에 "Learn More" 링크 텍스트 추가 | PROPOSAL-006 채택, GAP-002 |

---

## 수정 완료 체크리스트

- [ ] FIG-001: AI Floating Toolbar 노드 제거
- [ ] FIG-002: "PDF Tools Pro" → "PDF Power Tools" 텍스트 변경
- [ ] FIG-003: 미저장 탭 `●` 마커 디자인
- [ ] FIG-004: 탭 닫기 확인 Dialog 컴포넌트
- [ ] FIG-005: Raw Markdown 전환 버튼
- [ ] FIG-006: 모바일 레이아웃 (375px) 프레임
- [ ] FIG-007: 에디터 하단 상태바
- [ ] FIG-008: OCR 처리 진행률 Progress Bar
- [ ] FIG-009: PDF 처리 진행률 오버레이
- [ ] FIG-010: Storage Indicator 경고 상태 디자인
- [ ] FIG-011: 앱 다운로드 안내 다이얼로그
- [ ] FIG-012: "Learn More" 링크 추가

---

## 참고 문서

- `docs/figma/gap-analysis.md` — Gap 분석 원문
- `docs/figma/feature-proposals.md` — 기능 제안 결정 내역
- `docs/figma/component-map.md` — 컴포넌트 매핑

---

## 문서 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| v1.0 | 2026-03-07 | feature-proposals 결정 및 gap-analysis 기반 체크리스트 초안 작성 |
