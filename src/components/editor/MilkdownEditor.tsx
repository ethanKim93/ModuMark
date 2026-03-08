'use client';

import { Editor, rootCtx, defaultValueCtx } from '@milkdown/kit/core';
import { commonmark } from '@milkdown/kit/preset/commonmark';
import { gfm } from '@milkdown/kit/preset/gfm';
import { listener, listenerCtx } from '@milkdown/kit/plugin/listener';
import { history } from '@milkdown/kit/plugin/history';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { nord } from '@milkdown/theme-nord';
import '@milkdown/theme-nord/style.css';

interface MilkdownEditorProps {
  defaultValue?: string;
  onChange?: (markdown: string) => void;
}

function EditorComponent({ defaultValue, onChange }: MilkdownEditorProps) {
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
