"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode, AutoLinkNode } from "@lexical/link";
import { $getRoot, LexicalEditor } from "lexical";

import { lexicalTheme } from "./lexical-theme";
import { LexicalToolbar } from "./lexical-toolbar";
import { SlashMenu } from "./slash-menu";
import { SelectionTooltip } from "./selection-tooltip";
import { CustomBlockNode } from "./custom-block-node";
import { useKeyboardSound } from "@/shared/hooks/use-keyboard-sound";
import { listRichFiles } from "@/shared/lib/local-storage";
import { exportLexicalToTxt, exportLexicalToPdf } from "./lexical-export";
import { Volume2, VolumeX } from "lucide-react";

export interface ILexicalRichTextEditorProps {
  fileId?: string | null;
  onFileSaved?: (id: string) => void;
  actionsRef?: React.MutableRefObject<{
    save?: () => void;
    downloadTxt?: () => void;
    downloadPdf?: () => void;
    togglePreview?: () => void;
    showPreview?: boolean;
  }>;
  keyboardSoundEnabled: boolean;
  keyboardSoundType: string;
  onToggleSound?: (enabled: boolean) => void;
  showAlert?: (title: string, desc: string) => void;
  showPrompt?: (title: string, defaultValue: string, onSubmit: (value: string) => void) => void;
}

const loadInitialEditorState = (fileId: string | null | undefined): string | undefined => {
  if (typeof window === "undefined") return undefined;

  // If loading a specific file, read its content from localStorage list
  if (fileId) {
    const files = listRichFiles();
    const file = files.find((f) => f.id === fileId);
    if (file) {
      const contentStr = typeof file.content === "string" ? file.content : JSON.stringify(file.content);
      try {
        const parsed = JSON.parse(contentStr);
        if (parsed && typeof parsed === "object" && "root" in parsed) {
          return contentStr;
        }
      } catch {
        return undefined;
      }
    }
  }

  // Fallback to active editor session
  const saved = localStorage.getItem("richEditor");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === "object" && "root" in parsed) {
        return saved;
      }
    } catch {
      return undefined;
    }
  }
  return undefined;
};

// Catch any Lexical errors
const onError = (error: Error) => {
  console.error("Lexical Editor Error:", error);
};

export const LexicalRichTextEditor: React.FC<ILexicalRichTextEditorProps> = ({
  fileId,
  onFileSaved,
  actionsRef,
  keyboardSoundEnabled,
  keyboardSoundType,
  onToggleSound,
  showAlert,
  showPrompt,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [activeEditorState, setActiveEditorState] = useState<string>("");
  const [editorInstance, setEditorInstance] = useState<LexicalEditor | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const editorRef = useRef<HTMLDivElement>(null);

  // Enable keyboard sounds
  useKeyboardSound(keyboardSoundEnabled, undefined, keyboardSoundType);

  const initialConfig = {
    namespace: "PrishthaRichEditor",
    theme: lexicalTheme,
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      LinkNode,
      AutoLinkNode,
      CustomBlockNode,
    ],
    onError,
    editorState: loadInitialEditorState(fileId),
  };

  // Sync actions to parent actionsRef for Navbar trigger
  const handleSave = useCallback(() => {
    if (!editorInstance) return;
    import("@/shared/lib/local-storage").then(({ saveRichFile, updateRichFile }) => {
      const editorStateObj = editorInstance.getEditorState().toJSON();
      if (fileId) {
        updateRichFile(fileId, editorStateObj);
        if (showAlert) {
          showAlert("Success", "File saved successfully!");
        }
      } else {
        if (showPrompt) {
          showPrompt("Enter file name", "Untitled Rich Document", (name) => {
            if (name && name.trim()) {
              const newFile = saveRichFile(name.trim(), editorStateObj);
              if (onFileSaved) {
                onFileSaved(newFile.id);
              }
              if (showAlert) {
                showAlert("Success", "File saved successfully!");
              }
            }
          });
        }
      }
    });
  }, [editorInstance, fileId, onFileSaved, showAlert, showPrompt]);

  useEffect(() => {
    if (actionsRef && editorInstance) {
      actionsRef.current = {
        save: handleSave,
        downloadTxt: () => {
          exportLexicalToTxt(editorInstance);
        },
        downloadPdf: () => {
          exportLexicalToPdf(editorInstance, showAlert);
        },
        togglePreview: () => setShowPreview((prev) => !prev),
        showPreview: showPreview,
      };
    }
  }, [editorInstance, showPreview, actionsRef, showAlert, handleSave]);

  // Plugin to expose editor context ref
  const CaptureEditorPlugin = () => {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
      setEditorInstance(editor);
    }, [editor]);
    return null;
  };

  // Plugin to update preview editor state reactively
  const UpdateStatePlugin = ({ stateJson }: { stateJson: string }) => {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
      if (stateJson) {
        try {
          const parsed = editor.parseEditorState(stateJson);
          editor.setEditorState(parsed);
        } catch (e) {
          console.error("Preview parser failed:", e);
        }
      }
    }, [editor, stateJson]);
    return null;
  };

  const handleOnChange = (editorState: any, editor: LexicalEditor) => {
    const jsonStr = JSON.stringify(editorState.toJSON());
    setActiveEditorState(jsonStr);
    localStorage.setItem("richEditor", jsonStr);

    editorState.read(() => {
      const text = $getRoot().getTextContent();
      setCharCount(text.length);
      const words = text.trim().split(/\s+/).filter(Boolean);
      setWordCount(words.length);
    });
  };

  return (
    <div
      ref={editorRef}
      className="w-full h-full bg-transparent flex flex-col px-6 md:px-12 pt-8 pb-8 overflow-hidden"
    >
      <div
        className={`grid h-full w-full min-h-0 ${
          showPreview ? "grid-cols-1 md:grid-cols-2 gap-8" : "grid-cols-1"
        }`}
      >
        {/* Editor Main Card */}
        <div className="flex flex-col h-full min-h-0 bg-card border border-border/40 rounded-2xl p-6 md:p-10 shadow-lg relative">
          <LexicalComposer initialConfig={initialConfig}>
            {/* Toolbar */}
            <LexicalToolbar showPrompt={showPrompt} />

            {/* Editor Canvas */}
            <div className="flex-1 w-full min-h-0 overflow-y-auto mt-4 relative">
              <RichTextPlugin
                contentEditable={
                  <ContentEditable className="prose dark:prose-invert max-w-none focus:outline-none min-h-full text-lg text-foreground leading-relaxed outline-none" />
                }
                placeholder={
                  <div className="text-muted-foreground absolute top-0 left-0 pointer-events-none select-none text-lg">
                    Start writing your rich content...
                  </div>
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
              <HistoryPlugin />
              <ListPlugin />
              <LinkPlugin />
              <OnChangePlugin onChange={handleOnChange} ignoreSelectionChange />
              <CaptureEditorPlugin />
              <SlashMenu />
              <SelectionTooltip />
            </div>

            {/* Footer Statistics */}
            <div className="flex items-center justify-between border-t pt-4 mt-6 text-sm text-muted-foreground shrink-0 animate-fade-in">
              <div className="flex gap-4">
                <span>Characters: {charCount}</span>
                <span>•</span>
                <span>Words: {wordCount}</span>
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
          </LexicalComposer>
        </div>

        {/* Live Preview Card */}
        {showPreview && (
          <div className="flex flex-col h-full min-h-0 bg-card border border-border/40 rounded-2xl p-6 md:p-10 shadow-lg relative">
            <h3 className="text-xl font-bold mb-6 text-foreground border-b pb-2 uppercase tracking-wide text-xs text-muted-foreground shrink-0">
              Document Live Preview
            </h3>
            <div className="flex-1 w-full min-h-0 overflow-y-auto">
              <LexicalComposer
                initialConfig={{
                  namespace: "PrishthaRichEditorPreview",
                  theme: lexicalTheme,
                  nodes: [
                    HeadingNode,
                    ListNode,
                    ListItemNode,
                    QuoteNode,
                    LinkNode,
                    AutoLinkNode,
                    CustomBlockNode,
                  ],
                  onError,
                  editable: false,
                }}
              >
                <RichTextPlugin
                  contentEditable={
                    <ContentEditable className="prose dark:prose-invert max-w-none focus:outline-none min-h-full text-lg text-foreground leading-relaxed outline-none" />
                  }
                  placeholder={<div />}
                  ErrorBoundary={LexicalErrorBoundary}
                />
                <ListPlugin />
                <LinkPlugin />
                <UpdateStatePlugin stateJson={activeEditorState} />
              </LexicalComposer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
