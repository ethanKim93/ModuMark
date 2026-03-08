import { redirect } from 'next/navigation';

/* /pdf/ocr 접속 시 /pdf 통합 에디터로 리다이렉트 */
export default function PdfOcrPage() {
  redirect('/pdf');
}
