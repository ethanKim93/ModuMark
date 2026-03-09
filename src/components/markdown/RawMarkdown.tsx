'use client';

interface RawMarkdownProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Raw 마크다운 텍스트 직접 편집기
 * textarea 기반으로 마크다운 원문을 편집
 */
export function RawMarkdown({ value, onChange }: RawMarkdownProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-full min-h-[calc(100vh-10rem)] resize-none bg-transparent text-foreground font-mono text-[14px] leading-relaxed p-0 border-none outline-none focus:ring-0 focus:outline-none"
      placeholder="마크다운을 입력하세요..."
      spellCheck={false}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
    />
  );
}
