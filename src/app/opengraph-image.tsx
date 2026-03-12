import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';
export const alt = 'ModuMark - 무료 마크다운 편집기 + PDF 도구';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#111921',
          padding: '60px',
        }}
      >
        {/* 로고 텍스트 */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: '#1773CF',
            marginBottom: 24,
            letterSpacing: '-2px',
          }}
        >
          ModuMark
        </div>
        {/* 설명 */}
        <div
          style={{
            fontSize: 28,
            color: '#94a3b8',
            textAlign: 'center',
            lineHeight: 1.5,
            maxWidth: 800,
          }}
        >
          무료 마크다운 WYSIWYG 편집기 + PDF 통합 도구
        </div>
        {/* 특징 뱃지 */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            marginTop: 40,
          }}
        >
          {['로컬 처리', '무료', 'PDF 병합·분할·OCR'].map((label) => (
            <div
              key={label}
              style={{
                backgroundColor: '#1773CF20',
                border: '1px solid #1773CF50',
                borderRadius: 8,
                padding: '8px 20px',
                color: '#60a5fa',
                fontSize: 20,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
