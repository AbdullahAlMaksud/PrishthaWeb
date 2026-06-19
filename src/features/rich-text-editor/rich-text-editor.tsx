"use client";

import React, { useEffect, useRef, useState } from "react";
import type { OutputData } from "@editorjs/editorjs";
import { saveRichEditor, loadRichEditor } from "@/shared/lib/local-storage";
import { exportEditorjsToTxt, exportEditorjsToPdf } from "./editorjs-export";
import { EditorjsPreview } from "./editorjs-preview";

export const RichTextEditor: React.FC = () => {
  const editorRef = useRef<{
    destroy: () => void;
    save: () => Promise<OutputData>;
    isReady: Promise<void>;
  } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<OutputData | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || isInitialized) return;

    const initEditor = async () => {
      const savedData = loadRichEditor();

      const EditorJS = (await import("@editorjs/editorjs")).default;
      const Header = (await import("@editorjs/header")).default;
      const Paragraph = (await import("@editorjs/paragraph")).default;
      const List = (await import("@editorjs/list")).default;
      const LinkTool = (await import("@editorjs/link")).default;
      const ImageTool = (await import("@editorjs/image")).default;
      const Table = (await import("@editorjs/table")).default;
      const Quote = (await import("@editorjs/quote")).default;
      const Marker = (await import("@editorjs/marker")).default;
      const Underline = (await import("@editorjs/underline")).default;

      editorRef.current = new EditorJS({
        holder: "editorjs",
        tools: {
          header: {
            class: Header,
            config: {
              placeholder: "Enter a header",
              levels: [1, 2, 3, 4, 5, 6],
              defaultLevel: 2,
            },
          },
          paragraph: {
            class: Paragraph,
            inlineToolbar: true,
          },
          list: {
            class: List,
            inlineToolbar: true,
          },
          linkTool: {
            class: LinkTool,
            config: {
              endpoint: "/api/fetchUrl",
            },
          },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                uploadByFile(file: File) {
                  return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      resolve({
                        success: 1,
                        file: {
                          url: e.target?.result as string,
                        },
                      });
                    };
                    reader.readAsDataURL(file);
                  });
                },
              },
            },
          },
          table: {
            class: Table,
            inlineToolbar: true,
          },
          quote: {
            class: Quote,
            inlineToolbar: true,
          },
          marker: {
            class: Marker,
          },
          underline: {
            class: Underline,
          },
        },
        data: savedData || undefined,
        onChange: async () => {
          if (editorRef.current) {
            const content = await editorRef.current.save();
            saveRichEditor(content);
            if (showPreview) {
              setPreviewData(content);
            }
          }
        },
        placeholder: "Start writing your content...",
      });

      await editorRef.current.isReady;
      setIsInitialized(true);
    };

    initEditor();

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
      setIsInitialized(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const updatePreview = async () => {
      if (showPreview && editorRef.current) {
        const content = await editorRef.current.save();
        setPreviewData(content);
      }
    };
    updatePreview();
  }, [showPreview]);

  const handleExportTxt = async () => {
    if (!editorRef.current) return;
    const data = await editorRef.current.save();
    exportEditorjsToTxt(data);
  };

  const handleExportPdf = async () => {
    if (!editorRef.current) return;
    const data = await editorRef.current.save();
    exportEditorjsToPdf(data);
  };

  return (
    <div className="w-full h-full">
      <div className="flex items-center justify-between border-b pb-4 mb-4">
        <h2 className="text-xl font-semibold">Rich Text Editor</h2>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm">Show Preview</span>
            <input
              type="checkbox"
              checked={showPreview}
              onChange={(e) => setShowPreview(e.target.checked)}
              className="w-4 h-4"
            />
          </label>
          <button
            onClick={handleExportTxt}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm cursor-pointer"
          >
            Export TXT
          </button>
          <button
            onClick={handleExportPdf}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm cursor-pointer"
          >
            Export PDF
          </button>
        </div>
      </div>

      <div
        className={`grid ${showPreview ? "grid-cols-2 gap-4" : "grid-cols-1"}`}
      >
        <div className="border rounded-lg p-4">
          <div id="editorjs" className="min-h-96" />
        </div>

        {showPreview && (
          <div className="border rounded-lg p-4 bg-gray-50 overflow-auto">
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            <EditorjsPreview previewData={previewData} />
          </div>
        )}
      </div>
    </div>
  );
};
