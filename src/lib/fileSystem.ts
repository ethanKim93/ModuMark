/* File System Access API 래퍼 (마크다운 파일 열기/저장) */

export interface OpenedFile {
  content: string;
  handle: FileSystemFileHandle | null;
  name: string;
}

/* .md 파일 열기 */
export async function openMarkdownFile(): Promise<OpenedFile | null> {
  try {
    if (typeof window !== 'undefined' && 'showOpenFilePicker' in window) {
      /* 모던 브라우저: File System Access API */
      const [handle] = await (window as Window & { showOpenFilePicker: (opts?: object) => Promise<FileSystemFileHandle[]> }).showOpenFilePicker({
        types: [
          {
            description: 'Markdown',
            accept: { 'text/markdown': ['.md', '.markdown'] },
          },
        ],
        excludeAcceptAllOption: true,
        multiple: false,
      });
      const file = await handle.getFile();
      const content = await file.text();
      return { content, handle, name: file.name };
    } else {
      /* 폴백: input[type=file] (Firefox 등) */
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.md,.markdown';
        input.onchange = async () => {
          const file = input.files?.[0];
          if (!file) {
            resolve(null);
            return;
          }
          const content = await file.text();
          resolve({ content, handle: null, name: file.name });
        };
        input.oncancel = () => resolve(null);
        input.click();
      });
    }
  } catch (err) {
    /* 사용자가 다이얼로그를 닫은 경우 무시 */
    if (err instanceof DOMException && err.name === 'AbortError') return null;
    throw err;
  }
}

/* .md 파일 저장 (fileHandle 있으면 덮어쓰기, 없으면 Save As) */
export async function saveMarkdownFile(
  content: string,
  existingHandle: FileSystemFileHandle | null
): Promise<{ handle: FileSystemFileHandle; name: string } | null> {
  try {
    let handle = existingHandle;

    if (!handle || !('showSaveFilePicker' in window)) {
      if (!('showSaveFilePicker' in window)) {
        /* 폴백: Blob 다운로드 */
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'untitled.md';
        a.click();
        URL.revokeObjectURL(url);
        return null;
      }
      handle = await (window as Window & { showSaveFilePicker: (opts?: object) => Promise<FileSystemFileHandle> }).showSaveFilePicker({
        suggestedName: 'untitled.md',
        types: [{ description: 'Markdown', accept: { 'text/markdown': ['.md'] } }],
      });
    }

    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();

    return { handle, name: handle.name };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return null;
    throw err;
  }
}
