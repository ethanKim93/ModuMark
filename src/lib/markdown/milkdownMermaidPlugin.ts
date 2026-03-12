/**
 * 커스텀 Milkdown Mermaid 플러그인
 * - @milkdown/plugin-diagram(v7.7.0)은 deprecated → 직접 구현
 * - code_block 노드의 language='mermaid'인 경우 SVG로 렌더링
 * - ProseMirror NodeView 기반, contentDOM 유지로 편집 상태 보존
 */

import { $view } from '@milkdown/kit/utils';
import { codeBlockSchema } from '@milkdown/kit/preset/commonmark';
import type { Node } from '@milkdown/kit/prose/model';
import { renderMermaid, type MermaidTheme } from './mermaidRenderer';

/** 전역 테마 상태 — MilkdownEditor에서 갱신 */
let currentTheme: MermaidTheme = 'dark';

export function setMermaidTheme(theme: MermaidTheme) {
  currentTheme = theme;
}

export const milkdownMermaidPlugin = $view(codeBlockSchema.node, () => {
  return (node: Node) => {
    const attrs = node.attrs as { language: string };
    const language = attrs.language;

    /* mermaid가 아닌 코드 블록: pre > code (기본 렌더링) */
    if (language !== 'mermaid') {
      const pre = document.createElement('pre');
      const code = document.createElement('code');
      if (language) code.className = `language-${language}`;
      pre.appendChild(code);

      return {
        dom: pre,
        contentDOM: code,
        update(newNode: Node) {
          if (newNode.type !== node.type) return false;
          const newAttrs = newNode.attrs as { language: string };
          /* language가 mermaid로 변경되면 뷰를 재생성하도록 false 반환 */
          if (newAttrs.language === 'mermaid') return false;
          code.className = newAttrs.language ? `language-${newAttrs.language}` : '';
          return true;
        },
      };
    }

    /* mermaid 코드 블록: SVG 미리보기 + 숨겨진 contentDOM */
    const container = document.createElement('div');
    container.className = 'mermaid-container';
    container.setAttribute('data-mermaid', 'true');

    const svgWrapper = document.createElement('div');
    svgWrapper.className = 'mermaid-svg-wrapper';

    /* ProseMirror 내용 관리를 위한 숨겨진 contentDOM
     * visibility:hidden 대신 절대 위치로 화면 밖에 배치 */
    const hiddenContent = document.createElement('code');
    hiddenContent.setAttribute('aria-hidden', 'true');
    hiddenContent.style.cssText =
      'position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden';

    container.appendChild(svgWrapper);
    container.appendChild(hiddenContent);

    const renderSvg = async (code: string) => {
      svgWrapper.innerHTML =
        '<div class="mermaid-loading">다이어그램 렌더링 중...</div>';
      try {
        const svg = await renderMermaid(code, currentTheme);
        svgWrapper.innerHTML = svg;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        svgWrapper.innerHTML = `<div class="mermaid-error">${msg}</div>`;
      }
    };

    renderSvg(node.textContent);

    return {
      dom: container,
      contentDOM: hiddenContent,
      update(newNode: Node) {
        if (newNode.type !== node.type) return false;
        const newAttrs = newNode.attrs as { language: string };
        if (newAttrs.language !== 'mermaid') return false;
        renderSvg(newNode.textContent);
        return true;
      },
    };
  };
});
