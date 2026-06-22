"use client";

import React, { useMemo, useState, useEffect } from "react";
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
  keyboardSoundEnabled 
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const previewEditor = useMemo(() => withReact(createEditor()), []);

  const [value, setValue] = useState<Descendant[]>(() => {
    const saved = loadRichEditor();
    return saved && Array.isArray(saved) ? saved : INITIAL_VALUE;
  });

  // Enable keyboard sound
  useKeyboardSound(keyboardSoundEnabled, undefined, true);

  const handleChange = (newValue: Descendant[]) => {
    setValue(newValue);
    saveRichEditor(newValue);
  };

  const triggerReRender = () => {
    setValue([...editor.children]);
  };

  const handleSave = () => {
    import("@/shared/lib/local-storage").then(({ saveRichFile, updateRichFile }) => {
      if (fileId) {
        updateRichFile(fileId, value);
        alert("File saved successfully!");
      } else {
        const name = prompt("Enter file name:", "Untitled Document");
        if (name) {
          const newFile = saveRichFile(name, value);
          if (onFileSaved) {
            onFileSaved(newFile.id);
          }
          alert("File saved as new!");
        }
      }
    });
  };

  // Expose actions to parent component
  useEffect(() => {
    if (actionsRef) {
      actionsRef.current = {
        save: handleSave,
        downloadTxt: () => exportToTxt(value),
        downloadPdf: () => exportToPdf(value),
        togglePreview: () => setShowPreview((prev) => !prev),
        showPreview: showPreview,
      };
    }
  }, [value, fileId, showPreview, actionsRef]);

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
