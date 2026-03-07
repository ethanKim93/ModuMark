import { describe, it, expect, vi } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { mergePdfs, PdfMergeError, PDF_MAX_TOTAL_SIZE } from '../pdfMerge';

/* 지정된 페이지 수의 PDF File 생성 헬퍼 */
async function createPdfFile(pageCount = 1, name = 'test.pdf'): Promise<File> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) {
    doc.addPage([595, 842]);
  }
  const bytes = await doc.save();
  /* Uint8Array를 Blob-compatible 형태로 변환 */
  return new File([new Uint8Array(bytes)], name, { type: 'application/pdf' });
}

describe('mergePdfs', () => {
  it('두 PDF를 병합하면 페이지 수가 합산된다', async () => {
    const file1 = await createPdfFile(2, 'a.pdf');
    const file2 = await createPdfFile(3, 'b.pdf');
    const result = await mergePdfs([file1, file2]);
    const merged = await PDFDocument.load(result);
    expect(merged.getPageCount()).toBe(5);
  });

  it('단일 파일도 병합 가능하다', async () => {
    const file = await createPdfFile(4, 'single.pdf');
    const result = await mergePdfs([file]);
    const merged = await PDFDocument.load(result);
    expect(merged.getPageCount()).toBe(4);
  });

  it('21개 파일 입력 시 TOO_MANY_FILES 에러를 던진다', async () => {
    const files = await Promise.all(
      Array.from({ length: 21 }, (_, i) => createPdfFile(1, `f${i}.pdf`))
    );
    await expect(mergePdfs(files)).rejects.toThrow(PdfMergeError);
    await expect(mergePdfs(files)).rejects.toMatchObject({ code: 'TOO_MANY_FILES' });
  });

  it('총 크기 100MB 초과 시 TOO_LARGE 에러를 던진다', async () => {
    const bigFile = new File([new Uint8Array(PDF_MAX_TOTAL_SIZE + 1)], 'big.pdf', { type: 'application/pdf' });
    await expect(mergePdfs([bigFile])).rejects.toMatchObject({ code: 'TOO_LARGE' });
  });

  it('진행률 콜백이 0→100 범위로 호출된다', async () => {
    const file = await createPdfFile(1);
    const progressValues: number[] = [];
    await mergePdfs([file], (p) => progressValues.push(p));
    expect(progressValues[0]).toBe(0);
    expect(progressValues[progressValues.length - 1]).toBe(100);
    // 진행률은 단조 증가
    for (let i = 1; i < progressValues.length; i++) {
      expect(progressValues[i]).toBeGreaterThanOrEqual(progressValues[i - 1]);
    }
  });

  it('암호화된 PDF 처리 시 ENCRYPTED 에러를 던진다', async () => {
    /* 유효하지 않은 바이트를 암호화된 PDF처럼 사용 */
    const badFile = new File([new Uint8Array([0, 1, 2, 3])], 'enc.pdf', { type: 'application/pdf' });
    await expect(mergePdfs([badFile])).rejects.toMatchObject({ code: 'ENCRYPTED' });
  });
});
