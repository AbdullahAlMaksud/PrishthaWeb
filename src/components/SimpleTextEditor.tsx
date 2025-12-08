"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  saveSimpleEditor,
  loadSimpleEditor,
  saveKeyboardSoundSetting,
  loadKeyboardSoundSetting,
} from "@/utils/localStorage";
import { useKeyboardSound } from "@/hooks/useKeyboardSound";
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

export interface SimpleTextEditorProps {
  fileId?: string | null;
  onFileSaved?: (id: string) => void;
}

export const SimpleTextEditor: React.FC<SimpleTextEditorProps> = ({ fileId, onFileSaved }) => {
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
      // If we have an active file ID, also update the file record
      if (fileId) {
        // We only auto-update the file record if we want auto-save to persist to the file list too. 
        // For now, let's keep explicit "Save" for the file list to avoid accidental overwrites of the saved "version" 
        // vs the "working copy".
        // actually, modern apps usually auto-save everything.
        // Let's stick to explicit save for "files" to match user request "save store... access from menu". 
        // Usually implies a file system feel.
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [title, description, fileId]);

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
    // Dynamic import to avoid SSR issues if needed, or just use the imported functions
    // We need to import saveSimpleFile and updateSimpleFile
    import("@/utils/localStorage").then(({ saveSimpleFile, updateSimpleFile }) => {
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

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title || "Document"}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 40px auto;
              padding: 20px;
              line-height: 1.6;
            }
            h1 {
              margin-bottom: 20px;
              color: #333;
            }
            pre {
              white-space: pre-wrap;
              word-wrap: break-word;
              font-family: inherit;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <h1>${title || "Untitled Document"}</h1>
          <pre>${description}</pre>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
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

  const handleDownloadTxt = () => {
    const timestamp = new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    const separator = "=".repeat(title.length || 20);
    const content = `${
      title || "Untitled Document"
    }\n${separator}\n\n${description}\n\n---\nGenerated on: ${timestamp}`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title || "document"}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      ref={editorRef}
      className={`w-full h-full flex items-center justify-center ${
        isFullscreen ? "bg-background p-8" : "p-4"
      }`}
    >
      <div className="w-full  h-full flex flex-col">
        {/* Title Input */}
        <div className="flex-1 flex flex-col border rounded-2xl overflow-hidden bg-background shadow-lg">
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleTitleKeyDown}
            placeholder="Enter your title..."
            // Increased title font size and adjusted height for better spacing
            className="border-0 rounded-none focus-visible:ring-0 h-16 text-xl! font-bold px-5"
          />

          {/* Description Textarea */}
          <Textarea
            ref={textareaRef}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write your content here..."
            className="flex-1 border-0 rounded-none focus-visible:ring-0 resize-none text-xl! px-5 py-4 h-0"
          />

          {/* Toolbar */}
          <div className="flex items-center justify-between bg-muted px-5 py-3 border-t">
            {/* <h2 className="text-xl font-semibold">Simple Text Editor</h2> */}
            <div className="flex items-center gap-2">
              {/* Keyboard Sound Toggle */}
              <Toggle
                variant={"outline"}
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
                {/* <span className="text-xs">Sound</span> */}
              </Toggle>

              <Button onClick={handleSave} size="sm" variant={fileId ? "default" : "secondary"}>
                <Save className="h-4 w-4 mr-1" />
                {fileId ? "Save" : "Save As"}
              </Button>

              {/* Fullscreen Button */}
              <Button onClick={handleFullscreen} size="sm">
                {isFullscreen ? (
                  <>
                    <Minimize className="h-4 w-4" />
                    {/* Exit Fullscreen */}
                  </>
                ) : (
                  <>
                    <Maximize className="h-4 w-4" />
                    {/* Fullscreen */}
                  </>
                )}
              </Button>

              {/* Print Button */}
              <Button onClick={handlePrint} size="sm" variant="outline">
                <Printer className="h-4 w-4" />
                {/* Print */}
              </Button>

              {/* Download Button */}
              <Button onClick={handleDownloadTxt} size="sm">
                <Download className="h-4 w-4" />
                {/* Download TXT */}
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
