---
name: requirements
description: |
  요구사항을 입력받아 DDD 도메인 분리 후 도메인별 BRD → PRD → ROADMAP을 자동 체이닝합니다.
  예: /requirements "OCR 기능 추가해줘"
  예: /requirements "PDF 압축과 워터마크 기능 추가"
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - Agent
  - WebSearch
  - WebFetch
  - mcp__context7__resolve-library-id
  - mcp__context7__query-docs
  - mcp__figma__get_figma_data
  - mcp__figma__download_figma_images
  - mcp__shrimp-task-manager__split_tasks
  - mcp__shrimp-task-manager__list_tasks
  - mcp__shrimp-task-manager__clear_all_tasks
---

# /requirements 스킬

요구사항을 입력받아 **DDD 도메인 분리 → 도메인별 BRD → PRD → ROADMAP** 전체를 자동으로 체이닝합니다.

## 사용법

```
/requirements "<요구사항 텍스트>"
```

### 예시
```
/requirements "OCR 기능 추가해줘"
/requirements "PDF 압축과 워터마크 기능 추가"
/requirements "사용자 인증 및 클라우드 저장 기능 필요"
```

---

## 실행 절차

### Step 0: 인자 파싱

`args`에서 요구사항 텍스트를 추출한다.

- `args`가 비어 있으면 아래 메시지를 출력하고 종료:
  ```
  오류: 요구사항을 입력해주세요.
  사용법: /requirements "<요구사항 텍스트>"
  예시: /requirements "OCR 기능 추가해줘"
  ```

---

### Step 1: 현황 파악

`Glob` 툴로 `docs/*/BRD.md` 패턴을 스캔하여 기존 도메인 목록을 파악한다.

각 도메인의 BRD.md 첫 10줄을 읽어 현재 버전을 확인한다.

기존 도메인 예시: `markdown`, `pdf`, `platform`, `monetization`

---

### Step 2: DDD 도메인 분석

`Agent(subagent_type: "ddd-architect")`를 호출하여 요구사항을 도메인으로 분리한다.

**ddd-architect 호출 프롬프트 템플릿:**

```
다음 요구사항을 분석하여 DDD 도메인별로 분리해주세요.

## 새 요구사항
{args}

## 현재 프로젝트 도메인 목록
{existing_domains}

## 분석 지시사항
1. 위 요구사항이 어느 도메인에 속하는지 판단한다
2. 기존 도메인에 해당하면 그 도메인에 할당
3. 기존 도메인에 없는 새 개념이면 새 도메인 이름을 정의
4. 하나의 요구사항이 여러 도메인에 걸칠 수 있음

## 출력 형식 (반드시 아래 JSON 포맷으로 출력)
```json
{
  "domains": [
    {
      "name": "pdf",
      "isNew": false,
      "requirements": ["PDF 압축 기능 추가", "파일 크기 50% 이하로 압축"]
    },
    {
      "name": "storage",
      "isNew": true,
      "requirements": ["클라우드 저장소 연동"]
    }
  ]
}
```

새 도메인(`isNew: true`)이면 `docs/{domain}/` 디렉토리도 생성해주세요.
```

ddd-architect의 JSON 출력을 파싱하여 도메인 목록을 추출한다.

---

### Step 3: 도메인별 BRD → PRD → ROADMAP 체이닝 (병렬)

식별된 각 도메인에 대해 **병렬**로 `Agent`를 호출한다.
각 Agent 내부에서는 **순차적**으로 아래 3개 서브에이전트를 호출한다.

#### 각 도메인 Agent 프롬프트 템플릿:

```
도메인: {domain_name}
신규 도메인 여부: {isNew}
반영할 요구사항: {domain_requirements}

아래 순서대로 처리하세요:

## 1단계: BRD 업데이트 (brd-specialist 에이전트 호출)

{isNew가 false인 경우}
- docs/{domain}/BRD.md를 읽어 현재 내용을 파악한다
- 새 요구사항을 비즈니스 목표/문제/이해관계자/성공 지표 관점으로 분석하여 증분 반영한다
- 버전 번호를 올린다 (예: v1.0 → v1.1)
- 문서 이력에 변경 사항을 기록한다

{isNew가 true인 경우}
- 새 도메인 docs/{domain}/BRD.md를 신규 작성한다
- 프로젝트 컨텍스트: ModuMark (마크다운 WYSIWYG + PDF 처리 통합 도구, 무료, 로컬 우선)
- v1.0으로 시작한다

## 2단계: PRD 업데이트 (prd-specialist 에이전트 호출)

- BRD 결과물을 컨텍스트로 활용한다
- docs/{domain}/PRD.md를 생성 또는 증분 업데이트한다
- 사용자 스토리, 기능 요구사항, MoSCoW 우선순위 포함

## 3단계: ROADMAP 업데이트 (roadmap-planner 에이전트 호출)

- PRD 결과물을 컨텍스트로 활용한다
- docs/{domain}/ROADMAP.md를 생성 또는 증분 업데이트한다
- Phase별 태스크 정의 테이블 포함 (shrimp-task-manager 형식)
- 기존 Phase가 있으면 새 Phase를 추가하거나 기존 Phase에 태스크를 병합한다

## 완료 후 결과 요약

아래 형식으로 결과를 반환하세요:
- 도메인: {domain_name}
- BRD: [신규생성|업데이트] - 주요 변경사항 1~3줄
- PRD: [신규생성|업데이트] - 주요 변경사항 1~3줄
- ROADMAP: [신규생성|업데이트] - 추가된 Phase/태스크 요약
```

---

### Step 4: 결과 요약 및 사용자 확인

모든 도메인 처리가 완료되면 아래 형식으로 결과를 출력한다:

```
## /requirements 실행 완료

**요구사항**: {args}

### 처리된 도메인

| 도메인 | BRD | PRD | ROADMAP |
|--------|-----|-----|---------|
| pdf    | v1.1 업데이트 | v1.1 업데이트 | Phase 3 추가 |
| storage | v1.0 신규 | v1.0 신규 | Phase 1 생성 |

### 주요 변경사항 요약
{각 도메인별 1~3줄 요약}
```

새 도메인이 추가된 경우 `docs/README.md`의 도메인 인덱스도 업데이트한다.

**⚠️ 여기서 반드시 멈추고 사용자에게 아래 질문을 한다:**

```
태스크를 생성하시겠습니까?

{식별된 각 도메인별로 아래 명령어를 나열}
- `/domain-tasks:create {domain1} {phase}` → {domain1} Phase {phase} 태스크 생성
- `/domain-tasks:create {domain2} {phase}` → {domain2} Phase {phase} 태스크 생성
```

---

### Step 5: 사용자 응답 처리

- 사용자가 **승인**하면(예/오케이/yes 등) → 해당 `/domain-tasks:create` 스킬을 호출한다
- 사용자가 **거절**하면(아니오/no 등) → 종료한다
- **절대로 사용자 확인 없이 태스크 생성이나 코드 구현으로 넘어가지 않는다**

---

## 설계 원칙

### 문서 업데이트 필수 원칙
- BRD → PRD → ROADMAP 문서 업데이트는 **항상** 수행한다
- "이미 문서화되어 있으니 건너뛸까요?" 같은 질문을 절대 하지 않는다
- 기존 문서에 이미 유사한 내용이 있더라도, 사용자가 결정한 구체적 사항(위치, 링크 대상 등)을 반영하여 증분 업데이트한다
- 문서 업데이트 없이 구현으로 넘어가는 것은 금지

### 도메인 간 병렬, 도메인 내 순차
- 도메인들은 독립적 → 병렬 처리로 속도 향상
- BRD → PRD → ROADMAP은 의존 관계 → 순차 처리

### 증분 업데이트 전략
- 기존 문서가 있으면 "읽고 → 반영 → 버전 증가" 방식
- 새 도메인이면 신규 작성 (v1.0)
- 문서 이력 섹션에 날짜·버전·변경 사항 기록

### 컨텍스트 전달
- BRD 결과 → PRD 에이전트에 전달
- PRD 결과 → ROADMAP 에이전트에 전달
- 각 에이전트가 이전 단계 문서를 직접 읽도록 지시

### ROADMAP 완료 후 정지 원칙 (CRITICAL)
- ROADMAP 업데이트가 끝나면 **반드시 멈추고** 사용자에게 다음 단계 진행 여부를 묻는다
- 사용자 승인 없이 `/domain-tasks:create`, 코드 구현, 파일 생성/수정을 절대 하지 않는다
- 이 스킬의 자동 범위는 BRD → PRD → ROADMAP **문서 작성까지**이다
- 구현(코드 파일 생성/수정)은 이 스킬의 범위 밖이다
