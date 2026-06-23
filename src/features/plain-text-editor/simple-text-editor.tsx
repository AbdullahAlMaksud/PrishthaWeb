"use client";

import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";
import {
  saveSimpleEditor,
  loadSimpleEditor,
  listSimpleFiles,
} from "@/shared/lib/local-storage";
import { useKeyboardSound } from "@/shared/hooks/use-keyboard-sound";
import { printSimpleDocument, downloadSimpleDocumentTxt } from "./simple-editor-export";
import { ISimpleTextEditorProps } from "./simple-editor";
import { exportSimpleToPdf } from "./simple-editor-pdf";

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
  keyboardSoundEnabled,
  keyboardSoundType,
  onToggleSound,
  showAlert,
}) => {
  const [description, setDescription] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [savedFileName, setSavedFileName] = useState<string | null>(null);
  const [savedFileDescription, setSavedFileDescription] = useState<string>("");

  // Load initial content on mount
  useEffect(() => {
    setDescription(loadSimpleEditor().description);
    setIsLoaded(true);
  }, []);

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
    if (!isLoaded) return;
    const timer = setTimeout(() => {
      saveSimpleEditor({ title, description });
    }, 500);

    return () => clearTimeout(timer);
  }, [title, description, isLoaded]);

  // Enable keyboard sound
  useKeyboardSound(keyboardSoundEnabled, editorRef, keyboardSoundType);

  const handleSave = () => {
    import("@/shared/lib/local-storage").then(({ saveSimpleFile, updateSimpleFile }) => {
      if (fileId) {
        updateSimpleFile(fileId, { title, description });
        if (showAlert) {
          showAlert("Success", "File saved successfully!");
        }
      } else {
        const newFile = saveSimpleFile(title, { title, description });
        if (onFileSaved) {
          onFileSaved(newFile.id);
        }
        if (showAlert) {
          showAlert("Success", "File saved successfully!");
        }
      }
    });
  };

  // Expose actions to parent component
  useEffect(() => {
    if (actionsRef) {
      actionsRef.current = {
        save: handleSave,
        downloadTxt: () => downloadSimpleDocumentTxt(title, description),
        downloadPdf: () => {
          exportSimpleToPdf(title, description, showAlert);
        },
        print: () => printSimpleDocument(title, description),
      };
    }
  }, [title, description, fileId, actionsRef, showAlert]);

  return (
    <div
      ref={editorRef}
      className="w-full h-full bg-transparent flex flex-col px-6 md:px-12 pt-8 pb-8 overflow-hidden"
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
        <div className="flex items-center justify-between border-t pt-4 mt-6 text-sm text-muted-foreground shrink-0 animate-fade-in">
          <div className="flex gap-4">
            <span>Characters: {description.length}</span>
            <span>•</span>
            <span>
              Words: {description.trim().split(/\s+/).filter(Boolean).length}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {onToggleSound && (
              <button
                onClick={() => onToggleSound(!keyboardSoundEnabled)}
                className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                title={keyboardSoundEnabled ? "Mute typing sounds" : "Unmute typing sounds"}
                aria-label="Toggle typing sound"
              >
                {keyboardSoundEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </button>
            )}
            <span className="text-xs uppercase tracking-wider">
              {fileId ? "Saved locally" : "Draft"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
