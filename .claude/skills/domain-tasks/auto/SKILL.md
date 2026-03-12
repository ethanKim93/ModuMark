---
name: domain-tasks:auto
description: |
  특정 도메인의 모든 Phase를 자동으로 순회하며 태스크 생성 → 실행을 연속 체이닝합니다.
  예: /domain-tasks:auto markdown → markdown 도메인의 Phase를 처음부터 끝까지 자동 완주.
  각 Phase는 domain-tasks:create → domain-tasks:run 순서로 처리되고 완료 후 다음 Phase로 이동합니다.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - mcp__shrimp-task-manager__list_tasks
  - mcp__shrimp-task-manager__split_tasks
  - mcp__shrimp-task-manager__execute_task
  - mcp__shrimp-task-manager__verify_task
  - mcp__shrimp-task-manager__get_task_detail
  - mcp__shrimp-task-manager__query_task
---

# domain-tasks:auto 스킬

## 사용법

```
/domain-tasks:auto {domain} [startPhase] [--clear]
```

**예시:**
- `/domain-tasks:auto markdown` → markdown 도메인의 미착수 Phase부터 끝까지 자동 실행
- `/domain-tasks:auto pdf 2A` → pdf 도메인의 Phase 2A부터 자동 실행
- `/domain-tasks:auto platform 1 --clear` → 기존 태스크 초기화 후 Phase 1부터 자동 실행

---

## 실행 절차

### 0단계: 인자 파싱

입력된 인자를 파싱한다:
- `{domain}`: 첫 번째 인자 (markdown / pdf / platform / monetization)
- `[startPhase]`: 두 번째 인자 (선택, 예: 1, 2A, 2B, 3). 생략 시 ROADMAP에서 자동 감지
- `--clear` 플래그 여부: 첫 Phase에만 `updateMode: "clearAllTasks"` 적용

`{domain}`이 누락된 경우 즉시 중단하고 사용법을 출력한다.

### 1단계: ROADMAP.md에서 Phase 목록 추출

`docs/{domain}/ROADMAP.md` 파일을 읽는다.

다음 패턴으로 모든 Phase를 추출한다:
- `### Phase {N}` 또는 `### Phase {N}{알파벳}` 형식 (예: Phase 1, Phase 2A, Phase 2B, Phase 3)
- 추출된 Phase를 순서대로 배열로 구성: `["1", "2A", "2B", "3", ...]`

`[startPhase]` 인자가 있으면 해당 Phase부터 시작한다.
`[startPhase]`가 없으면 `mcp__shrimp-task-manager__list_tasks`로 현재 completed 태스크를 확인하여 마지막으로 완료된 Phase의 다음 Phase부터 시작한다.
- 완료된 태스크가 없으면 첫 번째 Phase부터 시작

시작 Phase를 출력한다:
```
## {Domain} 도메인 자동 실행 시작

**전체 Phase 목록**: {phaseList}
**시작 Phase**: Phase {startPhase}
**실행 모드**: --clear / append
```

### 2단계: Phase 루프 실행

추출된 Phase 목록을 순서대로 순회하며 다음을 반복한다:

---

#### 2-1: 현재 Phase 태스크 생성 (`domain-tasks:create` 로직)

`docs/{domain}/ROADMAP.md`에서 현재 Phase의 "Phase {N} 태스크 정의" 테이블을 파싱한다.

`mcp__shrimp-task-manager__split_tasks`를 호출한다:
- 첫 번째 Phase이고 `--clear` 플래그가 있으면 `updateMode: "clearAllTasks"`
- 그 외 모든 경우는 `updateMode: "append"`

태스크 변환 규칙 (`domain-tasks:create` 스킬과 동일):

```json
{
  "name": "[{Domain}] Phase{phase}: {태스크명}",
  "description": "{설명}\n\ndomain: {domain} | phase: {phase} | priority: {우선순위}",
  "notes": "domain: {domain} | phase: {phase} | priority: {우선순위} | estimated: {예상시간}",
  "dependencies": ["{의존 태스크명1}", "{의존 태스크명2}"],
  "implementationGuide": "{PRD에서 추출한 관련 구현 지침}",
  "relatedFiles": [
    { "path": "docs/{domain}/ROADMAP.md", "type": "REFERENCE", "description": "Phase {phase} 태스크 정의 원본" },
    { "path": "docs/{domain}/PRD.md", "type": "REFERENCE", "description": "기능 요구사항 명세" }
  ],
  "verificationCriteria": "{완료 조건}"
}
```

생성 완료 후 출력:
```
### Phase {N} 태스크 생성 완료 (N개)
```

---

#### 2-2: 현재 Phase 태스크 순차 실행 (`domain-tasks:run` 로직)

현재 Phase의 모든 pending 태스크가 완료될 때까지 다음을 반복한다:

**2-2-A: 실행 가능 태스크 선택**

`mcp__shrimp-task-manager__list_tasks`로 현재 도메인 + 현재 Phase의 태스크를 필터링한다.
- 필터: 태스크명에 `[{Domain}] Phase{N}:` 포함
- pending 태스크 중 모든 의존성이 `completed`인 태스크 선택

실행 가능한 태스크가 없으면:
- pending 태스크가 0개 → 현재 Phase 완료 → 다음 Phase로 이동 (2단계 루프 계속)
- pending 태스크가 있지만 의존성 미충족 → **즉시 중단**, 상세 내용 출력

**2-2-B: 태스크 실행**

`mcp__shrimp-task-manager__get_task_detail`로 상세 정보 조회 후 실행 내용 출력:
```
#### 실행 중: {태스크명}
**완료 기준**: {verificationCriteria}
```

`mcp__shrimp-task-manager__execute_task`로 태스크를 실행 상태로 전환한다.

반환된 구현 지침에 따라 **실제 코드 구현**을 수행한다:
- Read/Glob/Grep으로 관련 파일 탐색
- Write/Edit으로 코드 작성 및 수정
- Bash로 빌드 검증, 테스트 실행

**2-2-C: 태스크 검증**

`mcp__shrimp-task-manager__verify_task`를 호출한다:

```json
{
  "taskId": "{taskId}",
  "summary": "구현 완료 요약:\n- 변경 파일: ...\n- 핵심 변경사항: ...\n- 검증 결과: ..."
}
```

- 성공(approved) → 완료 기록 후 2-2-A로 돌아가 반복
- 실패(rejected) → **즉시 전체 중단**, 실패 원인 출력

---

#### 2-3: Phase 완료 처리

현재 Phase의 모든 태스크 완료 시 출력:
```
### Phase {N} 완료 ✓ (N개 태스크)
다음 Phase로 이동: Phase {N+1}
```

다음 Phase가 있으면 2단계 루프 계속.
마지막 Phase까지 완료하면 3단계로 이동.

---

### 3단계: 최종 보고

```
## {Domain} 도메인 전체 실행 완료

**처리된 Phase**: {완료된 Phase 목록}
**총 완료 태스크**: N개

| Phase | 태스크 수 | 상태 |
|-------|---------|------|
| Phase 1 | N개 | completed |
| Phase 2A | N개 | completed |
| ... | ... | ... |

**빌드 상태**: 최종 `npm run build` 결과
```

---

## 중단 규칙

다음 상황에서 즉시 전체 실행을 중단한다 (자동 재시도 금지):

1. **verify_task 실패**: 검증 실패 원인 상세 출력 후 중단
2. **Bash 명령어 오류**: 빌드 실패, 테스트 실패 등 → 오류 내용 출력 후 중단
3. **파일 없음**: 필요한 파일을 찾을 수 없는 경우 → 경로 확인 요청 후 중단
4. **의존성 미충족**: pending 태스크가 있지만 의존 태스크가 미완료인 경우 → 상태 출력 후 중단
5. **Phase 태스크 정의 없음**: ROADMAP.md에서 해당 Phase 테이블을 찾을 수 없는 경우

---

## 중간 현황 출력 형식

각 Phase 시작 시:
```
---
## Phase {N} 시작 [{완료된 Phase 수}/{전체 Phase 수}]
태스크 생성 중...
```

각 태스크 완료 시:
```
✓ [{완료 순번}/{현재 Phase 태스크 수}] {태스크명}
```

---

## 코딩 규칙

실제 코드 구현 시 프로젝트 규칙을 준수한다:

- **언어**: TypeScript (`any` 타입 사용 금지)
- **스타일**: Tailwind CSS v4 (`tailwind.config.ts` 없음, `globals.css`의 `@theme inline` 사용)
- **UI**: shadcn/ui v4 + `@base-ui/react`
- **상태관리**: Zustand
- **들여쓰기**: 2칸
- **주석**: 한국어 (비즈니스 로직만)
- **반응형**: 375px / 768px / 1280px+ 필수 대응
- **SSR 비활성화**: PDF.js, Milkdown 등 브라우저 전용 모듈은 `next/dynamic + ssr: false` 사용
