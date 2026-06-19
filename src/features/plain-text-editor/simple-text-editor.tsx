"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  saveSimpleEditor,
  loadSimpleEditor,
  saveKeyboardSoundSetting,
  loadKeyboardSoundSetting,
} from "@/shared/lib/local-storage";
import { useKeyboardSound } from "@/shared/hooks/use-keyboard-sound";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Maximize,
  Minimize,
  Download,
  Volume2,
  VolumeX,
  Printer,
  Save,
} from "lucide-react";
import { printSimpleDocument, downloadSimpleDocumentTxt } from "./simple-editor-export";
import { ISimpleTextEditorProps } from "./simple-editor";

export const SimpleTextEditor: React.FC<ISimpleTextEditorProps> = ({ fileId, onFileSaved }) => {
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [keyboardSoundEnabled, setKeyboardSoundEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      return loadKeyboardSoundSetting();
    }
    return false;
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

  // Save keyboard sound setting
  useEffect(() => {
    saveKeyboardSoundSetting(keyboardSoundEnabled);
  }, [keyboardSoundEnabled]);

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
        alert("File saved!");
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

  const handleFullscreen = () => {
    if (!editorRef.current) return;

    if (!document.fullscreenElement) {
      editorRef.current.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable fullscreen:", err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <div
      ref={editorRef}
      className={`w-full h-full flex items-center justify-center ${
        isFullscreen ? "bg-background p-8" : "p-4"
      }`}
    >
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 flex flex-col border rounded-2xl overflow-hidden bg-background shadow-lg">
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleTitleKeyDown}
            placeholder="Enter your title..."
            className="border-0 rounded-none focus-visible:ring-0 h-16 text-xl font-bold px-5"
          />

          <Textarea
            ref={textareaRef}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write your content here..."
            className="flex-1 border-0 rounded-none focus-visible:ring-0 resize-none text-xl px-5 py-4 h-0"
          />

          <div className="flex items-center justify-between bg-muted px-5 py-3 border-t">
            <div className="flex items-center gap-2">
              <Toggle
                variant="outline"
                pressed={keyboardSoundEnabled}
                onPressedChange={setKeyboardSoundEnabled}
                aria-label="Toggle keyboard sound"
                size="sm"
              >
                {keyboardSoundEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </Toggle>

              <Button onClick={handleSave} size="sm" variant={fileId ? "default" : "secondary"}>
                <Save className="h-4 w-4 mr-1" />
                {fileId ? "Save" : "Save As"}
              </Button>

              <Button onClick={handleFullscreen} size="sm">
                {isFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </Button>

              <Button onClick={() => printSimpleDocument(title, description)} size="sm" variant="outline">
                <Printer className="h-4 w-4" />
              </Button>

              <Button onClick={() => downloadSimpleDocumentTxt(title, description)} size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-3">
              <span>Characters: {description.length}</span>
              <span>•</span>
              <span>
                Words: {description.trim().split(/\s+/).filter(Boolean).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
