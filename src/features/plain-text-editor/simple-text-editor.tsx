"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  saveSimpleEditor,
  loadSimpleEditor,
  listSimpleFiles,
} from "@/shared/lib/local-storage";
import { useKeyboardSound } from "@/shared/hooks/use-keyboard-sound";
import { printSimpleDocument, downloadSimpleDocumentTxt } from "./simple-editor-export";
import { ISimpleTextEditorProps } from "./simple-editor";

const getAutoTitle = (text: string): string => {
  if (!text || !text.trim()) return "Untitled Document";
  const firstLine = text.split("\n")[0].trim();
  if (!firstLine) return "Untitled Document";
  const words = firstLine.split(/\s+/).filter(Boolean);
  if (words.length <= 5) {
    return firstLine;
  }
  return words.slice(0, 5).join(" ") + "...";
};

export const SimpleTextEditor: React.FC<ISimpleTextEditorProps> = ({ 
  fileId, 
  onFileSaved, 
  actionsRef, 
  keyboardSoundEnabled 
}) => {
  const [description, setDescription] = useState(() => {
    if (typeof window !== "undefined") {
      return loadSimpleEditor().description;
    }
    return "";
  });
  const editorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [savedFileName, setSavedFileName] = useState<string | null>(null);
  const [savedFileDescription, setSavedFileDescription] = useState<string>("");

  // Sync title from storage files lists to allow sidebar renaming to display correctly
  useEffect(() => {
    if (!fileId) {
      setSavedFileName(null);
      setSavedFileDescription("");
      return;
    }

    const syncWithStorage = () => {
      const files = listSimpleFiles();
      const file = files.find((f) => f.id === fileId);
      if (file) {
        setSavedFileName(file.name);
        setSavedFileDescription(file.content.description);
      }
    };

    syncWithStorage();
    const interval = setInterval(syncWithStorage, 1000);
    return () => clearInterval(interval);
  }, [fileId]);

  // If user renamed the document in sidebar, saved name differs from its auto-derived title.
  const isCustomNamed = savedFileName !== null && savedFileName !== getAutoTitle(savedFileDescription);
  const title = isCustomNamed ? (savedFileName || "Untitled Document") : getAutoTitle(description);

  // Auto-save to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      saveSimpleEditor({ title, description });
    }, 500);

    return () => clearTimeout(timer);
  }, [title, description]);

  // Enable keyboard sound
  useKeyboardSound(keyboardSoundEnabled, editorRef);

  const handleSave = () => {
    import("@/shared/lib/local-storage").then(({ saveSimpleFile, updateSimpleFile }) => {
      if (fileId) {
        updateSimpleFile(fileId, { title, description });
        alert("File saved successfully!");
      } else {
        const newFile = saveSimpleFile(title, { title, description });
        if (onFileSaved) {
          onFileSaved(newFile.id);
        }
        alert("File saved successfully!");
      }
    });
  };

  // Expose actions to parent component
  useEffect(() => {
    if (actionsRef) {
      actionsRef.current = {
        save: handleSave,
        downloadTxt: () => downloadSimpleDocumentTxt(title, description),
        print: () => printSimpleDocument(title, description),
      };
    }
  }, [title, description, fileId, actionsRef]);

  return (
    <div
      ref={editorRef}
      className="w-full h-full bg-background flex flex-col px-6 md:px-12 pt-8 pb-8 overflow-hidden"
    >
      <div className="w-full flex-1 flex flex-col min-h-0 bg-card border border-border/40 rounded-2xl p-6 md:p-10 shadow-lg">
        <textarea
          ref={textareaRef}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Write your content here..."
          className="flex-1 w-full bg-transparent resize-none outline-none border-0 text-lg text-foreground leading-relaxed min-h-0 overflow-y-auto placeholder:text-muted-foreground"
          autoFocus
        />

        {/* Minimal info at bottom */}
        <div className="flex items-center justify-between border-t pt-4 mt-6 text-sm text-muted-foreground shrink-0">
          <div className="flex gap-4">
            <span>Characters: {description.length}</span>
            <span>•</span>
            <span>
              Words: {description.trim().split(/\s+/).filter(Boolean).length}
            </span>
          </div>
          <div className="text-xs uppercase tracking-wider">
            {fileId ? "Saved locally" : "Draft"}
          </div>
        </div>
      </div>
    </div>
  );
};
