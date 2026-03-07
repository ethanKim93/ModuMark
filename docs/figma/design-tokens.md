# ModuMark 디자인 토큰

Figma 색상/폰트/간격 → CSS 변수 → Tailwind 클래스 완전 매핑표.

| 항목 | 내용 |
|------|------|
| 버전 | v1.0 |
| 작성일 | 2026-03-07 |
| 소스 | Figma 파일 `pvCZGg1rsozlzWXHCxRwfT` |

---

## 1. 색상 토큰

### 1.1 배경 색상

| 토큰 이름 | Figma 값 | CSS 변수 | Tailwind 클래스 | 적용 화면 |
|-----------|---------|---------|----------------|---------|
| background | `#111921` | `--background` | `bg-background` | 전체 |
| background-deeper | `#0A0F14` | `--background-deeper` | `bg-[#0A0F14]` | OCR |
| background-dark | `#0D1117` | `--background-dark` | `bg-[#0D1117]` | OCR 콘텐츠 |
| surface | `#1A242F` | `--surface` | `bg-surface` | 카드, 패널 |
| surface-secondary | `#2D3A49` | `--surface-secondary` | `bg-surface-secondary` | 2차 UI |
| sidebar-bg | `rgba(17,25,33,0.3)` | `--sidebar-bg` | `bg-[rgba(17,25,33,0.3)]` | 사이드바 |

### 1.2 보더 색상

| 토큰 이름 | Figma 값 | CSS 변수 | Tailwind 클래스 | 적용 화면 |
|-----------|---------|---------|----------------|---------|
| border | `#1E293B` | `--border` | `border-border` | 전체 |
| border-light | `#334155` | `--border-light` | `border-[#334155]` | 섹션 구분 |
| border-lighter | `#475569` | `--border-lighter` | `border-[#475569]` | 비활성 |
| border-muted | `#CBD5E1` | `--border-muted` | `border-[#CBD5E1]` | 입력 필드 |

### 1.3 텍스트 색상

| 토큰 이름 | Figma 값 | CSS 변수 | Tailwind 클래스 | 사용처 |
|-----------|---------|---------|----------------|--------|
| foreground | `#F8FAFC` | `--foreground` | `text-foreground` | 기본 텍스트 |
| white | `#FFFFFF` | `--white` | `text-white` | 아이콘, 강조 |
| muted-foreground | `#94A3B8` | `--muted-foreground` | `text-muted-foreground` | 보조 텍스트 |
| placeholder | `#64748B` | `--placeholder` | `text-[#64748B]` | 플레이스홀더 |
| disabled | `#475569` | `--disabled` | `text-[#475569]` | 비활성 |
| text-on-light | `#F1F5F9` | `--text-on-light` | `text-[#F1F5F9]` | 밝은 배경 위 |
| text-medium | `#6B7280` | - | `text-[#6B7280]` | 중간 강도 |

### 1.4 Primary 색상

| 토큰 이름 | Figma 값 | CSS 변수 | Tailwind 클래스 | 사용처 |
|-----------|---------|---------|----------------|--------|
| primary | `#1773CF` | `--primary` | `text-primary`, `bg-primary` | 버튼, 활성 상태 |
| primary-hover | `rgba(23,115,207,0.2)` | `--primary-hover` | `bg-primary/20` | 활성 메뉴 배경 |
| primary-subtle | `rgba(23,115,207,0.1)` | `--primary-subtle` | `bg-primary/10` | 선택 배경 |
| surface-overlay | `rgba(30,41,59,0.5)` | `--surface-overlay` | `bg-slate-700/50` | 패널 오버레이 |

### 1.5 상태 색상

| 토큰 이름 | Figma 값 | CSS 변수 | Tailwind 클래스 | 사용처 |
|-----------|---------|---------|----------------|--------|
| success | `#10B981` | `--success` | `text-emerald-500` | 저장 완료, 활성 |
| success-alt | `#22C55E` | `--success-alt` | `text-green-500` | OCR 활성 상태 |
| destructive | `#F87171` | `--destructive` | `text-red-400` | 에러, 삭제 |

---

## 2. CSS 변수 전체 정의

### globals.css

```css
@layer base {
  :root {
    /* 배경 */
    --background: 212 32% 10%;          /* #111921 */
    --surface: 210 30% 15%;             /* #1A242F */
    --surface-secondary: 209 28% 23%;   /* #2D3A49 */

    /* 보더 */
    --border: 215 25% 17%;              /* #1E293B */
    --border-light: 215 22% 28%;        /* #334155 */

    /* 텍스트 */
    --foreground: 210 40% 98%;          /* #F8FAFC */
    --muted-foreground: 215 16% 63%;    /* #94A3B8 */

    /* Primary */
    --primary: 211 79% 45%;             /* #1773CF */
    --primary-foreground: 0 0% 100%;    /* #FFFFFF */

    /* 상태 */
    --success: 160 84% 39%;             /* #10B981 */
    --destructive: 0 91% 71%;           /* #F87171 */

    /* 공통 */
    --radius: 8px;

    /* 폰트 */
    --font-sans: 'Inter', sans-serif;
    --font-mono: 'Liberation Mono', 'Courier New', monospace;
  }
}
```

---

## 3. tailwind.config.ts 확장 설정

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        surface: {
          DEFAULT: 'hsl(var(--surface))',
          secondary: 'hsl(var(--surface-secondary))',
        },
        border: {
          DEFAULT: 'hsl(var(--border))',
          light: 'hsl(var(--border-light))',
        },
        foreground: 'hsl(var(--foreground))',
        'muted-foreground': 'hsl(var(--muted-foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        success: 'hsl(var(--success))',
        destructive: 'hsl(var(--destructive))',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Liberation Mono', 'Courier New', 'monospace'],
      },
      fontSize: {
        'label': ['10px', { lineHeight: '1.5', fontWeight: '700', letterSpacing: '0.1em' }],
        'xs':    ['11px', { lineHeight: '1.4' }],
        'sm':    ['12px', { lineHeight: '1.33' }],
        'base':  ['14px', { lineHeight: '1.43' }],
        'md':    ['16px', { lineHeight: '1.5' }],
        'lg':    ['18px', { lineHeight: '1.44' }],
        'xl':    ['20px', { lineHeight: '1.4' }],
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
      },
      spacing: {
        '4.5': '18px',
      },
    },
  },
  plugins: [],
}

export default config
```

---

## 4. 타이포그래피 토큰

### 4.1 폰트 스케일

| 토큰 | 크기 | 줄높이 | 굵기 | Figma 스타일 | 사용처 |
|------|------|--------|------|-------------|--------|
| label | 10px | 1.5 | 700 | style_M4QG00 | 섹션 레이블 (대문자) |
| xs | 11px | 1.25 | 400/700 | style_UIEC5L, style_FO0H0L | 보조 메타, 배지 |
| sm | 12px | 1.33 | 400 | style_KQO7Z2 | 파일 메타 정보 |
| base | 14px | 1.43 | 400/500 | style_H7NF4R, style_WQ5H0P | 기본 본문, 메뉴 |
| md | 16px | 1.5 | 500/700 | - | 강조 텍스트 |
| lg | 18px | 1.44 | 700 | - | 소제목 |
| xl | 20px | 1.4 | 700 | style_26OK28 | 앱 이름, 주요 제목 |

### 4.2 섹션 레이블 유틸리티 클래스

```css
/* 사이드바 섹션 헤더 */
.section-label {
  @apply text-label font-bold uppercase tracking-[0.1em] text-[#64748B];
}
```

---

## 5. 간격 토큰

| 토큰 | 크기 | Tailwind | 사용처 |
|------|------|---------|--------|
| gap-xs | 4px | `gap-1` | 아이콘-텍스트 |
| gap-sm | 6px | `gap-1.5` | 타이트한 목록 |
| gap-md | 8px | `gap-2` | 기본 아이템 간격 |
| gap-lg | 12px | `gap-3` | 카드 간격 |
| gap-xl | 16px | `gap-4` | 섹션 간격 |
| gap-2xl | 24px | `gap-6` | 주요 섹션 간격 |
| padding-sm | 8px | `p-2` | 소형 버튼 |
| padding-md | 12px | `p-3` | 카드 내부 |
| padding-lg | 16px | `p-4` | 사이드바 |

---

## 6. 컴포넌트별 토큰 사용 예시

### 사이드바 메뉴 아이템

```tsx
// 활성 상태
<div className="flex items-center gap-3 px-2 py-2 rounded-md bg-primary/20 text-primary">
  <Icon className="text-primary" />
  <span className="text-base font-medium">Documents</span>
</div>

// 기본 상태
<div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-foreground">
  <Icon className="text-[#475569]" />
  <span className="text-base">Archive</span>
</div>
```

### 파일 카드

```tsx
<div className="rounded-lg border border-border bg-surface p-3 hover:bg-surface-secondary hover:border-border-light transition-colors cursor-pointer">
  <div className="flex items-center gap-3">
    <FileIcon className="text-primary" />
    <div>
      <p className="text-base font-medium text-foreground">Meeting_Notes.md</p>
      <p className="text-sm text-muted-foreground">1.2 MB</p>
    </div>
  </div>
</div>
```

### 섹션 레이블

```tsx
<h3 className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#64748B] px-2">
  Local Workspace
</h3>
```

---

## 문서 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| v1.0 | 2026-03-07 | Figma 4개 화면 globalVars 기반 초안 작성 |
