# Figma 기능 제안서 (사용자 결정 완료)

Figma 디자인에 있으나 PRD에 없고, 타당성 판단이 애매하여 사용자 결정이 필요한 기능 목록.

| 항목 | 내용 |
|------|------|
| 버전 | v1.1 |
| 작성일 | 2026-03-07 |
| 업데이트 | 2026-03-07 |
| 상태 | 결정 완료 |

---

## 결정 방법

각 제안에 대해 다음 중 하나를 선택해 주세요:
- **✅ 채택**: BRD/PRD에 반영하고 구현 로드맵에 포함
- **❌ 기각**: 현재 버전에서 제외 (Won't Have)
- **⏰ 보류**: 추후 재검토 (Phase N 이후 검토)

---

## PROPOSAL-001: AI 텍스트 편집 도구 (AI Floating Toolbar)

- **Figma 위치**: 에디터 화면 (`3:3`), 텍스트 선택 시 플로팅 툴바
- **Figma 표시 기능**:
  - Summarize (요약)
  - Translate (번역)
  - Improve Tone (어조 개선)
  - Refine Selection (선택 영역 다듬기)
- **설명**: 에디터에서 텍스트를 선택하면 플로팅 툴바가 나타나 AI 기반 텍스트 처리를 제공
- **예상 효과**: 마크다운 편집 생산성 향상, 글쓰기 보조 도구로서 차별화, 사용자 체류 시간 증가
- **구현 난이도**: 높음 (외부 AI API 연동 필요 - Claude API 또는 OpenAI API)
- **보안 영향**: 텍스트를 외부 AI 서버로 전송해야 함 → **로컬 우선 원칙과 충돌 가능**
  - 대안: 완전 로컬 AI 모델 (WebLLM 등) - 높은 구현 복잡도, 큰 모델 파일
  - 대안: 선택적 AI 기능 (사용자 동의 후 외부 API 사용)
- **추천 MoSCoW**: Could Have (Phase 3 이후)
- **사용자 결정**: ❌ **기각**
- **결정 메모**: 로컬 우선 원칙 충돌. AI 기능은 외부 서버로 텍스트 전송이 필수적이므로 핵심 보안 가치와 양립 불가. 구현 안 함.
- **Figma 처리**: 에디터 화면 AI Floating Toolbar 노드 숨김/삭제 필요 → `figma-update-checklist.md` 참조

---

## PROPOSAL-002: PDF 압축 (Compress PDF)

- **Figma 위치**: PDF Merge 화면 사이드바 네비게이션 (`3:192`)
- **설명**: PDF 파일 크기를 줄이는 압축 기능
- **예상 효과**: PDF 도구 완성도 향상, 알PDF 대체 관점에서 중요 기능, 용량 절약 필요 사용자 대응
- **구현 난이도**: 중간 (pdf-lib의 이미지 압축 지원 + 폰트 서브셋 적용)
- **리소스 영향**: 처리 시간 증가, 클라이언트 메모리 사용 증가
- **추천 MoSCoW**: Should Have (Phase 2)
- **사용자 결정**: ✅ **채택**
- **결정 메모**: Should Have (Phase 2) 확정. pdf-lib 이미지 압축 + 폰트 서브셋 방식으로 구현.
- **반영 문서**: `docs/pdf/BRD.md` (P-BR7), `docs/pdf/PRD.md` (PDF-S4), `docs/pdf/ROADMAP.md` (Phase 2)

---

## PROPOSAL-003: PDF to Word 변환 (PDF to Word)

- **Figma 위치**: PDF Merge 화면 사이드바 네비게이션 (`3:192`)
- **설명**: PDF 파일을 Word(.docx) 형식으로 변환
- **예상 효과**: 사무직 사용자(박지현)에게 높은 가치, PDF 도구 완성도 향상
- **구현 난이도**: 높음 (정확한 PDF→DOCX 변환은 매우 복잡. 텍스트 레이어 추출은 가능하나 레이아웃 재현 어려움)
- **대안 고려**: PDF → Markdown → (별도 도구로 DOCX 변환)으로 간접 지원
- **추천 MoSCoW**: Could Have (Phase 3) 또는 Won't Have
- **사용자 결정**: ❌ **기각**
- **결정 메모**: 정확한 레이아웃 재현이 기술적으로 어려움. 구현 안 함 (Won't Have).
- **반영 문서**: `docs/pdf/PRD.md` (Won't Have 섹션 추가)

---

## PROPOSAL-004: OCR LaTeX 내보내기

- **Figma 위치**: OCR 화면 기능 소개 (`3:542`)
- **설명**: OCR 결과를 LaTeX 형식으로 내보내기
- **예상 효과**: 학술 논문 작성 사용자(이수진)에게 가치, 수식 포함 문서 처리에 유용
- **구현 난이도**: 높음 (LaTeX 문법 변환 로직 복잡, 수식 인식 정확도 미지수)
- **사용자 규모**: 틈새 시장 (학술 사용자로 제한)
- **추천 MoSCoW**: Won't Have (현재 버전), Phase 3 이후 검토
- **사용자 결정**: ⏰ **보류**
- **결정 메모**: Phase 3 이후 재검토. 학술 사용자 수요가 확인되면 재평가. `docs/figma/future-review.md`로 이관.

---

## PROPOSAL-005: 에디터 화면 로컬 스토리지 용량 한도

- **Figma 위치**: 에디터 사이드바 (`3:3`)
- **Figma 표시**: "1.2 MB / 50 MB used" → 50MB 한도 암시
- **설명**: 로컬 스토리지 사용량에 상한선을 두고, 초과 시 경고
- **현황**: GAP-001에서 Storage Indicator 표시는 채택했으나, **50MB 한도**라는 구체적 수치는 결정 필요
- **고려사항**:
  - 브라우저 localStorage 기본 한도: 5MB (도메인당)
  - IndexedDB 사용 시 수GB 가능 (브라우저별 상이)
  - "50MB" 수치는 Figma 디자인용 임의 값일 수 있음
- **결정 필요 사항**: 실제 스토리지 한도 전략 (localStorage vs IndexedDB vs 파일 시스템 API)
- **사용자 결정**: ✅ **채택** — IndexedDB 50MB 소프트 한도

### 채택 결정 상세 전략

#### 웹 (브라우저) 환경
```
스토리지 전략:
- 저장소: IndexedDB (localStorage보다 큰 용량)
- 소프트 한도: 50MB (Figma 디자인 기준 채택)
- 한도 초과 시:
  1. 경고 배지 표시 (Storage Indicator에 빨간색 경고)
  2. 다이얼로그: "웹 브라우저 저장 공간이 부족합니다. 더 나은 환경을 위해 ModuMark 데스크탑 앱을 다운로드하세요."
  3. 앱 다운로드 링크/버튼 제공
- 한도 초과 후에도 작업은 차단하지 않음 (경고만)
```

#### 앱 (Tauri) 환경 — 세션 백업 파일 방식
```
세션 백업 전략 (Notepad++ 방식):
- 백업 위치: {APP_DATA_DIR}/backup/
  - Windows: %APPDATA%/com.modumark/backup/
- 동작 원리:
  1. 탭 열릴 때 백업 파일 생성 (tab_{uuid}.md.bak)
  2. 편집 시 5초 debounce로 백업 파일에 자동 저장
  3. 앱 종료 시 session.json에 열린 탭 목록 기록
  4. 앱 재시작 시 session.json → 백업 파일들로 탭 복원
  5. 명시적 "저장" → 실제 파일 저장 + 백업 삭제
  6. 탭 닫기 미저장 → 확인 다이얼로그 → 저장 안 함 시 백업 삭제
- 파일 구조:
  {APP_DATA_DIR}/backup/
  ├── session.json
  ├── tab_{uuid1}.md.bak
  └── tab_{uuid2}.md.bak
```

- **반영 문서**: `docs/editor/BRD.md` (E-BR11, E-BR12), `docs/editor/PRD.md` (ED-S7, ED-S8), `docs/platform/PRD.md` (PL-S7, PL-S8), 관련 ROADMAP

---

## PROPOSAL-006: "Learn More" 링크 (보안 정책 안내)

- **Figma 위치**: 에디터 사이드바 (`3:3`) - "Cloud Sync Disabled" 배지 옆
- **설명**: "Cloud Sync Disabled - Learn More" 형태로 보안 정책/개인정보 처리방침 링크 연결
- **예상 효과**: 보안 페르소나(최성호) 신뢰 강화, Platform BRD PL-BR9 (보안 안내 명시) 지원
- **구현 난이도**: 낮음 (단순 링크 연결)
- **추천 MoSCoW**: Should Have (Phase 1 포함 권장)
- **사용자 결정**: ✅ **채택**
- **결정 메모**: GAP-002에서 Cloud Sync Disabled 배지는 이미 채택됨. 배지에 "Learn More" 링크 추가. 보안 안내 페이지(`/security` 또는 `/privacy`)로 연결.
- **반영 문서**: `docs/editor/PRD.md` (ED-S6 또는 GAP-002 항목에 Learn More 링크 명시)

---

## PROPOSAL-007: PDF Merge 사이드바 "PDF Tools Pro" 섹션 이름

- **Figma 위치**: PDF Merge 사이드바 (`3:192`)
- **Figma 표시**: "PDF Tools Pro" 섹션 레이블
- **설명**: "Pro" 명칭이 유료 기능을 암시할 수 있어 ModuMark의 무료 원칙과 충돌 가능
- **현황**: 에디터 화면에서는 "PDF Power Tools"로 표시되어 화면 간 불일치 존재
- **사용자 결정**: **"PDF Power Tools"로 통일**
- **결정 메모**: "Pro" 명칭은 유료 서비스 연상. "PDF Power Tools"로 전체 통일. Figma 파일의 "PDF Tools Pro" 텍스트 → "PDF Power Tools"로 변경 필요.
- **반영 문서**: `docs/figma/component-map.md`, `docs/pdf/PRD.md` 네이밍 통일

---

## 결정 현황 요약

| 제안 ID | 기능 | 추천 MoSCoW | 결정 | 반영 도메인 |
|---------|------|------------|------|------------|
| PROPOSAL-001 | AI 플로팅 툴바 | Could Have | ❌ 기각 | 없음 (Won't Have) |
| PROPOSAL-002 | PDF 압축 | Should Have | ✅ 채택 (Phase 2) | pdf |
| PROPOSAL-003 | PDF to Word | Could Have / Won't Have | ❌ 기각 | pdf (Won't Have 명시) |
| PROPOSAL-004 | OCR LaTeX | Won't Have | ⏰ 보류 (Phase 3 이후) | future-review.md |
| PROPOSAL-005 | 스토리지 용량 한도 | 결정 필요 | ✅ 채택 (IndexedDB 50MB + Tauri 세션 백업) | editor, platform |
| PROPOSAL-006 | Learn More 링크 | Should Have | ✅ 채택 | editor |
| PROPOSAL-007 | PDF Tools 섹션 이름 | 네이밍 결정 | "PDF Power Tools"로 통일 | component-map, pdf/PRD |

---

## 캐스케이드 반영 체크리스트

- [x] feature-proposals.md 결정 상태 업데이트 (v1.1)
- [x] docs/figma/figma-update-checklist.md 생성 (Figma 수동 수정 목록)
- [x] docs/figma/future-review.md 생성 (PROPOSAL-004 이관)
- [x] docs/figma/gap-analysis.md GAP-004 업데이트 (v1.1)
- [x] docs/figma/component-map.md "PDF Power Tools" 통일
- [x] docs/pdf/BRD.md P-BR7 (PDF 압축) 추가
- [x] docs/editor/BRD.md E-BR11 (세션 백업), E-BR12 (웹 스토리지 한도) 추가
- [x] docs/pdf/PRD.md PDF-S4 (압축) + Won't Have (PDF to Word) 추가
- [x] docs/editor/PRD.md ED-S7 (세션 백업), ED-S8 (스토리지 한도), Learn More 반영
- [x] docs/platform/PRD.md PL-S7, PL-S8 추가
- [x] docs/pdf/ROADMAP.md Phase 2에 PDF 압축 추가
- [x] docs/editor/ROADMAP.md Phase 2에 세션 백업 + 스토리지 한도 추가
- [x] docs/platform/ROADMAP.md Phase 2에 세션 백업 인프라 추가
- [x] docs/ROADMAP.md 통합 타임라인 업데이트
- [x] .claude/agents 3개 파일에 캐스케이드 워크플로우 섹션 추가

---

## 문서 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| v1.0 | 2026-03-07 | Figma 4개 화면 Gap 분석 기반 초안 작성 |
| v1.1 | 2026-03-07 | 사용자 결정 반영: 001 기각, 002 채택, 003 기각, 004 보류, 005 채택, 006 채택, 007 "PDF Power Tools" 통일 |
