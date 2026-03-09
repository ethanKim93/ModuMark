---
name: domain-tasks:create
description: |
  도메인 ROADMAP의 특정 Phase 태스크 정의 테이블을 파싱하여 shrimp-task-manager에 태스크를 자동 생성합니다.
  예: /domain-tasks:create markdown 2 → docs/markdown/ROADMAP.md의 Phase 2 태스크 정의 블록을 읽어 태스크 일괄 생성.
  Phase 생략 시: /domain-tasks:create pdf → 다음 미착수 Phase 자동 감지하여 태스크 생성.
  옵션: --clear 플래그 사용 시 기존 태스크 전체 삭제 후 생성 (기본값: append)
allowed-tools:
  - Read
  - Glob
  - Grep
  - mcp__shrimp-task-manager__split_tasks
  - mcp__shrimp-task-manager__list_tasks
---

# domain-tasks:create 스킬

## 사용법

```
/domain-tasks:create {domain} [phase] [--clear]
```

**예시:**
- `/domain-tasks:create markdown 2` → markdown 도메인 Phase 2 태스크 생성 (append)
- `/domain-tasks:create pdf --clear` → pdf 도메인 다음 미착수 Phase 자동 감지, 기존 전체 삭제 후 생성
- `/domain-tasks:create platform 3` → platform 도메인 Phase 3 태스크 생성 (append)
- `/domain-tasks:create pdf` → 다음 미착수 Phase 자동 감지하여 태스크 생성

---

## 실행 절차

### 1단계: 인자 파싱

입력된 인자를 파싱한다:
- `{domain}`: 첫 번째 인자 (markdown / pdf / platform / monetization)
- `{phase}`: 두 번째 인자 (선택 — 생략 시 자동 감지 모드)
- `--clear` 플래그 여부: 있으면 `updateMode: "clearAllTasks"`, 없으면 `updateMode: "append"`

도메인이 누락된 경우 즉시 중단하고 사용법을 출력한다. Phase 생략 시 1.5단계(자동 감지)로 진행한다.

### 1.5단계: Phase 자동 감지 (phase 인자 생략 시)

`docs/{domain}/ROADMAP.md`를 읽어 다음 실행 대상 Phase를 결정한다.

**감지 로직:**
1. 모든 Phase 헤더를 순서대로 파싱 (패턴: `## Phase {N}: {이름}` 또는 `## Phase {N}:`)
2. 각 Phase 상태 판별:
   - **완료**: 헤더에 `✅ 완료` 또는 완료 기준 체크박스 전부 `[x]`
   - **미착수**: 완료가 아닌 Phase
3. **첫 번째 미착수 Phase** 선택
   - 태스크 정의 테이블이 있으면 → 진행
   - 없으면 → 에러: "Phase {N}에 태스크 정의 테이블이 없습니다"
4. 결과 출력:
   ```
   자동 감지: {domain} → Phase {N}: {이름}
   (완료: Phase 1, Phase 2)
   ```

### 2단계: ROADMAP.md 읽기 및 태스크 테이블 파싱

`docs/{domain}/ROADMAP.md` 파일을 읽는다.

"Phase {phase} 태스크 정의" 섹션을 찾아 마크다운 테이블을 파싱한다.
테이블 컬럼 구조 (일반적):

| 태스크ID | 태스크명 | 설명 | 의존성 | 우선순위 | 예상시간 |
|---------|---------|------|-------|---------|---------|

파싱 규칙:
- 헤더 행(`|---|`) 제외
- 빈 셀(`-`)은 빈 배열 또는 기본값으로 처리
- 의존성 셀: 쉼표 구분 태스크ID 목록 → 해당 태스크명으로 매핑
  - "Phase N 완료" 형태 → 빈 배열 (이전 Phase는 이미 완료됨)
  - 같은 배치 내 태스크ID (예: E2-1) → 해당 태스크의 `name` 필드값으로 변환

### 3단계: PRD.md 읽기 (보강용)

`docs/{domain}/PRD.md` 파일을 읽는다.

각 태스크의 구현 지침(`implementationGuide`)을 보강하는 데 사용한다:
- 태스크명과 관련된 기능 명세 섹션을 찾아 상세 요구사항 추출
- 기술적 제약사항, API 스펙, UI/UX 요구사항 등 포함

### 4단계: split_tasks 호출

파싱한 테이블을 바탕으로 `mcp__shrimp-task-manager__split_tasks`를 호출한다.

**태스크 변환 규칙:**

각 테이블 행 → tasks 배열의 태스크 객체:

```json
{
  "name": "[{Domain}] Phase{phase}: {태스크명}",
  "description": "{설명}\n\ndomain: {domain} | phase: {phase} | priority: {우선순위}",
  "notes": "domain: {domain} | phase: {phase} | priority: {우선순위} | estimated: {예상시간}",
  "dependencies": ["{의존 태스크명1}", "{의존 태스크명2}"],
  "implementationGuide": "{PRD에서 추출한 관련 구현 지침}",
  "relatedFiles": [
    {
      "path": "docs/{domain}/ROADMAP.md",
      "type": "REFERENCE",
      "description": "Phase {phase} 태스크 정의 원본"
    },
    {
      "path": "docs/{domain}/PRD.md",
      "type": "REFERENCE",
      "description": "기능 요구사항 명세"
    }
  ],
  "verificationCriteria": "{완료 조건 - ROADMAP 테이블의 완료 기준 컬럼 또는 PRD에서 추출}"
}
```

**Domain 표기 규칙:**
- `markdown` → `[Markdown]`
- `pdf` → `[PDF]`
- `platform` → `[Platform]`
- `monetization` → `[Monetization]`

**split_tasks 호출 파라미터:**
```json
{
  "tasks": [...],
  "updateMode": "append" // 또는 "clearAllTasks" (--clear 플래그 시)
}
```

### 5단계: 결과 요약 출력

`mcp__shrimp-task-manager__list_tasks`로 현재 태스크 목록을 조회하여 결과를 출력한다.

출력 형식:
```
## {Domain} Phase {phase} 태스크 생성 완료

**모드**: append / clearAllTasks
**생성된 태스크 수**: N개

| # | 태스크명 | 우선순위 | 의존성 |
|---|---------|---------|-------|
| 1 | [Markdown] Phase2A: ... | must-have | - |
| 2 | [Markdown] Phase2A: ... | should-have | Task 1 |

**다음 단계**: `/domain-tasks:run {domain}` 으로 태스크 실행 시작
```

---

## 설계 결정

- `plan_task` → `analyze_task` → `reflect_task` 단계 생략: ROADMAP 테이블이 이미 분석 결과물이므로 직접 `split_tasks` 호출
- 기본 모드는 `append`: 여러 Phase를 순차적으로 추가할 때 기존 태스크 보존
- `--clear` 옵션: 처음 시작하거나 태스크를 완전히 재설정할 때 사용
- 태스크명에 `[{Domain}] Phase{phase}:` 접두사 부착: `list_tasks` 조회 시 도메인/Phase 필터링 용이
