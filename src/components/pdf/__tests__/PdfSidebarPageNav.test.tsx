import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

/* generateThumbnailFromDoc 모킹 — 실제 PDF.js 불필요 */
vi.mock('@/lib/pdf/generateThumbnail', () => ({
  generateThumbnailFromDoc: vi.fn().mockResolvedValue('data:image/png;base64,mock'),
}));

import PdfSidebarPageNav from '../PdfSidebarPageNav';

/** 간단한 mock PDFDocumentProxy 생성 */
function makeMockPdfDoc(numPages: number) {
  return { numPages, getPage: vi.fn() };
}

describe('PdfSidebarPageNav', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('pdfDoc가 null이면 빈 상태 안내 메시지를 렌더링한다', () => {
    render(
      <PdfSidebarPageNav
        pdfDoc={null}
        currentPage={0}
        onPageChange={vi.fn()}
      />
    );
    expect(screen.getByText(/PDF 파일을 열면/)).toBeTruthy();
  });

  it('pdfDoc가 주어지면 numPages 개수만큼 버튼을 렌더링한다', async () => {
    const pdfDoc = makeMockPdfDoc(3);
    render(
      <PdfSidebarPageNav
        pdfDoc={pdfDoc}
        currentPage={0}
        onPageChange={vi.fn()}
      />
    );
    // 3개의 페이지 번호 텍스트가 있어야 함
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('썸네일 클릭 시 onPageChange 콜백이 해당 인덱스(0-indexed)로 호출된다', () => {
    const onPageChange = vi.fn();
    const pdfDoc = makeMockPdfDoc(3);
    render(
      <PdfSidebarPageNav
        pdfDoc={pdfDoc}
        currentPage={0}
        onPageChange={onPageChange}
      />
    );
    // 2번째 페이지 버튼(index 1) 클릭
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]);
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('currentPage에 해당하는 버튼에 ring-[#1773CF] 클래스가 적용된다', () => {
    const pdfDoc = makeMockPdfDoc(3);
    render(
      <PdfSidebarPageNav
        pdfDoc={pdfDoc}
        currentPage={1}
        onPageChange={vi.fn()}
      />
    );
    const buttons = screen.getAllByRole('button');
    // index 1 (2번째 버튼)이 활성 상태
    expect(buttons[1].className).toContain('ring-[#1773CF]');
    // index 0은 활성 아님
    expect(buttons[0].className).not.toContain('ring-[#1773CF]');
  });

  it('첫 번째 페이지 클릭 시 onPageChange(0) 호출', () => {
    const onPageChange = vi.fn();
    const pdfDoc = makeMockPdfDoc(2);
    render(
      <PdfSidebarPageNav
        pdfDoc={pdfDoc}
        currentPage={1}
        onPageChange={onPageChange}
      />
    );
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(onPageChange).toHaveBeenCalledWith(0);
  });
});
