"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  $createParagraphNode,
  $isTextNode,
} from "lexical";
import {
  $createHeadingNode,
  $createQuoteNode,
} from "@lexical/rich-text";
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
} from "@lexical/list";
import { $setBlocksType } from "@lexical/selection";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Type,
} from "lucide-react";

interface SlashMenuOption {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
}

export const SlashMenu: React.FC = () => {
  const [editor] = useLexicalComposerContext();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const executeAction = useCallback((actionId: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const anchor = selection.anchor;
        const node = anchor.getNode();

        // 1. Remove the slash character from the text node
        if ($isTextNode(node)) {
          const textContent = node.getTextContent();
          const offset = anchor.offset;
          const textBeforeCursor = textContent.slice(0, offset);

          if (textBeforeCursor.endsWith("/")) {
            const newText =
              textContent.slice(0, offset - 1) + textContent.slice(offset);
            node.setTextContent(newText);
            
            // Adjust caret position
            selection.anchor.set(node.getKey(), offset - 1, "text");
            selection.focus.set(node.getKey(), offset - 1, "text");
          }
        }

        // 2. Transform the block type
        if (actionId === "paragraph") {
          $setBlocksType(selection, () => $createParagraphNode());
        } else if (actionId === "h1") {
          $setBlocksType(selection, () => $createHeadingNode("h1"));
        } else if (actionId === "h2") {
          $setBlocksType(selection, () => $createHeadingNode("h2"));
        } else if (actionId === "h3") {
          $setBlocksType(selection, () => $createHeadingNode("h3"));
        } else if (actionId === "quote") {
          $setBlocksType(selection, () => $createQuoteNode());
        }
      }
    });

    // Lists are handled by Lexical commands, dispatched after text node cleaning
    if (actionId === "bullet") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else if (actionId === "number") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    }

    setIsOpen(false);
  }, [editor]);

  const options: SlashMenuOption[] = [
    {
      id: "paragraph",
      label: "Text",
      description: "Start writing with plain text",
      icon: Type,
      action: () => executeAction("paragraph"),
    },
    {
      id: "h1",
      label: "Heading 1",
      description: "Large section heading",
      icon: Heading1,
      action: () => executeAction("h1"),
    },
    {
      id: "h2",
      label: "Heading 2",
      description: "Medium section heading",
      icon: Heading2,
      action: () => executeAction("h2"),
    },
    {
      id: "h3",
      label: "Heading 3",
      description: "Small section heading",
      icon: Heading3,
      action: () => executeAction("h3"),
    },
    {
      id: "bullet",
      label: "Bulleted List",
      description: "Create a simple bulleted list",
      icon: List,
      action: () => executeAction("bullet"),
    },
    {
      id: "number",
      label: "Numbered List",
      description: "Create a list with numbering",
      icon: ListOrdered,
      action: () => executeAction("number"),
    },
    {
      id: "quote",
      label: "Quote",
      description: "Capture a quote block",
      icon: Quote,
      action: () => executeAction("quote"),
    },
  ];

  const checkSlash = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection) && selection.isCollapsed()) {
        const anchor = selection.anchor;
        const node = anchor.getNode();

        let show = false;
        let textContent = "";
        let offset = 0;

        if ($isTextNode(node)) {
          textContent = node.getTextContent();
          offset = anchor.offset;
        }

        const textBeforeCursor = textContent.slice(0, offset);
        // Show menu if the last typed character is '/' and it's either at the start of a block
        // or preceded by a space.
        if (textBeforeCursor === "/" || textBeforeCursor.endsWith(" /")) {
          show = true;
        }

        if (show) {
          const domSelection = window.getSelection();
          if (domSelection && domSelection.rangeCount > 0) {
            const range = domSelection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            // Set coordinates below the caret
            setPosition({
              top: rect.bottom + window.scrollY + 8,
              left: rect.left + window.scrollX,
            });
            setIsOpen(true);
          }
        } else {
          setIsOpen(false);
        }
      } else {
        setIsOpen(false);
      }
    });
  }, [editor]);

  // Handle keystroke interception when slash menu is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % options.length);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + options.length) % options.length);
      } else if (event.key === "Enter") {
        event.preventDefault();
        options[selectedIndex].action();
      } else if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isOpen, selectedIndex, options]);

  // Register selection and state listeners in Lexical
  useEffect(() => {
    const removeUpdateListener = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        checkSlash();
      });
    });

    const removeSelectionListener = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        checkSlash();
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );

    return () => {
      removeUpdateListener();
      removeSelectionListener();
    };
  }, [editor, checkSlash]);

  // Auto-scroll selected item into view if it overflows
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;
    const activeEl = menuRef.current.children[selectedIndex] as HTMLElement;
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex, isOpen]);

  if (!isOpen) return null;

  const menuElement = (
    <div
      ref={menuRef}
      className="fixed z-50 w-72 max-h-[300px] overflow-y-auto bg-popover/90 backdrop-blur-md border border-border/40 rounded-xl shadow-xl p-1 text-popover-foreground outline-none animate-in fade-in slide-in-from-top-1 duration-150"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {options.map((option, idx) => {
        const Icon = option.icon;
        const isSelected = idx === selectedIndex;
        return (
          <button
            key={option.id}
            type="button"
            onClick={option.action}
            className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg text-sm transition-colors cursor-pointer select-none outline-none ${
              isSelected
                ? "bg-accent text-accent-foreground font-medium"
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <div
              className={`p-1.5 rounded-md ${
                isSelected ? "bg-primary/20 text-primary" : "bg-muted text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-foreground">{option.label}</span>
              <span className="text-[11px] opacity-75">{option.description}</span>
            </div>
          </button>
        );
      })}
    </div>
  );

  return createPortal(menuElement, document.body);
};
