# ModuMark 컴포넌트 매핑

Figma 컴포넌트 → shadcn/ui 대응 매핑 테이블.

| 항목 | 내용 |
|------|------|
| 버전 | v1.0 |
| 작성일 | 2026-03-07 |
| Figma 파일 키 | `pvCZGg1rsozlzWXHCxRwfT` |

---

## 1. 전체 컴포넌트 매핑 테이블

| Figma 컴포넌트명 | Figma 노드 | shadcn/ui 컴포넌트 | 커스텀 필요 | 화면 |
|----------------|-----------|------------------|------------|------|
| Aside (사이드바) | `3:6` | 커스텀 `<aside>` | 높음 | 에디터 |
| Aside-Sidebar | `3:194`, `3:365` | 커스텀 `<aside>` | 높음 | PDF Merge, Split |
| Header-TopNavBar | `3:545` | 커스텀 `<header>` | 높음 | OCR |
| Tab Bar (에디터) | (에디터 상단) | `Tabs` | 중간 | 에디터 |
| Overlay (활성 메뉴) | `3:15` | `Button` variant="ghost" | 낮음 | 에디터, PDF |
| File Card | `3:14~` | `Card` | 낮음 | 에디터 |
| PDF File Card | (Added Files) | `Card` | 낮음 | PDF Merge |
| Page Preview Card | (Page 1~6) | `Card` | 중간 | PDF Split |
| Storage Bar | (1.2 MB / 50 MB) | 커스텀 컴포넌트 | 중간 | 에디터, PDF |
| Search Input | (Search files...) | `Input` | 낮음 | 에디터 |
| Select Files Button | `Select Files` | `Button` variant="outline" | 낮음 | PDF Merge |
| ~~AI Floating Bar~~ | ~~(Summarize, Translate...)~~ | ~~커스텀 floating~~ | ~~높음~~ | ~~에디터~~ — **❌ PROPOSAL-001 기각. 구현 안 함.** |
| AdSense Banner | (Google AdSense) | 커스텀 `AdSlot` | 중간 | 전체 |
| Confirm Dialog | (미저장 닫기 확인) | `Dialog` | 낮음 | 에디터 |
| Progress Bar (OCR) | (100% Ready) | `Progress` | 낮음 | OCR |
| Badge (Cloud Sync) | (Cloud Sync Disabled) | `Badge` | 낮음 | 에디터 |
| Badge (Saved) | (Saved to Local Storage) | `Badge` | 낮음 | 에디터 |
| Engine Status | (Engine Active) | `Badge` + 커스텀 | 중간 | OCR |
| Merge/Export Button | (Merge, Export PDF) | `Button` | 낮음 | PDF, 에디터 |
| Range Input | (From/To 입력) | `Input` | 낮음 | PDF Split |
| Page Range Tag | (Range 1) | `Badge` | 낮음 | PDF Split |
| Copy to Editor | (Copy to Editor) | `Button` variant="secondary" | 낮음 | OCR |

---

## 2. 화면별 컴포넌트 상세

### 2.1 에디터 화면 (노드 `3:3`)

#### 레이아웃 구조
```
AppShell
├── EditorSidebar (Aside)
│   ├── SectionLabel ("LOCAL WORKSPACE")
│   ├── FileList
│   │   ├── ActiveFileItem (bg-primary/20)
│   │   └── FileItem (기본/호버)
│   ├── PdfPowerToolsSection  ← "PDF Power Tools" 섹션 레이블 (PROPOSAL-007 통일)
│   │   └── NavItem (PDF Merge, Split, OCR Tool)
│   ├── StorageIndicator
│   └── AdSlot (사이드바 하단)
└── EditorMain
    ├── TabBar (Tabs)
    │   ├── TabItem × N (파일명, 미저장 표시 ●)
    │   └── NewTabButton (+)
    └── EditorCanvas (Milkdown WYSIWYG)
        ~~└── AiFloatingToolbar (absolute)~~ ← ❌ PROPOSAL-001 기각, 구현 안 함
```

#### 컴포넌트별 shadcn/ui 매핑

```tsx
// 파일 목록 아이템 (활성)
<Button variant="ghost" className="w-full justify-start bg-primary/20 text-primary rounded-md">
  <FileIcon /> Meeting_Notes.md
</Button>

// 파일 목록 아이템 (기본)
<Button variant="ghost" className="w-full justify-start text-muted-foreground hover:bg-primary/10">
  <FileIcon /> Project_Plan.md
</Button>

// 탭 바
<Tabs defaultValue="tab-1">
  <TabsList className="bg-transparent border-b border-border">
    <TabsTrigger value="tab-1">
      Meeting_Notes.md <span className="ml-1 text-primary">●</span>
    </TabsTrigger>
  </TabsList>
  <TabsContent value="tab-1">
    {/* Milkdown Editor */}
  </TabsContent>
</Tabs>

// AI 플로팅 툴바 — ❌ PROPOSAL-001 기각, 구현 안 함
// 로컬 우선 원칙과 충돌 (외부 AI 서버 전송 필요). 아래 코드는 참조용으로만 유지.
// <div className="absolute bg-surface border border-border rounded-lg shadow-lg p-2 flex gap-2">
//   <Button size="sm" variant="ghost">Summarize</Button>
//   <Button size="sm" variant="ghost">Translate</Button>
//   <Button size="sm" variant="ghost">Improve Tone</Button>
//   <Button size="sm" variant="ghost">Refine Selection</Button>
// </div>
```

### 2.2 PDF Merge 화면 (노드 `3:192`)

#### 레이아웃 구조
```
PdfLayout
├── PdfSidebar (Aside-Sidebar)
│   ├── AppLogo ("ModuMark")
│   ├── NavMenu (Home, Merge, Split, Compress, Convert)  ← 섹션명: "PDF Power Tools" (PROPOSAL-007 통일)
│   ├── StorageBar
│   └── AdSlot
└── PdfMain
    ├── PageHeader ("Merge PDF Documents")
    ├── DropZone
    │   └── DropzoneText ("Drag & drop or click")
    ├── FileList ("Added Files (4)")
    │   ├── FileCard × N
    │   │   ├── Thumbnail
    │   │   ├── FileName
    │   │   ├── FileSize
    │   │   └── RemoveButton
    ├── ActionBar
    │   ├── TotalSize ("Total size: 8.05 MB")
    │   ├── ClearButton
    │   └── MergeButton ("Merge")
    └── AdBanner (하단)
```

#### 컴포넌트별 shadcn/ui 매핑

```tsx
// 드롭존
<Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer">
  <CardContent className="flex flex-col items-center justify-center py-12">
    <UploadIcon className="text-muted-foreground mb-4" size={48} />
    <p className="text-base">Drag <span className="text-primary">here</span></p>
    <p className="text-sm text-muted-foreground">Or click to select files from your computer</p>
  </CardContent>
</Card>

// PDF 파일 카드
<Card className="border-border bg-surface">
  <CardContent className="flex items-center gap-3 p-3">
    <PdfThumbnail />
    <div className="flex-1">
      <p className="text-base font-medium truncate">Q3_Financial_Report_Final.pdf</p>
      <p className="text-sm text-muted-foreground">4.2 MB</p>
    </div>
    <Button variant="ghost" size="icon" className="text-destructive">
      <XIcon />
    </Button>
  </CardContent>
</Card>

// 병합 버튼
<Button className="bg-primary hover:bg-primary/90">
  Merge <ArrowRightIcon className="ml-2" />
</Button>
```

### 2.3 PDF Split 화면 (노드 `3:363`)

#### 레이아웃 구조
```
PdfLayout (PDF Merge와 동일한 사이드바)
└── PdfSplitMain
    ├── PageHeader ("Split PDF Pages")
    ├── SplitModeSelector (탭)
    │   ├── "Split into multiple ranges"
    │   ├── "Every X Pages"
    │   └── "Extract Pages"
    ├── PagePreviewGrid
    │   └── PageCard × N (Page 1~6 썸네일)
    ├── RangeList
    │   ├── RangeItem ("Range 1", From/To 입력)
    │   └── AddRangeButton
    └── ActionBar
        ├── MergeRangesCheckbox ("Merge all ranges into one PDF")
        └── SplitButton
```

```tsx
// 페이지 분할 모드 탭
<Tabs defaultValue="ranges">
  <TabsList>
    <TabsTrigger value="ranges">Split into multiple ranges</TabsTrigger>
    <TabsTrigger value="every-x">Every X Pages</TabsTrigger>
    <TabsTrigger value="extract">Extract Pages</TabsTrigger>
  </TabsList>
</Tabs>

// 범위 입력
<div className="flex items-center gap-2">
  <Badge variant="outline">Range 1</Badge>
  <Input placeholder="From" className="w-20" />
  <span className="text-muted-foreground">–</span>
  <Input placeholder="To" className="w-20" />
  <Button variant="ghost" size="icon"><TrashIcon /></Button>
</div>
```

### 2.4 OCR 화면 (노드 `3:542`)

> **주의**: OCR 화면은 사이드바가 없고 TopNavBar 레이아웃을 사용한다 (다른 화면과 다른 레이아웃).

#### 레이아웃 구조
```
OcrLayout
├── TopNavBar (Header-TopNavBar)
│   ├── AppLogo ("ModuMark OCR")
│   └── NavActions
└── OcrMain
    ├── OriginalPanel (좌측 50%)
    │   ├── DropZone (PDF 업로드)
    │   └── FileName
    └── OutputPanel (우측 50%)
        ├── TabBar (Preview / Markdown Preview / Raw Source)
        ├── OcrOutput (텍스트 결과)
        └── ActionBar
            ├── CopyToEditorButton
            └── SaveAsMdButton
```

```tsx
// OCR 엔진 상태 배지
<Badge className="bg-success/20 text-success border-success/30">
  <div className="w-2 h-2 rounded-full bg-success mr-2 animate-pulse" />
  Engine Active
</Badge>

// OCR 출력 탭
<Tabs defaultValue="preview">
  <TabsList>
    <TabsTrigger value="preview">Preview</TabsTrigger>
    <TabsTrigger value="markdown">Markdown Preview</TabsTrigger>
    <TabsTrigger value="raw">Raw Source</TabsTrigger>
  </TabsList>
</Tabs>

// 결과 액션 버튼들
<div className="flex gap-2">
  <Button variant="outline">Copy to Editor</Button>
  <Button>Save as .md</Button>
</div>
```

---

## 3. 공통 컴포넌트

### StorageIndicator

```tsx
// "1.2 MB / 50 MB used" 형태
interface StorageIndicatorProps {
  used: number       // bytes
  total: number      // bytes
  className?: string
}

// 구현
<div className="space-y-1">
  <div className="flex justify-between text-xs text-muted-foreground">
    <span>Storage</span>
    <span>{formatBytes(used)} / {formatBytes(total)} used</span>
  </div>
  <Progress value={(used / total) * 100} className="h-1" />
</div>
```

### AdSlot

```tsx
// AdSense 광고 슬롯 (Lazy Loading 적용)
interface AdSlotProps {
  slot: string
  format?: 'banner' | 'rectangle' | 'responsive'
  className?: string
}

// 규칙:
// - 편집 영역(에디터 캔버스, PDF 뷰어)에 오버레이 금지
// - 모바일(375px 미만)에서 숨김: className에 'hidden sm:block' 포함
// - Intersection Observer로 뷰포트 진입 시 로드
```

### CloudSyncBadge

```tsx
// "Cloud Sync Disabled" 상태 배지
<Badge variant="outline" className="text-muted-foreground border-border-light">
  <CloudOffIcon className="mr-1 h-3 w-3" />
  Cloud Sync Disabled
</Badge>
```

### SavedBadge

```tsx
// "Saved to Local Storage" 상태 배지
<Badge className="bg-success/10 text-success border-success/20">
  <CheckIcon className="mr-1 h-3 w-3" />
  Saved to Local Storage
</Badge>
```

---

## 4. 아이콘 사용 가이드

shadcn/ui 기본 아이콘 라이브러리인 **Lucide React**를 사용한다.

| 기능 | Lucide 아이콘 |
|------|--------------|
| 파일 (.md) | `FileText` |
| 파일 (.pdf) | `FileType` |
| 폴더 | `Folder` |
| 검색 | `Search` |
| 새 탭/문서 | `Plus` |
| 탭 닫기 | `X` |
| PDF 병합 | `Merge` 또는 `Layers` |
| PDF 분할 | `Scissors` |
| OCR | `ScanText` |
| PDF 내보내기 | `FileDown` |
| 저장 | `Save` |
| 클라우드 비활성 | `CloudOff` |
| 체크/완료 | `Check` |
| 삭제 | `Trash2` |
| 업로드 | `Upload` |
| 복사 | `Copy` |
| AI/스파클 | `Sparkles` |

---

## 5. 신규 컴포넌트 개발 가이드

### 사이드바 (EditorSidebar / PdfSidebar)

두 화면에서 공통으로 사용되는 사이드바는 별도 컴포넌트로 추출한다:

```tsx
// src/components/layout/AppSidebar.tsx
interface AppSidebarProps {
  variant: 'editor' | 'pdf'
  activeItem?: string
}
```

레이아웃 차이:
- **에디터**: 파일 목록 포함, 250px 폭
- **PDF**: 네비게이션 링크 중심, 280px 폭

### AI 플로팅 툴바 (AiFloatingToolbar)

> **❌ PROPOSAL-001 기각**: 로컬 우선 원칙과 충돌 (외부 AI 서버 전송 필요). 구현하지 않음. 향후 재검토 시 `future-review.md` 참조.

---

## 문서 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| v1.0 | 2026-03-07 | Figma 4개 화면 분석 기반 초안 작성 |
| v1.1 | 2026-03-07 | PROPOSAL-001 기각: AI Floating Toolbar 제거. PROPOSAL-007: "PDF Power Tools" 네이밍 통일 |
