# PRD ↔ Figma Gap 분석

PRD(제품 요구사항)와 Figma 디자인 간의 차이 분석 및 결정사항 기록.

| 항목 | 내용 |
|------|------|
| 버전 | v1.1 |
| 작성일 | 2026-03-07 |
| 업데이트 | 2026-03-07 |
| Figma 파일 키 | `pvCZGg1rsozlzWXHCxRwfT` |

---

## Gap 분석 원칙

```
PRD (기능 정의) ← 최상위 권한
  ↓
Figma (시각 디자인) ← 참조, 유동적 수정 가능
  ↓
Code (실제 구현) ← PRD 구현 + Figma 시각적 가이드
```

- **타당한 Gap**: BRD/PRD에 능동적으로 반영 → 이 문서에 "반영됨"으로 기록
- **애매한 Gap**: `feature-proposals.md`에 제안 형식으로 기록

---

## 1. Figma에만 있고 PRD에 없는 기능

### GAP-001: 로컬 스토리지 용량 표시 (Storage Indicator)

| 항목 | 내용 |
|------|------|
| **Figma 위치** | 에디터 사이드바 하단 (`3:3`), PDF 사이드바 (`3:192`) |
| **Figma 표시** | "1.2 MB / 50 MB used" (에디터), "640 MB of 1 GB used" (PDF) |
| **현재 PRD** | 스토리지 표시 기능 미정의 |
| **결정** | **반영됨** (타당 판단) |
| **근거** | 로컬 우선 아키텍처 특성상 사용자가 로컬 데이터 사용량을 인지하는 것이 중요. 보안 페르소나(최성호)가 데이터가 로컬에만 있음을 시각적으로 확인하는 데 도움. |
| **반영 위치** | `docs/editor/PRD.md`, `docs/platform/PRD.md` (Should Have) |
| **구현 방식** | IndexedDB 또는 localStorage.length 기반 사용량 계산, Progress 컴포넌트로 표시 |

### GAP-002: Cloud Sync Disabled 배지

| 항목 | 내용 |
|------|------|
| **Figma 위치** | 에디터 사이드바 (`3:3`) |
| **Figma 표시** | "Cloud Sync Disabled" 배지 |
| **현재 PRD** | 명시 없음 (로컬 우선 원칙은 BRD에 있으나 UI 표시 미정의) |
| **결정** | **반영됨** (타당 판단) |
| **근거** | BRD 보안 가치 제안 강화. 기업 보안 사용자(최성호)에게 "이 앱은 클라우드에 데이터를 보내지 않는다"는 시각적 보증이 핵심 차별점. Platform BRD의 PL-BR9 규칙 ("보안 안전한 로컬 우선 아키텍처를 제품 소개 페이지에 명시")과 연계. |
| **반영 위치** | `docs/editor/PRD.md` (Should Have) |
| **구현 방식** | 항상 표시되는 정적 배지 (상태 변경 없음, 디자인적 안심 요소) |

### GAP-003: "Saved to Local Storage" 저장 확인 배지

| 항목 | 내용 |
|------|------|
| **Figma 위치** | 에디터 사이드바 또는 하단 상태 표시줄 (`3:3`) |
| **Figma 표시** | "Saved to Local Storage" 성공 배지 (초록색) |
| **현재 PRD** | 자동 저장 기능은 BRD에 있으나, 저장 확인 UI 표시 미정의 |
| **결정** | **반영됨** (타당 판단) |
| **근거** | E-BR2 (30초 자동 저장) 구현 시 사용자 피드백 필수. "클라우드가 아닌 로컬에 저장됨"을 명시하여 보안 가치 강화. |
| **반영 위치** | `docs/editor/PRD.md` (Must Have - 저장 상태 표시) |
| **구현 방식** | 자동 저장 성공 시 토스트 또는 배지로 3초간 표시 후 사라짐 |

### GAP-004: PDF Merge 화면 - Compress PDF, PDF to Word 메뉴

| 항목 | 내용 |
|------|------|
| **Figma 위치** | PDF Merge 사이드바 네비게이션 (`3:192`) |
| **Figma 표시** | "Compress PDF", "PDF to Word" 메뉴 항목 |
| **현재 PRD** | PDF 도메인 BRD/PRD에 미포함 |
| **결정** | **Compress PDF → 채택** / **PDF to Word → 기각** |
| **근거 (Compress PDF)** | PROPOSAL-002 사용자 채택 결정. pdf-lib 이미지 압축 + 폰트 서브셋 방식으로 Phase 2에 구현. `docs/pdf/PRD.md` Should Have (PDF-S4) 반영. |
| **근거 (PDF to Word)** | PROPOSAL-003 사용자 기각 결정. 정확한 레이아웃 재현이 기술적으로 어려움. `docs/pdf/PRD.md` Won't Have 추가. |
| **반영 위치** | `docs/pdf/BRD.md` (P-BR7), `docs/pdf/PRD.md` (PDF-S4, Won't Have), `docs/pdf/ROADMAP.md` (Phase 2) |

### GAP-005: PDF Split - Split Mode 옵션 세분화

| 항목 | 내용 |
|------|------|
| **Figma 위치** | PDF Split 화면 (`3:363`) |
| **Figma 표시** | "Split into multiple ranges", "Every X Pages", "Extract Pages" 3가지 모드 |
| **현재 PRD** | PDF 도메인 BRD에 "특정 페이지 범위 추출하여 새 PDF 생성"으로 단순 정의 |
| **결정** | **반영됨** (타당 판단) |
| **근거** | 사용 시나리오가 다양함 (특정 페이지 추출 vs 균등 분할 vs 범위 지정). 알PDF 대체 관점에서 이 세분화는 타당. |
| **반영 위치** | `docs/pdf/PRD.md` (Should Have - Split 모드 세분화) |
| **구현 방식** | pdf-lib의 PDFDocument.copyPages() API로 3가지 모드 모두 구현 가능 |

### GAP-006: OCR 화면 - 다국어 지원 (12+ languages)

| 항목 | 내용 |
|------|------|
| **Figma 위치** | OCR 화면 (`3:542`) |
| **Figma 표시** | "Multilingual support (12+ languages)" 기능 소개 문구 |
| **현재 PRD** | PDF BRD에 "한국어 OCR 정확도 80% 이상" 목표만 명시 |
| **결정** | **반영됨** (부분적) |
| **근거** | Tesseract.js가 기본적으로 100+ 언어 모델을 지원함. 영어+한국어 기본 지원은 Must Have, 추가 언어는 Could Have로 분류. |
| **반영 위치** | `docs/pdf/PRD.md` (영어+한국어 기본 → Must Have, 추가 언어 선택 → Could Have) |

### GAP-007: OCR 화면 - Markdown/HTML/LaTeX 내보내기

| 항목 | 내용 |
|------|------|
| **Figma 위치** | OCR 화면 기능 소개 (`3:542`) |
| **Figma 표시** | "Export to Markdown, HTML, and LaTeX" |
| **현재 PRD** | PDF BRD에 "PDF OCR → 텍스트 추출" 수준으로만 정의 |
| **결정** | **반영됨** (부분적) |
| **근거** | Markdown 내보내기는 ModuMark 핵심 워크플로우(OCR → 에디터로 가져오기)와 직결. HTML은 Should Have, LaTeX는 feature-proposals.md로 이관. |
| **반영 위치** | `docs/pdf/PRD.md` (MD 내보내기 Must Have, HTML Should Have, LaTeX → feature-proposals.md) |

### GAP-008: OCR 화면 - 다른 레이아웃 (TopNavBar)

| 항목 | 내용 |
|------|------|
| **Figma 위치** | OCR 화면 (`3:542`) |
| **Figma 표시** | 사이드바 없이 상단 TopNavBar 레이아웃 |
| **현재 PRD** | Platform PRD에 일관된 레이아웃 요구사항 없음 |
| **결정** | **반영됨** (타당 판단) |
| **근거** | OCR은 화면 전체를 Original/Output 2분할로 사용해야 최적 UX. 사이드바가 없어야 작업 공간 확보. 다른 PDF 도구와 레이아웃 다양성 자체가 도구별 UX 최적화. |
| **반영 위치** | `docs/platform/PRD.md` (OCR 화면 전용 레이아웃 명시) |

---

## 2. PRD에 있고 Figma에 없는 기능 (Figma 업데이트 필요)

| PRD 기능 | 설명 | Figma 업데이트 필요 여부 |
|----------|------|----------------------|
| 미저장 탭 닫기 확인 다이얼로그 | E-BR9 | 예 - Dialog 컴포넌트 추가 |
| 중복 탭 열기 방지 (E-BR10) | 기존 탭으로 포커스 이동 | 시각적 표현 검토 필요 |
| Raw Markdown 편집 모드 (E-BR5) | WYSIWYG ↔ Raw 전환 버튼 | 예 - 탭바에 전환 버튼 추가 |
| 단어/글자 수 표시 | 에디터 하단 상태 표시줄 | 예 - 에디터 하단 상태바 추가 |
| OCR 진행률 표시 | 처리 중 Progress Bar | 예 - 로딩 상태 디자인 추가 |
| 반응형 모바일 (375px) | 사이드바 숨김 레이아웃 | 예 - 모바일 화면 추가 필요 |
| PDF 처리 진행률 표시 | 병합/분할 작업 중 | 예 - 작업 진행 상태 UI |

---

## 3. Figma 수정 요청 목록 (코드 → Figma 방향)

다음 사항은 Figma 디자인이 PRD 요구사항을 아직 반영하지 않은 부분이다. 다음 동기화 시 Figma 수정 요청:

1. **미저장 탭 표시**: 탭 이름에 `●` 마커 표시 디자인
2. **탭 닫기 확인 Dialog**: 미저장 상태 확인 모달
3. **Raw Markdown 전환 버튼**: 에디터 우상단 토글 버튼
4. **모바일 레이아웃 (375px)**: 사이드바 숨김, 하단 내비게이션
5. **에디터 하단 상태바**: 단어 수, 저장 상태
6. **OCR 처리 진행률**: 스캔 중 Progress Bar
7. **PDF 처리 진행률**: 병합/분할 작업 중 오버레이 또는 진행 표시

---

## 4. 디자인 토큰 불일치 없음

Figma의 색상, 폰트, 간격 값이 `design-tokens.md`에 완전히 반영되었음을 확인:
- [x] 색상 12개 + RGBA 4개 모두 매핑 완료
- [x] Inter 폰트 스케일 (10px~20px) 매핑 완료
- [x] 간격 토큰 매핑 완료
- [x] Liberation Mono (코드 블록용) 추가 확인 필요 (Figma에 명시 없음, PRD에서 지정)

---

## 5. 결정 요약

| Gap ID | 기능 | 결정 | 반영 위치 |
|--------|------|------|---------|
| GAP-001 | 스토리지 표시 | 반영됨 | editor/PRD.md, platform/PRD.md |
| GAP-002 | Cloud Sync Disabled 배지 | 반영됨 | editor/PRD.md |
| GAP-003 | 저장 확인 배지 | 반영됨 | editor/PRD.md |
| GAP-004 | Compress PDF | 채택 (Phase 2) | pdf/BRD.md (P-BR7), pdf/PRD.md (PDF-S4), pdf/ROADMAP.md |
| GAP-004b | PDF to Word | 기각 (Won't Have) | pdf/PRD.md (Won't Have) |
| GAP-005 | Split 모드 세분화 | 반영됨 | pdf/PRD.md |
| GAP-006 | OCR 다국어 지원 | 부분 반영 | pdf/PRD.md |
| GAP-007 | OCR MD/HTML/LaTeX 내보내기 | MD Must/HTML Should 반영, LaTeX proposals | pdf/PRD.md |
| GAP-008 | OCR TopNavBar 레이아웃 | 반영됨 | platform/PRD.md |

---

## 문서 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| v1.0 | 2026-03-07 | Figma 4개 화면 전체 스캔 기반 Gap 분석 초안 작성 |
| v1.1 | 2026-03-07 | GAP-004 사용자 결정 반영: Compress PDF 채택, PDF to Word 기각 |
