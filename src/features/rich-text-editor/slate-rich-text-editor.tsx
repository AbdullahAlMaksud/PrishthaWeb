"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { createEditor, Descendant } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import { withHistory } from "slate-history";
import {
  saveRichEditor,
  loadRichEditor,
} from "@/shared/lib/local-storage";
import { useKeyboardSound } from "@/shared/hooks/use-keyboard-sound";
import { INITIAL_VALUE } from "./slate-constants";
import { exportToTxt, exportToPdf } from "./slate-export";
import { renderSlateElement, renderSlateLeaf } from "./slate-renderers";
import { SlateToolbar } from "./slate-toolbar";
import { ISlateRichTextEditorProps } from "./slate-editor";

export const SlateRichTextEditor: React.FC<ISlateRichTextEditorProps> = ({ 
  fileId, 
  onFileSaved, 
  actionsRef, 
  keyboardSoundEnabled,
  showAlert,
  showPrompt
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const previewEditor = useMemo(() => withReact(createEditor()), []);

  const [value, setValue] = useState<Descendant[]>(INITIAL_VALUE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load initial content on client mount
  useEffect(() => {
    const saved = loadRichEditor();
    if (saved && Array.isArray(saved)) {
      setValue(saved);
    }
    setIsLoaded(true);
  }, []);

  // Enable keyboard sound
  useKeyboardSound(keyboardSoundEnabled, undefined, "default");

  const handleChange = (newValue: Descendant[]) => {
    setValue(newValue);
    if (isLoaded) {
      saveRichEditor(newValue);
    }
  };

  const triggerReRender = () => {
    setValue([...editor.children]);
  };

  const handleSave = useCallback(() => {
    import("@/shared/lib/local-storage").then(({ saveRichFile, updateRichFile }) => {
      if (fileId) {
        updateRichFile(fileId, value);
        if (showAlert) {
          showAlert("Success", "File saved successfully!");
        }
      } else {
        if (showPrompt) {
          showPrompt("Enter file name", "Untitled Document", (name) => {
            if (name && name.trim()) {
              const newFile = saveRichFile(name.trim(), value);
              if (onFileSaved) {
                onFileSaved(newFile.id);
              }
              if (showAlert) {
                showAlert("Success", "File saved as new!");
              }
            }
          });
        }
      }
    });
  }, [fileId, value, onFileSaved, showAlert, showPrompt]);

  // Expose actions to parent component
  useEffect(() => {
    if (actionsRef) {
      actionsRef.current = {
        save: handleSave,
        downloadTxt: () => exportToTxt(value),
        downloadPdf: () => exportToPdf(value, showAlert),
        togglePreview: () => setShowPreview((prev) => !prev),
        showPreview: showPreview,
      };
    }
  }, [value, showPreview, actionsRef, showAlert, handleSave]);

  return (
    <div className="w-full min-h-screen bg-background overflow-y-auto px-6 md:px-12 pt-16 pb-12">
      <div className={`${showPreview ? "max-w-7xl" : "max-w-4xl"} mx-auto w-full flex flex-col`}>
        {/* Formatting Toolbar */}
        <div className="mb-6 sticky top-4 z-10 bg-background/95 backdrop-blur-sm pb-2 border-b border-border/40">
          <SlateToolbar editor={editor} triggerReRender={triggerReRender} />
        </div>

        {/* Writing Canvas / Preview Grid */}
        <div className={`grid ${showPreview ? "grid-cols-1 md:grid-cols-2 gap-12 divide-y md:divide-y-0 md:divide-x divide-border" : "grid-cols-1"}`}>
          {/* Editor Column */}
          <div id="slate-export" className="min-h-[500px] flex flex-col">
            <Slate editor={editor} initialValue={value} onChange={handleChange}>
              <Editable
                renderElement={renderSlateElement}
                renderLeaf={renderSlateLeaf}
                placeholder="Start writing your content..."
                className="prose dark:prose-invert max-w-none focus:outline-none min-h-[500px] text-lg text-foreground leading-relaxed"
                spellCheck
                autoFocus
              />
            </Slate>
          </div>

          {/* Preview Column */}
          {showPreview && (
            <div id="slate-preview" className="md:pl-12 pt-8 md:pt-0 overflow-y-auto flex flex-col">
              <h3 className="text-xl font-bold mb-6 text-foreground border-b pb-2 uppercase tracking-wide text-xs text-muted-foreground">
                Document Live Preview
              </h3>
              <div className="prose dark:prose-invert max-w-none text-foreground leading-relaxed">
                <Slate editor={previewEditor} initialValue={value}>
                  <Editable renderElement={renderSlateElement} renderLeaf={renderSlateLeaf} readOnly />
                </Slate>
              </div>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="flex items-center justify-between border-t pt-4 mt-12 text-sm text-muted-foreground">
          <div>
            {fileId ? "Saved locally" : "Draft"}
          </div>
          <div className="text-xs uppercase tracking-wider">
            Rich Document
          </div>
        </div>
      </div>
    </div>
  );
};
