import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { splitPdf, PdfSplitError, PDF_MAX_SIZE } from '../pdfSplit';

/* 지정된 페이지 수의 PDF File 생성 헬퍼 */
async function createPdfFile(pageCount: number, name = 'test.pdf'): Promise<File> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) {
    doc.addPage([595, 842]);
  }
  const bytes = await doc.save();
  return new File([new Uint8Array(bytes)], name, { type: 'application/pdf' });
}

describe('splitPdf', () => {
  it('단일 범위 1-3 추출 시 3페이지 PDF를 반환한다', async () => {
    const file = await createPdfFile(10);
    const results = await splitPdf(file, [{ id: '1', from: 1, to: 3 }]);
    expect(results.length).toBe(1);
    const doc = await PDFDocument.load(results[0].bytes);
    expect(doc.getPageCount()).toBe(3);
  });

  it('복수 범위 [1-3, 5-7] 추출 시 각각 3페이지 PDF를 반환한다', async () => {
    const file = await createPdfFile(10);
    const results = await splitPdf(file, [
      { id: '1', from: 1, to: 3 },
      { id: '2', from: 5, to: 7 },
    ]);
    expect(results.length).toBe(2);
    const doc1 = await PDFDocument.load(results[0].bytes);
    const doc2 = await PDFDocument.load(results[1].bytes);
    expect(doc1.getPageCount()).toBe(3);
    expect(doc2.getPageCount()).toBe(3);
  });

  it('단일 페이지 범위 5-5 추출 시 1페이지를 반환한다', async () => {
    const file = await createPdfFile(10);
    const results = await splitPdf(file, [{ id: '1', from: 5, to: 5 }]);
    const doc = await PDFDocument.load(results[0].bytes);
    expect(doc.getPageCount()).toBe(1);
  });

  it('범위가 파일 페이지 수를 초과해도 마지막 페이지로 클램핑된다', async () => {
    const file = await createPdfFile(5);
    const results = await splitPdf(file, [{ id: '1', from: 3, to: 100 }]);
    const doc = await PDFDocument.load(results[0].bytes);
    expect(doc.getPageCount()).toBe(3); // 3,4,5 페이지
  });

  it('from > to인 유효하지 않은 범위 시 INVALID_RANGE 에러', async () => {
    const file = await createPdfFile(5);
    await expect(
      splitPdf(file, [{ id: '1', from: 5, to: 2 }])
    ).rejects.toMatchObject({ code: 'INVALID_RANGE' });
  });

  it('from < 1인 유효하지 않은 범위 시 INVALID_RANGE 에러', async () => {
    const file = await createPdfFile(5);
    await expect(
      splitPdf(file, [{ id: '1', from: 0, to: 3 }])
    ).rejects.toMatchObject({ code: 'INVALID_RANGE' });
  });

  it('100MB 초과 파일 시 TOO_LARGE 에러', async () => {
    const bigFile = new File([new Uint8Array(PDF_MAX_SIZE + 1)], 'big.pdf', { type: 'application/pdf' });
    await expect(splitPdf(bigFile, [{ id: '1', from: 1, to: 1 }])).rejects.toMatchObject({ code: 'TOO_LARGE' });
  });

  it('암호화된 PDF 처리 시 ENCRYPTED 에러', async () => {
    const badFile = new File([new Uint8Array([0, 1, 2, 3])], 'enc.pdf', { type: 'application/pdf' });
    await expect(splitPdf(badFile, [{ id: '1', from: 1, to: 1 }])).rejects.toMatchObject({ code: 'ENCRYPTED' });
  });

  it('결과 파일명이 {원본명}_p{from}-{to}.pdf 형식이다', async () => {
    const file = await createPdfFile(5, 'document.pdf');
    const results = await splitPdf(file, [{ id: '1', from: 2, to: 4 }]);
    expect(results[0].name).toBe('document_p2-4.pdf');
  });
});
