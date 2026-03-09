"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { useTabStore } from "@/stores/tabStore";
import { saveMarkdownFile } from "@/lib/fileSystem";
import { UnsavedChangesDialog } from "@/components/markdown/UnsavedChangesDialog";

export function TabBar() {
  const { tabs, activeTabId, switchTab, closeTab, openTab } = useTabStore();
  const [pendingCloseId, setPendingCloseId] = useState<string | null>(null);

  const pendingTab = pendingCloseId ? tabs.find((t) => t.id === pendingCloseId) : null;

  const handleCloseRequest = (id: string) => {
    const tab = tabs.find((t) => t.id === id);
    if (tab?.isDirty) {
      setPendingCloseId(id);
    } else {
      closeTab(id);
    }
  };

  const handleSaveAndClose = async () => {
    const tab = tabs.find((t) => t.id === pendingCloseId);
    if (!tab) return;
    const result = await saveMarkdownFile(tab.content, tab.fileHandle ?? null);
    if (result) {
      useTabStore.getState().setFileHandle(tab.id, result.handle, result.name);
    }
    closeTab(tab.id);
    setPendingCloseId(null);
  };

  const handleDiscardAndClose = () => {
    if (pendingCloseId) closeTab(pendingCloseId);
    setPendingCloseId(null);
  };

  const handleNewTab = () => {
    openTab({ title: "Untitled", content: "", isDirty: false });
  };

  return (
    <>
      <div className="flex items-center border-b border-border bg-background overflow-x-auto shrink-0">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              className={`flex items-center gap-1.5 px-3 py-2 text-[13px] border-r border-border cursor-pointer shrink-0 select-none ${
                isActive
                  ? "bg-surface text-foreground"
                  : "text-muted-foreground hover:bg-surface/50 hover:text-foreground"
              }`}
              onClick={() => switchTab(tab.id)}
            >
              <span className="max-w-[120px] truncate">{tab.title}</span>
              {tab.isDirty && (
                <span className="text-primary text-xs leading-none">●</span>
              )}
              <button
                className="ml-0.5 rounded hover:bg-surface-secondary p-0.5 opacity-60 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseRequest(tab.id);
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}
        <button
          className="px-2 py-2 text-muted-foreground hover:text-foreground hover:bg-surface/50 shrink-0"
          onClick={handleNewTab}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <UnsavedChangesDialog
        open={!!pendingCloseId}
        tabTitle={pendingTab?.title ?? ""}
        onSave={handleSaveAndClose}
        onDiscard={handleDiscardAndClose}
        onCancel={() => setPendingCloseId(null)}
      />
    </>
  );
}
