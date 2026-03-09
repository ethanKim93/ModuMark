'use client';

import { useEffect, useRef, useState } from 'react';
import { generateThumbnailFromDoc } from '@/lib/pdf/generateThumbnail';

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pdfDoc: any | null; // PDF.js PDFDocumentProxy
  currentPage: number; // 0-indexed
  onPageChange: (pageIndex: number) => void;
}

/**
 * 사이드바 상단: 현재 열린 PDF 페이지 썸네일 네비게이션
 * - 썸네일 클릭 시 onPageChange 콜백으로 페이지 이동
 * - 현재 페이지 썸네일에 primary 컬러 테두리 강조
 */
export default function PdfSidebarPageNav({ pdfDoc, currentPage, onPageChange }: Props) {
  const [thumbnails, setThumbnails] = useState<(string | null)[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const abortRef = useRef(false);

  useEffect(() => {
    if (!pdfDoc) {
      setThumbnails([]);
      setPageCount(0);
      return;
    }

    const count = pdfDoc.numPages as number;
    setPageCount(count);
    // 썸네일 배열 초기화 (null = 로딩 중)
    setThumbnails(Array(count).fill(null));
    abortRef.current = false;

    // 페이지별 순차 썸네일 생성
    (async () => {
      for (let i = 1; i <= count; i++) {
        if (abortRef.current) break;
        try {
          const dataUrl = await generateThumbnailFromDoc(pdfDoc, i);
          if (!abortRef.current) {
            setThumbnails((prev) => {
              const next = [...prev];
              next[i - 1] = dataUrl;
              return next;
            });
          }
        } catch {
          // 개별 페이지 썸네일 생성 실패 시 스킵
        }
      }
    })();

    return () => {
      abortRef.current = true;
    };
  }, [pdfDoc]);

  if (!pdfDoc || pageCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs p-4">
        PDF 파일을 열면 페이지 목록이 표시됩니다
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-2 overflow-y-auto h-full">
      {thumbnails.map((thumb, index) => {
        const isActive = index === currentPage;
        return (
          <button
            key={index}
            type="button"
            onClick={() => onPageChange(index)}
            className={[
              'flex flex-col items-center gap-1 rounded cursor-pointer transition-all',
              'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isActive ? 'ring-2 ring-[#1773CF] bg-accent/50' : '',
            ].join(' ')}
          >
            {/* 썸네일 이미지 or 스켈레톤 */}
            <div className="w-full aspect-[3/4] bg-muted rounded overflow-hidden">
              {thumb ? (
                <img
                  src={thumb}
                  alt={`${index + 1}페이지`}
                  className="w-full h-full object-contain"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full animate-pulse bg-muted-foreground/20 rounded" />
              )}
            </div>
            {/* 페이지 번호 */}
            <span
              className={[
                'text-[10px] pb-1',
                isActive ? 'text-[#1773CF] font-semibold' : 'text-muted-foreground',
              ].join(' ')}
            >
              {index + 1}
            </span>
          </button>
        );
      })}
    </div>
  );
}
