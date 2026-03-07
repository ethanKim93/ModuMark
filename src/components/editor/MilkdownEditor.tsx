'use client';

import { Editor, rootCtx, defaultValueCtx } from '@milkdown/kit/core';
import { commonmark } from '@milkdown/kit/preset/commonmark';
import { listener, listenerCtx } from '@milkdown/kit/plugin/listener';
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
      .use(listener)
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
