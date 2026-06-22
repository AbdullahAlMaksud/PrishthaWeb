"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
} from "lexical";
import { $patchStyleText } from "@lexical/selection";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Baseline,
  Highlighter,
} from "lucide-react";

const TEXT_COLORS = [
  { name: "Default", value: "" },
  { name: "Charcoal", value: "#333333" },
  { name: "Crimson", value: "#e63946" },
  { name: "Cobalt", value: "#1d3557" },
  { name: "Emerald", value: "#2a9d8f" },
  { name: "Tangerine", value: "#f4a261" },
  { name: "Orchid", value: "#7209b7" },
];

const BG_COLORS = [
  { name: "Clear", value: "" },
  { name: "Yellow", value: "#fff3b0" },
  { name: "Mint", value: "#c7f9cc" },
  { name: "Sky", value: "#b3e5fc" },
  { name: "Rose", value: "#f8ad9d" },
  { name: "Lavender", value: "#e1bee7" },
];

export const SelectionTooltip: React.FC = () => {
  const [editor] = useLexicalComposerContext();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Formatting active states
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);

  const tooltipRef = useRef<HTMLDivElement>(null);

  const updateTooltipPosition = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      const domSelection = window.getSelection();

      if (
        $isRangeSelection(selection) &&
        domSelection &&
        !domSelection.isCollapsed &&
        domSelection.rangeCount > 0
      ) {
        const editorElement = editor.getRootElement();
        const anchorNode = domSelection.anchorNode;

        if (editorElement && anchorNode && editorElement.contains(anchorNode)) {
          const range = domSelection.getRangeAt(0);
          const rect = range.getBoundingClientRect();

          // Calculate state toggles
          setIsBold(selection.hasFormat("bold"));
          setIsItalic(selection.hasFormat("italic"));
          setIsUnderline(selection.hasFormat("underline"));
          setIsStrikethrough(selection.hasFormat("strikethrough"));
          setIsCode(selection.hasFormat("code"));

          // Position centered 50px above selection
          const top = rect.top + window.scrollY - 54;
          const left = rect.left + window.scrollX + rect.width / 2;

          setPosition({ top, left });
          setIsOpen(true);
          return;
        }
      }
      setIsOpen(false);
    });
  }, [editor]);

  // Hook into Selection change & Lexical update triggers
  useEffect(() => {
    const removeUpdateListener = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateTooltipPosition();
      });
    });

    const removeSelectionListener = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateTooltipPosition();
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );

    // Track mouseup as an extra trigger to catch drag selection ends
    const handleMouseUp = () => {
      setTimeout(updateTooltipPosition, 0);
    };

    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      removeUpdateListener();
      removeSelectionListener();
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [editor, updateTooltipPosition]);

  const applyFormat = (formatType: "bold" | "italic" | "underline" | "strikethrough" | "code") => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, formatType);
  };

  const applyTextColor = (colorVal: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, {
          color: colorVal,
        });
      }
    });
  };

  const applyBgColor = (bgColorVal: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, {
          "background-color": bgColorVal,
        });
      }
    });
  };

  if (!isOpen) return null;

  const tooltipElement = (
    <div
      ref={tooltipRef}
      className="fixed z-50 flex items-center gap-1 bg-popover/90 backdrop-blur-md border border-border/40 p-1 rounded-xl shadow-xl text-popover-foreground outline-none animate-in fade-in zoom-in-95 duration-100 -translate-x-1/2"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {/* Bold */}
      <Button
        variant="ghost"
        size="icon"
        className={`h-8 w-8 cursor-pointer ${
          isBold ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
        onMouseDown={(e) => {
          e.preventDefault();
          applyFormat("bold");
        }}
        aria-label="Bold text"
      >
        <Bold className="h-4 w-4" />
      </Button>

      {/* Italic */}
      <Button
        variant="ghost"
        size="icon"
        className={`h-8 w-8 cursor-pointer ${
          isItalic ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
        onMouseDown={(e) => {
          e.preventDefault();
          applyFormat("italic");
        }}
        aria-label="Italic text"
      >
        <Italic className="h-4 w-4" />
      </Button>

      {/* Underline */}
      <Button
        variant="ghost"
        size="icon"
        className={`h-8 w-8 cursor-pointer ${
          isUnderline ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
        onMouseDown={(e) => {
          e.preventDefault();
          applyFormat("underline");
        }}
        aria-label="Underline text"
      >
        <Underline className="h-4 w-4" />
      </Button>

      {/* Strikethrough */}
      <Button
        variant="ghost"
        size="icon"
        className={`h-8 w-8 cursor-pointer ${
          isStrikethrough ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
        onMouseDown={(e) => {
          e.preventDefault();
          applyFormat("strikethrough");
        }}
        aria-label="Strikethrough text"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>

      {/* Inline Code */}
      <Button
        variant="ghost"
        size="icon"
        className={`h-8 w-8 cursor-pointer ${
          isCode ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
        onMouseDown={(e) => {
          e.preventDefault();
          applyFormat("code");
        }}
        aria-label="Inline code"
      >
        <Code className="h-4 w-4" />
      </Button>

      <div className="w-px h-4 bg-border/60 mx-0.5" />

      {/* Font Color */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
            onMouseDown={(e) => e.preventDefault()}
            aria-label="Text color selector"
          >
            <Baseline className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-36 z-50">
          {TEXT_COLORS.map((color) => (
            <DropdownMenuItem
              key={color.name}
              onSelect={() => applyTextColor(color.value)}
              className="cursor-pointer flex items-center justify-between"
            >
              <span className="text-xs">{color.name}</span>
              {color.value ? (
                <div
                  className="w-3 h-3 rounded-full border border-border/40"
                  style={{ backgroundColor: color.value }}
                />
              ) : (
                <span className="text-[9px] uppercase text-muted-foreground">None</span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Highlight Background */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
            onMouseDown={(e) => e.preventDefault()}
            aria-label="Highlight background selector"
          >
            <Highlighter className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-36 z-50">
          {BG_COLORS.map((color) => (
            <DropdownMenuItem
              key={color.name}
              onSelect={() => applyBgColor(color.value)}
              className="cursor-pointer flex items-center justify-between"
            >
              <span className="text-xs">{color.name}</span>
              {color.value ? (
                <div
                  className="w-3 h-3 rounded-sm border border-border/40"
                  style={{ backgroundColor: color.value }}
                />
              ) : (
                <span className="text-[9px] uppercase text-muted-foreground">None</span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return createPortal(tooltipElement, document.body);
};
