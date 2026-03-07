import { describe, it, expect, beforeAll, vi } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';
import { mergePdfs, PdfMergeError } from '../pdf/pdfMerge';
import { splitPdf, PdfSplitError } from '../pdf/pdfSplit';

/* 지정된 페이지 수의 PDF File 생성 헬퍼 */
async function createPdfFile(pageCount: number, name = 'test.pdf'): Promise<File> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) {
    doc.addPage([595, 842]);
  }
  const bytes = await doc.save();
  return new File([new Uint8Array(bytes)], name, { type: 'application/pdf' });
}

describe('PDF 병합 플로우 통합', () => {
  it('3개 파일 업로드 → 병합 → 결과 바이트 검증', async () => {
    const files = await Promise.all([
      createPdfFile(2, 'doc1.pdf'),
      createPdfFile(3, 'doc2.pdf'),
      createPdfFile(1, 'doc3.pdf'),
    ]);

    const progressLog: number[] = [];
    const result = await mergePdfs(files, (p) => progressLog.push(p));

    /* 결과 검증 */
    const merged = await PDFDocument.load(result);
    expect(merged.getPageCount()).toBe(6); // 2+3+1

    /* 진행률 완료 확인 */
    expect(progressLog[progressLog.length - 1]).toBe(100);
  });

  it('파일 수 초과 시 에러가 올바르게 전파된다', async () => {
    const files = await Promise.all(
      Array.from({ length: 21 }, (_, i) => createPdfFile(1, `f${i}.pdf`))
    );
    try {
      await mergePdfs(files);
      expect.fail('에러가 발생해야 함');
    } catch (err) {
      expect(err).toBeInstanceOf(PdfMergeError);
      expect((err as PdfMergeError).code).toBe('TOO_MANY_FILES');
    }
  });
});

describe('PDF 분할 플로우 통합', () => {
  it('10페이지 PDF → 두 범위 분할 → 각 페이지 수 검증', async () => {
    const file = await createPdfFile(10, 'source.pdf');
    const progressLog: number[] = [];

    const results = await splitPdf(
      file,
      [
        { id: 'r1', from: 1, to: 3 },
        { id: 'r2', from: 7, to: 10 },
      ],
      (p) => progressLog.push(p)
    );

    expect(results.length).toBe(2);

    const doc1 = await PDFDocument.load(results[0].bytes);
    const doc2 = await PDFDocument.load(results[1].bytes);
    expect(doc1.getPageCount()).toBe(3);
    expect(doc2.getPageCount()).toBe(4);

    /* 파일명 검증 */
    expect(results[0].name).toBe('source_p1-3.pdf');
    expect(results[1].name).toBe('source_p7-10.pdf');

    /* 진행률 완료 확인 */
    expect(progressLog[progressLog.length - 1]).toBe(100);
  });

  it('잘못된 범위 시 에러가 올바르게 전파된다', async () => {
    const file = await createPdfFile(5);
    try {
      await splitPdf(file, [{ id: 'bad', from: 10, to: 5 }]);
      expect.fail('에러가 발생해야 함');
    } catch (err) {
      expect(err).toBeInstanceOf(PdfSplitError);
      expect((err as PdfSplitError).code).toBe('INVALID_RANGE');
    }
  });
});
