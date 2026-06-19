"use client";

import React, { useMemo, useState, useEffect } from "react";
import { createEditor, Descendant } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import { withHistory } from "slate-history";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import {
  saveRichEditor,
  loadRichEditor,
  saveKeyboardSoundSetting,
  loadKeyboardSoundSetting,
} from "@/shared/lib/local-storage";
import { useKeyboardSound } from "@/shared/hooks/use-keyboard-sound";
import { Eye, EyeOff, FileText, FileDown, Volume2, VolumeX, Save } from "lucide-react";
import { INITIAL_VALUE } from "./slate-constants";
import { exportToTxt, exportToPdf } from "./slate-export";
import { renderSlateElement, renderSlateLeaf } from "./slate-renderers";
import { SlateToolbar } from "./slate-toolbar";
import { ISlateRichTextEditorProps } from "./slate-editor";

export const SlateRichTextEditor: React.FC<ISlateRichTextEditorProps> = ({ fileId, onFileSaved }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [keyboardSoundEnabled, setKeyboardSoundEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      return loadKeyboardSoundSetting();
    }
    return false;
  });

  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const previewEditor = useMemo(() => withReact(createEditor()), []);

  const [value, setValue] = useState<Descendant[]>(() => {
    const saved = loadRichEditor();
    return saved && Array.isArray(saved) ? saved : INITIAL_VALUE;
  });

  // Enable keyboard sound
  useKeyboardSound(keyboardSoundEnabled, undefined, true);

  // Save keyboard sound setting
  useEffect(() => {
    saveKeyboardSoundSetting(keyboardSoundEnabled);
  }, [keyboardSoundEnabled]);

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
        alert("File saved!");
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

  return (
    <div className="w-full h-full flex flex-col p-4">
      {/* Toolbar */}
      <SlateToolbar editor={editor} triggerReRender={triggerReRender} />

      {/* Editor and Preview */}
      <div className={`flex-1 grid ${showPreview ? "grid-cols-2 gap-4" : "grid-cols-1"} overflow-hidden`}>
        {/* Editor */}
        <div className="border rounded-b-xl bg-background flex flex-col overflow-hidden">
          <div id="slate-export" className="flex-1 overflow-y-auto mb-4 p-8">
            <Slate editor={editor} initialValue={value} onChange={handleChange}>
              <Editable
                renderElement={renderSlateElement}
                renderLeaf={renderSlateLeaf}
                placeholder="Start writing your content..."
                className="prose prose-sm max-w-none focus:outline-none h-full"
                spellCheck
                autoFocus
              />
            </Slate>
          </div>

          <div className="flex items-center gap-2 px-5 py-3 bg-muted border-t">
            <Toggle
              variant="outline"
              pressed={keyboardSoundEnabled}
              onPressedChange={setKeyboardSoundEnabled}
              aria-label="Toggle keyboard sound"
              size="sm"
            >
              {keyboardSoundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Toggle>

            <Button variant={fileId ? "default" : "secondary"} size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" />
              {fileId ? "Save" : "Save As"}
            </Button>

            <Button variant={showPreview ? "default" : "secondary"} size="sm" onClick={() => setShowPreview(!showPreview)}>
              {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportToTxt(value)}>
              <FileText className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={() => exportToPdf(value)}>
              <FileDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Preview */}
        {showPreview && (
          <div id="slate-preview" className="border rounded-lg p-6 bg-muted/30 overflow-y-auto flex flex-col">
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            <div className="prose prose-sm max-w-none">
              <Slate editor={previewEditor} initialValue={value}>
                <Editable renderElement={renderSlateElement} renderLeaf={renderSlateLeaf} readOnly />
              </Slate>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
