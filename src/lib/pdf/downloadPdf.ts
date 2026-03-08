/* PDF Uint8Array를 파일로 다운로드 */
export function downloadPdf(bytes: Uint8Array, filename: string) {
  // byteOffset 이슈 방지: 새 ArrayBuffer로 안전하게 복사 후 Blob 생성
  const safeBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const blob = new Blob([safeBuffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // 브라우저가 다운로드를 시작할 시간을 준 후 해제
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
