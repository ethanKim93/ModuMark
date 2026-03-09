---
name: domain-tasks:run
description: |
  특정 도메인의 pending 태스크를 의존성 순서에 따라 순차적으로 실행합니다.
  예: /domain-tasks:run markdown → markdown 도메인의 미완료 태스크를 하나씩 실행·검증 반복.
  각 태스크는 execute_task → 실제 코드 구현 → verify_task 순서로 처리됩니다.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - mcp__shrimp-task-manager__list_tasks
  - mcp__shrimp-task-manager__execute_task
  - mcp__shrimp-task-manager__verify_task
  - mcp__shrimp-task-manager__get_task_detail
  - mcp__shrimp-task-manager__query_task
---

# domain-tasks:run 스킬

## 사용법

```
/domain-tasks:run {domain}
```

**예시:**
- `/domain-tasks:run markdown` → markdown 도메인의 pending 태스크 순차 실행
- `/domain-tasks:run pdf` → pdf 도메인의 pending 태스크 순차 실행
- `/domain-tasks:run platform` → platform 도메인의 pending 태스크 순차 실행

---

## 실행 절차

### 0단계: 인자 파싱

입력된 `{domain}` 인자를 파싱한다. 누락된 경우 즉시 중단하고 사용법을 출력한다.

### 1단계: 현황 조회

`mcp__shrimp-task-manager__list_tasks`를 호출하여 전체 태스크 목록을 가져온다.

```json
{ "status": "all" }
```

도메인 필터링: 태스크명에 `[{Domain}]` 접두사가 포함된 태스크만 선택한다.
- `markdown` → `[Markdown]` 포함
- `pdf` → `[PDF]` 포함
- `platform` → `[Platform]` 포함
- `monetization` → `[Monetization]` 포함

현황을 출력한다:
```
## {Domain} 도메인 태스크 현황
- 전체: N개
- 완료(completed): N개
- 진행 중(in_progress): N개
- 대기(pending): N개
- 실패(failed): N개
```

### 2단계: 실행 가능 태스크 선택

pending 태스크 중 의존성이 모두 충족된 첫 번째 태스크를 선택한다.

**의존성 충족 조건**: 해당 태스크의 모든 의존 태스크가 `completed` 상태

실행 가능한 태스크가 없는 경우:
- pending 태스크가 0개 → "모든 태스크 완료" → 최종 보고 후 종료
- pending 태스크가 있지만 의존성 미충족 → "의존성 미충족 태스크만 남음" → 상세 내용 출력 후 종료

### 3단계: 태스크 상세 조회

`mcp__shrimp-task-manager__get_task_detail`로 선택된 태스크의 상세 정보를 가져온다.

출력:
```
## 태스크 실행 시작
**태스크**: {태스크명}
**설명**: {설명}
**구현 지침**: {implementationGuide}
**완료 기준**: {verificationCriteria}
**관련 파일**: {relatedFiles}
```

### 4단계: execute_task 호출

`mcp__shrimp-task-manager__execute_task`를 호출하여 태스크를 실행 상태로 전환한다.

반환된 구현 지침을 바탕으로 **실제 코드 구현**을 수행한다:
- Read/Glob/Grep으로 관련 파일 탐색
- Write/Edit으로 코드 작성 및 수정
- Bash로 빌드 검증, 테스트 실행

**구현 완료 기준**: `verificationCriteria`에 명시된 조건을 모두 충족

### 5단계: verify_task 호출

구현 완료 후 `mcp__shrimp-task-manager__verify_task`를 호출한다.

```json
{
  "taskId": "{taskId}",
  "summary": "구현 완료 요약:\n- 변경 파일: ...\n- 핵심 변경사항: ...\n- 검증 결과: ..."
}
```

verify_task 결과에 따라:
- 성공(approved) → "태스크 완료" 출력 후 2단계로 돌아가 반복
- 실패(rejected) → **즉시 중단**, 실패 원인과 수정 필요 사항 출력

### 6단계: 최종 보고

모든 pending 태스크가 완료되거나 실행 가능한 태스크가 없어지면 최종 보고를 출력한다:

```
## {Domain} 도메인 태스크 실행 완료

**처리 결과**:
| 태스크명 | 상태 | 비고 |
|---------|------|------|
| [Markdown] Phase2A: ... | completed | - |
| [Markdown] Phase2A: ... | completed | - |

**완료**: N개 / 전체: N개

**다음 단계**: 다음 Phase가 있다면 `/domain-tasks:create {domain} {nextPhase}` 실행
```

---

## 중단 규칙

다음 상황에서 즉시 중단한다 (다음 태스크로 자동 진행 금지):

1. **verify_task 실패**: 검증 실패 원인 상세 출력 후 중단
2. **Bash 명령어 오류**: 빌드 실패, 테스트 실패 등 → 오류 내용 출력 후 중단
3. **파일 없음**: 필요한 파일을 찾을 수 없는 경우 → 경로 확인 요청 후 중단
4. **의존성 미충족**: 선택된 태스크의 의존 태스크가 미완료인 경우 → 상태 출력 후 중단

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
