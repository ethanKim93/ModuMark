---
name: requirements
description: |
  요구사항을 입력받아 DDD 도메인 분리 후 도메인별 BRD → PRD → ROADMAP을 자동 체이닝합니다.
  --auto 옵션 사용 시 ROADMAP 완료 후 domain-tasks:auto까지 자동 실행합니다.
  예: /requirements "OCR 기능 추가해줘"
  예: /requirements "PDF 압축과 워터마크 기능 추가" --auto
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
  - mcp__shrimp-task-manager__execute_task
  - mcp__shrimp-task-manager__verify_task
  - mcp__shrimp-task-manager__get_task_detail
  - mcp__shrimp-task-manager__query_task
---

# /requirements 스킬

요구사항을 입력받아 **DDD 도메인 분리 → 도메인별 BRD → PRD → ROADMAP** 전체를 자동으로 체이닝합니다.

## 사용법

```
/requirements "<요구사항 텍스트>" [--auto]
```

### 예시
```
/requirements "OCR 기능 추가해줘"
/requirements "PDF 압축과 워터마크 기능 추가"
/requirements "사용자 인증 및 클라우드 저장 기능 필요" --auto
```

`--auto` 옵션: BRD → PRD → ROADMAP 완료 후 사용자 확인 없이 `domain-tasks:auto`까지 자동 실행

---

## 실행 절차

### Step 0: 인자 파싱

`args`에서 요구사항 텍스트와 옵션 플래그를 추출한다.

- `--auto` 플래그 여부를 먼저 확인한다 (`autoMode = args.includes('--auto')`)
- 요구사항 텍스트는 `--auto`를 제거한 나머지 문자열이다
- 요구사항 텍스트가 비어 있으면 아래 메시지를 출력하고 종료:
  ```
  오류: 요구사항을 입력해주세요.
  사용법: /requirements "<요구사항 텍스트>" [--auto]
  예시: /requirements "OCR 기능 추가해줘"
       /requirements "PDF 압축 기능 추가" --auto
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

### Step 4: 결과 요약 및 분기 처리

모든 도메인 처리가 완료되면 아래 형식으로 결과를 출력한다:

```
## /requirements 실행 완료

**요구사항**: {요구사항 텍스트}

### 처리된 도메인

| 도메인 | BRD | PRD | ROADMAP |
|--------|-----|-----|---------|
| pdf    | v1.1 업데이트 | v1.1 업데이트 | Phase 3 추가 |
| storage | v1.0 신규 | v1.0 신규 | Phase 1 생성 |

### 주요 변경사항 요약
{각 도메인별 1~3줄 요약}
```

새 도메인이 추가된 경우 `docs/README.md`의 도메인 인덱스도 업데이트한다.

---

#### 분기: `autoMode` 여부에 따라 다르게 처리

**`autoMode = false` (기본)**: 여기서 멈추고 사용자에게 아래 질문을 한다:

```
태스크를 생성하시겠습니까?

{식별된 각 도메인별로 아래 명령어를 나열}
- `/domain-tasks:create {domain1} {phase}` → {domain1} Phase {phase} 태스크 생성
- `/domain-tasks:create {domain2} {phase}` → {domain2} Phase {phase} 태스크 생성
```

**`autoMode = true` (`--auto` 플래그 있음)**: 사용자 확인 없이 Step 5로 즉시 진행한다.

---

### Step 5: 태스크 자동 실행 (--auto 전용)

`autoMode = false`이면 이 단계는 실행하지 않는다.

`autoMode = true`이면:

1. 식별된 도메인 목록을 순서대로 순회한다 (도메인이 여러 개면 **순차** 실행)
2. 각 도메인에 대해 `domain-tasks:auto` 스킬 로직을 그대로 수행한다:
   - `docs/{domain}/ROADMAP.md`에서 Phase 목록 추출
   - 첫 Phase: `updateMode: "clearAllTasks"`로 태스크 생성
   - 이후 Phase: `updateMode: "append"`로 태스크 생성
   - 각 Phase의 태스크를 의존성 순서대로 실행 → 검증 반복
   - 모든 Phase 완료 시 다음 도메인으로 이동
3. 모든 도메인 완료 후 최종 보고 출력:

```
## /requirements --auto 전체 완료

**요구사항**: {요구사항 텍스트}

| 도메인 | 처리된 Phase | 완료 태스크 수 |
|--------|------------|--------------|
| {domain1} | Phase 1, 2A | N개 |
| {domain2} | Phase 1 | N개 |
```

`autoMode = false`이고 사용자가 Step 4에서:
- **승인**하면(예/오케이/yes 등) → 해당 `/domain-tasks:create` 스킬을 호출한다
- **거절**하면(아니오/no 등) → 종료한다
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

### ROADMAP 완료 후 처리 원칙

**`--auto` 없는 경우 (기본)**:
- ROADMAP 업데이트가 끝나면 **반드시 멈추고** 사용자에게 다음 단계 진행 여부를 묻는다
- 사용자 승인 없이 태스크 생성이나 코드 구현으로 넘어가지 않는다

**`--auto` 있는 경우**:
- ROADMAP 완료 즉시 `domain-tasks:auto` 로직으로 자동 진행한다
- 사용자 확인 없이 태스크 생성 → 코드 구현 → 검증까지 완주한다
- 도메인이 여러 개면 순차적으로 처리한다
