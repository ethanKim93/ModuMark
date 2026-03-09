import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { usePdfFileStore, MergeFileEntry } from '@/stores/pdfFileStore';

/* dnd-kit 모킹 — 드래그 기능 없이 렌더링 테스트 */
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  closestCenter: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  verticalListSortingStrategy: {},
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
  arrayMove: vi.fn((arr: unknown[], from: number, to: number) => {
    const result = [...arr];
    const [item] = result.splice(from, 1);
    result.splice(to, 0, item);
    return result;
  }),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => '' } },
}));

/* pdfjsLib 모킹 — 실제 PDF.js 불필요 */
vi.mock('@/lib/pdf/pdfViewer', () => ({
  pdfjsLib: {
    getDocument: vi.fn(() => ({
      promise: Promise.resolve({ numPages: 3 }),
    })),
  },
}));

import PdfSidebarMergeList from '../PdfSidebarMergeList';

function makeMergeFile(name: string): MergeFileEntry {
  return {
    id: crypto.randomUUID(),
    file: new File([new Uint8Array(100)], name, { type: 'application/pdf' }),
    name,
    pageCount: 3,
  };
}

describe('PdfSidebarMergeList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePdfFileStore.setState({ mergeFiles: [] });
  });

  it('병합 파일이 없으면 빈 상태 드롭존을 렌더링한다', () => {
    render(<PdfSidebarMergeList onMerge={vi.fn()} isMerging={false} />);
    expect(screen.getByText(/PDF 파일을 끌어다 놓거나/)).toBeTruthy();
  });

  it('병합 파일이 없으면 [병합 저장] 버튼이 비활성화된다', () => {
    render(<PdfSidebarMergeList onMerge={vi.fn()} isMerging={false} />);
    const mergeBtn = screen.getByRole('button', { name: '병합 저장' });
    expect(mergeBtn).toBeTruthy();
    expect(mergeBtn.hasAttribute('disabled')).toBe(true);
  });

  it('병합 파일이 1개 이상이면 [병합 저장] 버튼이 활성화된다', () => {
    usePdfFileStore.setState({ mergeFiles: [makeMergeFile('a.pdf')] });
    render(<PdfSidebarMergeList onMerge={vi.fn()} isMerging={false} />);
    const mergeBtn = screen.getByRole('button', { name: '병합 저장' });
    expect(mergeBtn.hasAttribute('disabled')).toBe(false);
  });

  it('파일 목록에 추가된 파일명이 표시된다', () => {
    usePdfFileStore.setState({ mergeFiles: [makeMergeFile('test.pdf')] });
    render(<PdfSidebarMergeList onMerge={vi.fn()} isMerging={false} />);
    expect(screen.getByTitle('test.pdf')).toBeTruthy();
  });

  it('[병합 저장] 클릭 시 onMerge 콜백이 호출된다', () => {
    const onMerge = vi.fn();
    usePdfFileStore.setState({ mergeFiles: [makeMergeFile('a.pdf')] });
    render(<PdfSidebarMergeList onMerge={onMerge} isMerging={false} />);
    fireEvent.click(screen.getByRole('button', { name: '병합 저장' }));
    expect(onMerge).toHaveBeenCalledTimes(1);
  });

  it('isMerging이 true이면 [병합 저장] 버튼이 비활성화된다', () => {
    usePdfFileStore.setState({ mergeFiles: [makeMergeFile('a.pdf')] });
    render(<PdfSidebarMergeList onMerge={vi.fn()} isMerging={true} />);
    const mergeBtn = screen.getByRole('button', { name: /병합 중/ });
    expect(mergeBtn.hasAttribute('disabled')).toBe(true);
  });

  it('X 버튼 클릭 시 해당 파일이 목록에서 제거된다', () => {
    const entry = makeMergeFile('remove.pdf');
    usePdfFileStore.setState({ mergeFiles: [entry] });
    render(<PdfSidebarMergeList onMerge={vi.fn()} isMerging={false} />);
    const removeBtn = screen.getByRole('button', { name: 'remove.pdf 제거' });
    fireEvent.click(removeBtn);
    expect(usePdfFileStore.getState().mergeFiles).toHaveLength(0);
  });
});
