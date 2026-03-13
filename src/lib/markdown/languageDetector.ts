/**
 * 코드 내용 기반 언어 자동 감지
 * - 외부 라이브러리 없이 휴리스틱 패턴 매칭
 * - 오탐보다 미탐이 나은 보수적 규칙
 */

interface LanguageRule {
  lang: string;
  patterns: RegExp[];
}

/** 언어 감지 규칙 — 우선순위 순 (앞쪽이 높음) */
const RULES: LanguageRule[] = [
  {
    lang: 'mermaid',
    patterns: [
      /^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|gitGraph)\b/m,
    ],
  },
  {
    lang: 'json',
    patterns: [/^\s*[\[{]/, /"\w+"\s*:/],
  },
  {
    lang: 'yaml',
    patterns: [/^---\s*$/m, /^\w[\w-]*:\s/m],
  },
  {
    lang: 'html',
    patterns: [/^<!DOCTYPE|^<html|<\/?\w+[^>]*>/i],
  },
  {
    lang: 'css',
    patterns: [/^[\w.#@][\w\s,.#:>~+-]*\{/m, /:\s*[\w#]+;/],
  },
  {
    lang: 'sql',
    patterns: [/\b(SELECT|INSERT|UPDATE|DELETE|CREATE TABLE|ALTER)\b/i],
  },
  {
    lang: 'bash',
    patterns: [/^#!/, /\b(echo|sudo|apt|npm|yarn|cd|ls|grep|awk|sed)\b/],
  },
  {
    lang: 'python',
    patterns: [/\bdef\s+\w+\(/, /\bimport\s+\w+/, /\bclass\s+\w+.*:/],
  },
  {
    lang: 'typescript',
    patterns: [/:\s*(string|number|boolean|void)\b/, /interface\s+\w+/, /<\w+>/],
  },
  {
    lang: 'javascript',
    patterns: [/\b(const|let|var)\s+\w+\s*=/, /\bfunction\s+\w+/, /=>\s*[{(]/],
  },
  {
    lang: 'go',
    patterns: [/^package\s+\w+/m, /\bfunc\s+\w+/],
  },
  {
    lang: 'rust',
    patterns: [/\bfn\s+\w+/, /\blet\s+mut\b/, /\bimpl\b/],
  },
  {
    lang: 'java',
    patterns: [/\bpublic\s+(static\s+)?class\b/, /\bSystem\.out\./],
  },
  {
    lang: 'cpp',
    patterns: [/^#include\s*</m, /\bstd::/m, /\bcout\b/],
  },
  {
    lang: 'c',
    patterns: [/^#include\s*<stdio\.h>/m, /\bprintf\s*\(/],
  },
  {
    lang: 'markdown',
    patterns: [/^#{1,6}\s/m, /^\*\*.*\*\*/, /^\[.*\]\(.*\)/m],
  },
];

/**
 * 코드 내용을 분석해 언어를 자동 감지
 * @param code - 분석할 코드 문자열
 * @returns 감지된 언어 식별자, 감지 불가 시 null
 */
export function detectLanguage(code: string): string | null {
  if (!code || code.trim().length < 5) return null;

  for (const rule of RULES) {
    /* 해당 언어의 모든 패턴 중 하나라도 일치하면 감지 성공 */
    const matched = rule.patterns.some((pattern) => pattern.test(code));
    if (matched) return rule.lang;
  }

  return null;
}
