"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  saveSimpleEditor,
  loadSimpleEditor,
} from "@/shared/lib/local-storage";
import { useKeyboardSound } from "@/shared/hooks/use-keyboard-sound";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { printSimpleDocument, downloadSimpleDocumentTxt } from "./simple-editor-export";
import { ISimpleTextEditorProps } from "./simple-editor";

export const SimpleTextEditor: React.FC<ISimpleTextEditorProps> = ({ 
  fileId, 
  onFileSaved, 
  actionsRef, 
  keyboardSoundEnabled 
}) => {
  const [title, setTitle] = useState(() => {
    if (typeof window !== "undefined") {
      return loadSimpleEditor().title;
    }
    return "";
  });
  const [description, setDescription] = useState(() => {
    if (typeof window !== "undefined") {
      return loadSimpleEditor().description;
    }
    return "";
  });
  const editorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-save to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      saveSimpleEditor({ title, description });
    }, 500);

    return () => clearTimeout(timer);
  }, [title, description]);

  // Enable keyboard sound
  useKeyboardSound(keyboardSoundEnabled, editorRef);

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      textareaRef.current?.focus();
    }
  };

  const handleSave = () => {
    import("@/shared/lib/local-storage").then(({ saveSimpleFile, updateSimpleFile }) => {
      if (fileId) {
        updateSimpleFile(fileId, { title, description });
        alert("File saved successfully!");
      } else {
        const name = prompt("Enter file name:", title || "Untitled");
        if (name) {
          const newFile = saveSimpleFile(name, { title, description });
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
        downloadTxt: () => downloadSimpleDocumentTxt(title, description),
        print: () => printSimpleDocument(title, description),
      };
    }
  }, [title, description, fileId, actionsRef]);

  // Dynamic height adjustment for textarea to prevent double scrollbars
  const adjustHeight = () => {
    const tx = textareaRef.current;
    if (tx) {
      tx.style.height = "auto";
      tx.style.height = tx.scrollHeight + "px";
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [description]);

  return (
    <div
      ref={editorRef}
      className="w-full min-h-screen bg-background overflow-y-auto px-6 md:px-12 py-24"
    >
      <div className="max-w-4xl mx-auto w-full flex flex-col min-h-full">
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleTitleKeyDown}
          placeholder="Enter your title..."
          className="border-0 rounded-none focus-visible:ring-0 text-4xl font-extrabold px-0 mb-6 bg-transparent outline-none shadow-none text-foreground"
        />

        <Textarea
          ref={textareaRef}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Write your content here..."
          className="flex-1 border-0 rounded-none focus-visible:ring-0 resize-none text-lg px-0 py-2 bg-transparent outline-none shadow-none text-foreground leading-relaxed min-h-[400px] overflow-hidden"
        />

        {/* Minimal info at bottom */}
        <div className="flex items-center justify-between border-t pt-4 mt-12 text-sm text-muted-foreground">
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
