'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Editor, rootCtx, defaultValueCtx } from '@milkdown/kit/core';
import { commonmark } from '@milkdown/kit/preset/commonmark';
import { gfm } from '@milkdown/kit/preset/gfm';
import { listener, listenerCtx } from '@milkdown/kit/plugin/listener';
import { history } from '@milkdown/kit/plugin/history';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { nord } from '@milkdown/theme-nord';
import '@milkdown/theme-nord/style.css';
import { milkdownMermaidPlugin, setMermaidTheme } from '@/lib/markdown/milkdownMermaidPlugin';
import { renderMermaid, type MermaidTheme } from '@/lib/markdown/mermaidRenderer';

interface MilkdownEditorProps {
  defaultValue?: string;
  onChange?: (markdown: string) => void;
}

function EditorComponent({ defaultValue, onChange }: MilkdownEditorProps) {
  const { resolvedTheme } = useTheme();

  /* 테마 변경 시 mermaid 다이어그램 SVG 재렌더링 */
  useEffect(() => {
    const theme: MermaidTheme = resolvedTheme === 'dark' ? 'dark' : 'default';
    setMermaidTheme(theme);

    /* DOM에서 mermaid 블록을 찾아 SVG 재렌더링 */
    const containers = document.querySelectorAll<HTMLElement>('[data-mermaid="true"]');
    containers.forEach((container) => {
      const svgWrapper = container.querySelector<HTMLElement>('.mermaid-svg-wrapper');
      const hiddenContent = container.querySelector<HTMLElement>('code[aria-hidden]');
      if (!svgWrapper || !hiddenContent) return;

      const code = hiddenContent.textContent ?? '';
      if (!code.trim()) return;

      svgWrapper.innerHTML = '<div class="mermaid-loading">다이어그램 렌더링 중...</div>';
      renderMermaid(code, theme)
        .then((svg) => { svgWrapper.innerHTML = svg; })
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err);
          svgWrapper.innerHTML = `<div class="mermaid-error">${msg}</div>`;
        });
    });
  }, [resolvedTheme]);

  useEditor((root) =>
    Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root);
        ctx.set(defaultValueCtx, defaultValue ?? '');
        if (onChange) {
          ctx.get(listenerCtx).markdownUpdated((_ctx, markdown) => {
            onChange(markdown);
          });
        }
      })
      /* nord는 config 함수 — 테마 CSS 클래스 적용 */
      .config(nord)
      .use(commonmark)
      /* GFM 확장: 테이블, 취소선, 태스크 리스트, 자동링크 */
      .use(gfm)
      .use(listener)
      /* 100단계 Undo/Redo 히스토리 — Ctrl+Z / Ctrl+Y 기본 지원 */
      .use(history)
      /* mermaid 코드 블록 → SVG 렌더링 (커스텀 NodeView) */
      .use(milkdownMermaidPlugin)
  );

  return <Milkdown />;
}

export function MilkdownEditor(props: MilkdownEditorProps) {
  return (
    <MilkdownProvider>
      <EditorComponent {...props} />
    </MilkdownProvider>
  );
}
