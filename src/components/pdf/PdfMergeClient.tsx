'use client';

import { useState } from 'react';
import { PdfViewer } from './PdfViewer';
import { DropZone } from './DropZone';

export function PdfMergeClient() {
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 헤더 */}
      <div className="border-b border-border px-6 py-4 bg-surface shrink-0">
        <h1 className="text-lg font-bold text-foreground">PDF 병합</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          여러 PDF를 하나로 합칩니다. 최대 20개 파일, 100MB.
        </p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {previewFile ? (
          <div className="h-full border border-border rounded-lg overflow-hidden">
            <PdfViewer file={previewFile} />
          </div>
        ) : (
          <div className="max-w-xl">
            <DropZone
              onDrop={(files) => setPreviewFile(files[0])}
              multiple
              label="PDF 파일을 드래그하거나 클릭하여 추가"
            />
          </div>
        )}
      </div>
    </div>
  );
}
