import * as pdfjsLib from 'pdfjs-dist';

/* PDF.js worker — public 폴더의 복사본 사용 */
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

export { pdfjsLib };
