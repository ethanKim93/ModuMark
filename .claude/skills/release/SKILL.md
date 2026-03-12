---
name: release
description: |
  버전 번호를 올리고 태그 생성 + 커밋 + 푸시까지 한번에 처리합니다.
  버전 미지정 시 세 번째 숫자(패치) 자동 +1. 패치가 10 이상이면 두 번째 숫자(마이너) +1 후 패치 0 리셋.
  예: /release        → 현재 0.2.2면 자동으로 0.2.3
  예: /release 0.3.0  → 명시적 버전 지정
allowed-tools:
  - Read
  - Edit
  - Bash
---

# Release 스킬

사용자가 `/release` 또는 `/release <버전>` 형태로 호출합니다.

## 실행 순서

**ARGS**: `$ARGUMENTS` (버전 명시 또는 빈 값)

### 1. 현재 버전 읽기

`src-tauri/tauri.conf.json`의 `version` 필드를 읽어 현재 버전(예: `0.2.2`)을 파악한다.

### 2. 새 버전 결정

- **`$ARGUMENTS`가 있으면**: 해당 버전을 그대로 사용
- **`$ARGUMENTS`가 없으면**: 아래 규칙으로 자동 계산
  - 현재 버전을 `MAJOR.MINOR.PATCH`로 분리
  - `PATCH + 1` 계산
  - **PATCH + 1 >= 10이면**: `MINOR + 1`, `PATCH = 0` 후 아래 체크
    - **MINOR + 1 >= 10이면**: `MAJOR + 1`, `MINOR = 0`, `PATCH = 0` (예: `0.9.9` → `1.0.0`)
    - **MINOR + 1 < 10이면**: 그대로 (예: `0.2.9` → `0.3.0`)
  - **PATCH + 1 < 10이면**: `PATCH + 1` (예: `0.2.2` → `0.2.3`)

### 3. 버전 파일 업데이트 (두 파일 모두)

- `src-tauri/tauri.conf.json`: `"version"` 값을 새 버전으로 교체
- `src-tauri/Cargo.toml`: 첫 번째 `version =` 줄을 새 버전으로 교체

### 4. git 작업

```bash
git add src-tauri/tauri.conf.json src-tauri/Cargo.toml
git commit -m "chore: v<새버전> 릴리즈"
git tag v<새버전>
git push origin main
git push origin v<새버전>
```

### 5. 완료 메시지 출력

- 이전 버전 → 새 버전 변경 내역 표시
- GitHub Actions 빌드 확인 URL: `https://github.com/ethanKim93/ModuMark/actions`

## 주의사항
- 버전은 반드시 `tauri.conf.json`과 `Cargo.toml` 두 곳 모두 업데이트
- 태그 형식은 `v<버전>` (예: `v0.2.3`)
- push 전에 현재 브랜치가 `main`인지 확인
- 이미 같은 태그가 존재하면 에러 안내 후 중단
