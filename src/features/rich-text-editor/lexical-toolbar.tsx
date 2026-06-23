"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  $isElementNode,
  $isTextNode,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
} from "lexical";
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import {
  $createHeadingNode,
  $createQuoteNode,
} from "@lexical/rich-text";
import {
  $setBlocksType,
  $patchStyleText,
  $getSelectionStyleValueForProperty,
} from "@lexical/selection";
import { TOGGLE_LINK_COMMAND } from "@lexical/link";
import { $createParagraphNode } from "lexical";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  Undo,
  Redo,
  Bold,
  Italic,
  Underline,
  Code,
  Link as LinkIcon,
  Baseline,
  Highlighter,
  ChevronDown,
  CaseSensitive,
  FileText,
  Plus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Indent,
  Outdent,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List as ListIcon,
  ListOrdered,
  Scissors,
  FileImage,
  Palette,
  Table as TableIcon,
  BarChart3,
  Columns as ColumnsIcon,
  Calculator,
  StickyNote,
  Calendar,
  Twitter,
  Youtube,
  Image as ImageIcon,
  CheckSquare,
  MoreHorizontal,
} from "lucide-react";
import { $createCustomBlockNode } from "./custom-block-node";

const FONTS = [
  { name: "Default", value: "system-ui, sans-serif" },
  { name: "Arial", value: "Arial, sans-serif" },
  { name: "Georgia", value: "Georgia, serif" },
  { name: "Courier New", value: "Courier New, monospace" },
  { name: "Times New Roman", value: "Times New Roman, serif" },
  { name: "SolaimanLipi", value: "SolaimanLipi, Arial, sans-serif" },
  { name: "Anek Bangla", value: "Anek Bangla, sans-serif" },
  { name: "Hind Siliguri", value: "Hind Siliguri, sans-serif" },
  { name: "Noto Sans Bengali", value: "Noto Sans Bengali, sans-serif" },
];

const PRESET_COLORS = [
  { name: "Red", value: "#e63946" },
  { name: "Orange", value: "#f4a261" },
  { name: "Yellow", value: "#fff3b0" },
  { name: "Brown", value: "#78350f" },
  { name: "Light Green", value: "#c7f9cc" },
  { name: "Dark Green", value: "#166534" },
  { name: "Purple", value: "#7209b7" },
  { name: "Pink", value: "#ec4899" },
  { name: "Blue", value: "#1d3557" },
  { name: "Teal", value: "#2a9d8f" },
  { name: "Lime", value: "#a3e635" },
  { name: "Grey", value: "#94a3b8" },
  { name: "Charcoal", value: "#333333" },
  { name: "Black", value: "#000000" },
  { name: "White", value: "#ffffff" },
];

interface ILexicalToolbarProps {
  showPrompt?: (title: string, defaultValue: string, onSubmit: (value: string) => void) => void;
}

export const LexicalToolbar: React.FC<ILexicalToolbarProps> = ({ showPrompt }) => {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [alignment, setAlignment] = useState("left");
  const [blockType, setBlockType] = useState("paragraph");
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [currentFont, setCurrentFont] = useState("Default");
  const [fontSize, setFontSize] = useState("16");

  // Page layout settings
  const [pageSize, setPageSize] = useState("pageless");
  const [pageOrientation, setPageOrientation] = useState("portrait");
  const [pageMargins, setPageMargins] = useState("normal");

  // Colors custom states
  const [textColorInput, setTextColorInput] = useState("#000000");
  const [bgColorInput, setBgColorInput] = useState("#ffffff");

  // Apply visual layout settings to editor container
  const updatePageLayoutClasses = useCallback((size: string, orient: string, margins: string) => {
    const root = editor.getRootElement();
    if (!root) return;

    // Clear layout classes
    root.classList.remove(
      "page-a4",
      "page-letter",
      "page-legal",
      "page-tabloid",
      "page-a3",
      "page-a5",
      "page-landscape",
      "margin-narrow",
      "margin-wide"
    );

    if (size !== "pageless") {
      root.classList.add(`page-${size}`);
    }
    if (orient === "landscape") {
      root.classList.add("page-landscape");
    }
    if (margins === "narrow") {
      root.classList.add("margin-narrow");
    } else if (margins === "wide") {
      root.classList.add("margin-wide");
    }
  }, [editor]);

  useEffect(() => {
    updatePageLayoutClasses(pageSize, pageOrientation, pageMargins);
  }, [pageSize, pageOrientation, pageMargins, updatePageLayoutClasses]);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsCode(selection.hasFormat("code"));

      // Read font size & style values
      const fontSz = $getSelectionStyleValueForProperty(selection, "font-size", "16px");
      setFontSize(fontSz.replace("px", ""));

      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();

      if (element !== null) {
        const type = element.getType();
        setBlockType(type);

        if ($isElementNode(element)) {
          setAlignment(element.getFormatType() || "left");
        }
      }
    }
  }, []);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar();
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor, updateToolbar]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  useEffect(() => {
    return editor.registerCommand(
      CAN_UNDO_COMMAND,
      (payload) => {
        setCanUndo(payload);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      CAN_REDO_COMMAND,
      (payload) => {
        setCanRedo(payload);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor]);

  // Block transforming
  const formatHeading = (headingSize: "h1" | "h2" | "h3") => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (blockType !== headingSize) {
          $setBlocksType(selection, () => $createHeadingNode(headingSize));
        } else {
          $setBlocksType(selection, () => $createParagraphNode());
        }
      }
    });
  };

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (blockType !== "quote") {
          $setBlocksType(selection, () => $createQuoteNode());
        } else {
          $setBlocksType(selection, () => $createParagraphNode());
        }
      }
    });
  };

  const formatBulletList = () => {
    if (blockType !== "bullet") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatNumberedList = () => {
    if (blockType !== "number") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  // Font adjustments
  const applyFontFamily = (fontVal: string, fontName: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, {
          "font-family": fontVal,
        });
        setCurrentFont(fontName);
      }
    });
  };

  const applyFontSize = (sizeVal: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, {
          "font-size": `${sizeVal}px`,
        });
        setFontSize(sizeVal);
      }
    });
  };

  const handleFontSizeChange = (increment: boolean) => {
    let current = parseInt(fontSize, 10);
    if (isNaN(current)) current = 16;
    const nextSize = increment ? current + 1 : Math.max(8, current - 1);
    applyFontSize(String(nextSize));
  };

  // Custom Colors
  const applyTextColor = (colorVal: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, {
          color: colorVal,
        });
        setTextColorInput(colorVal);
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
        setBgColorInput(bgColorVal);
      }
    });
  };

  // Link insertions
  const insertLink = () => {
    if (showPrompt) {
      showPrompt("Enter link URL", "https://", (url) => {
        if (url !== null && url.trim()) {
          editor.dispatchCommand(TOGGLE_LINK_COMMAND, url.trim());
        }
      });
    }
  };

  // Insert Custom Blocks
  const insertCustomBlock = (type: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        // Prepare initial empty states
        let initialData: any = { empty: true };
        if (type === "excalidraw") initialData = { image: null };
        else if (type === "sticky") initialData = { text: "" };
        else if (type === "date") initialData = { date: "" };
        else if (type === "table") {
          initialData = {
            rows: 3,
            cols: 3,
            cells: [
              ["", "", ""],
              ["", "", ""],
              ["", "", ""],
            ],
          };
        }

        const customNode = $createCustomBlockNode(type, initialData);
        selection.insertNodes([customNode]);
      }
    });
  };

  // Case/Transform utilities
  const formatCase = (caseType: "lower" | "upper" | "title") => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const nodes = selection.getNodes();
        nodes.forEach((node) => {
          if ($isTextNode(node)) {
            const text = node.getTextContent();
            let newText = text;
            if (caseType === "lower") newText = text.toLowerCase();
            else if (caseType === "upper") newText = text.toUpperCase();
            else if (caseType === "title") {
              newText = text.replace(/\b\w/g, (c) => c.toUpperCase());
            }
            node.setTextContent(newText);
          }
        });
      }
    });
  };

  const clearFormatting = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        // Clear style overrides
        $patchStyleText(selection, {
          "font-size": "",
          "font-family": "",
          color: "",
          "background-color": "",
        });

        // Turn off format flags
        if (selection.hasFormat("bold")) editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        if (selection.hasFormat("italic")) editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
        if (selection.hasFormat("underline")) editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
        if (selection.hasFormat("code")) editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
      }
    });
  };

  // Human readable label for block types
  const getBlockTypeLabel = () => {
    switch (blockType) {
      case "paragraph": return "Normal";
      case "h1": return "Heading 1";
      case "h2": return "Heading 2";
      case "h3": return "Heading 3";
      case "bullet": return "Bullet List";
      case "number": return "Numbered List";
      case "quote": return "Quote";
      case "code": return "Code Block";
      default: return "Normal";
    }
  };

  return (
    <div className="flex flex-row flex-nowrap items-center justify-between gap-1.5 pb-2 border-b border-border/40 shrink-0 w-full overflow-hidden select-none">
      {/* LEFT SIDE: TOOLBAR BUTTONS */}
      <div className="flex items-center gap-1.5 overflow-hidden w-full">
        {/* 1. Undo / Redo */}
        <div className="flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
                disabled={!canUndo}
                className="h-8 w-8 cursor-pointer disabled:opacity-30 disabled:pointer-events-none shrink-0"
                aria-label="Undo"
              >
                <Undo className="h-4 w-4 text-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
                disabled={!canRedo}
                className="h-8 w-8 cursor-pointer disabled:opacity-30 disabled:pointer-events-none shrink-0"
                aria-label="Redo"
              >
                <Redo className="h-4 w-4 text-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo</TooltipContent>
          </Tooltip>
        </div>

        <div className="w-px h-4 bg-border/60 mx-0.5 shrink-0" />

        {/* 2. Block Type Dropdown */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                  aria-label="Block formats"
                >
                  <Quote className="h-4 w-4" />
                  <span className="max-w-[80px] truncate">{getBlockTypeLabel()}</span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Block Format</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={formatParagraph} className="cursor-pointer flex items-center justify-between text-xs py-2">
              <span className="flex items-center gap-2"><Type className="h-3.5 w-3.5" /> Normal</span>
              <span className="text-[10px] opacity-50">Ctrl+Alt+0</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => formatHeading("h1")} className="cursor-pointer flex items-center justify-between text-xs py-2">
              <span className="flex items-center gap-2"><Heading1 className="h-3.5 w-3.5" /> Heading 1</span>
              <span className="text-[10px] opacity-50">Ctrl+Alt+1</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => formatHeading("h2")} className="cursor-pointer flex items-center justify-between text-xs py-2">
              <span className="flex items-center gap-2"><Heading2 className="h-3.5 w-3.5" /> Heading 2</span>
              <span className="text-[10px] opacity-50">Ctrl+Alt+2</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => formatHeading("h3")} className="cursor-pointer flex items-center justify-between text-xs py-2">
              <span className="flex items-center gap-2"><Heading3 className="h-3.5 w-3.5" /> Heading 3</span>
              <span className="text-[10px] opacity-50">Ctrl+Alt+3</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={formatBulletList} className="cursor-pointer flex items-center justify-between text-xs py-2">
              <span className="flex items-center gap-2"><ListIcon className="h-3.5 w-3.5" /> Bullet List</span>
              <span className="text-[10px] opacity-50">Ctrl+Shift+8</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={formatNumberedList} className="cursor-pointer flex items-center justify-between text-xs py-2">
              <span className="flex items-center gap-2"><ListOrdered className="h-3.5 w-3.5" /> Numbered List</span>
              <span className="text-[10px] opacity-50">Ctrl+Shift+7</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={formatBulletList} className="cursor-pointer flex items-center justify-between text-xs py-2">
              <span className="flex items-center gap-2"><CheckSquare className="h-3.5 w-3.5" /> Check List</span>
              <span className="text-[10px] opacity-50">Ctrl+Shift+9</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={formatQuote} className="cursor-pointer flex items-center justify-between text-xs py-2">
              <span className="flex items-center gap-2"><Quote className="h-3.5 w-3.5" /> Quote Block</span>
              <span className="text-[10px] opacity-50">Ctrl+Shift+Q</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 3. Font Family Dropdown - hidden < sm */}
        <div className="hidden sm:flex items-center shrink-0">
          <div className="w-px h-4 bg-border/60 mx-0.5" />
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label="Font family selection"
                  >
                    <CaseSensitive className="h-4 w-4" />
                    <span className="max-w-[70px] truncate">{currentFont}</span>
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Font Family</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="start" className="w-48 max-h-[300px] overflow-y-auto">
              {FONTS.map((font) => (
                <DropdownMenuItem
                  key={font.name}
                  onClick={() => applyFontFamily(font.value, font.name)}
                  className="cursor-pointer text-xs"
                  style={{ fontFamily: font.value }}
                >
                  {font.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 4. Font Size Selector - hidden < md */}
        <div className="hidden md:flex items-center shrink-0">
          <div className="w-px h-4 bg-border/60 mx-0.5" />
          <div className="flex items-center border rounded-md bg-muted/10 h-8 overflow-hidden px-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleFontSizeChange(false)}
              className="h-6 w-6 cursor-pointer rounded-sm"
              aria-label="Decrease font size"
            >
              <span className="font-bold text-sm leading-none">-</span>
            </Button>
            <input
              type="text"
              value={fontSize}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || /^\d+$/.test(val)) {
                  setFontSize(val);
                  if (val !== "") applyFontSize(val);
                }
              }}
              className="w-8 h-6 text-center text-xs font-semibold bg-transparent border-0 outline-none p-0 focus:ring-0"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleFontSizeChange(true)}
              className="h-6 w-6 cursor-pointer rounded-sm"
              aria-label="Increase font size"
            >
              <span className="font-bold text-sm leading-none">+</span>
            </Button>
          </div>
        </div>

        {/* 5. Bold, Italic, Underline - hidden < sm */}
        <div className="hidden sm:flex items-center gap-1 shrink-0">
          <div className="w-px h-4 bg-border/60 mx-0.5" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
                className={`h-8 w-8 cursor-pointer ${
                  isBold ? "bg-muted text-primary font-bold" : "text-muted-foreground"
                }`}
                aria-label="Bold text"
              >
                <Bold className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
                className={`h-8 w-8 cursor-pointer ${
                  isItalic ? "bg-muted text-primary italic" : "text-muted-foreground"
                }`}
                aria-label="Italic text"
              >
                <Italic className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
                className={`h-8 w-8 cursor-pointer ${
                  isUnderline ? "bg-muted text-primary underline" : "text-muted-foreground"
                }`}
                aria-label="Underline text"
              >
                <Underline className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Underline</TooltipContent>
          </Tooltip>
        </div>

        {/* Code & Link - hidden < lg */}
        <div className="hidden lg:flex items-center gap-1 shrink-0">
          <div className="w-px h-4 bg-border/60 mx-0.5" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}
                className={`h-8 w-8 cursor-pointer ${
                  isCode ? "bg-muted text-primary font-mono" : "text-muted-foreground"
                }`}
                aria-label="Inline code"
              >
                <Code className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Inline Code</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={insertLink}
                className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label="Insert web link"
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Web Link</TooltipContent>
          </Tooltip>
        </div>

        {/* 6. Color pickers - hidden < md */}
        <div className="hidden md:flex items-center gap-1 shrink-0">
          <div className="w-px h-4 bg-border/60 mx-0.5" />
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label="Text color selector"
                  >
                    <Baseline className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Text Color</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="center" className="w-52 p-3 text-popover-foreground">
              <div className="text-xs font-semibold pb-2 border-b text-muted-foreground mb-3 flex items-center justify-between">
                <span>Text Color</span>
                <input
                  type="color"
                  value={textColorInput}
                  onChange={(e) => applyTextColor(e.target.value)}
                  className="w-5 h-5 cursor-pointer rounded-full border border-border/40 overflow-hidden shrink-0"
                />
              </div>
              <div className="flex gap-2 items-center mb-3">
                <span className="text-[10px] font-bold text-muted-foreground">HEX:</span>
                <Input
                  type="text"
                  value={textColorInput}
                  onChange={(e) => applyTextColor(e.target.value)}
                  className="h-7 text-xs font-mono py-1 px-1.5 flex-1"
                />
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => applyTextColor(c.value)}
                    className={`w-6 h-6 rounded-full border border-border/40 cursor-pointer hover:scale-115 active:scale-95 transition-all ${
                      textColorInput === c.value ? "ring-2 ring-primary scale-110" : ""
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                    aria-label={`Select color ${c.name}`}
                  />
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label="Highlight color selector"
                  >
                    <Highlighter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Highlight Background</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="center" className="w-52 p-3 text-popover-foreground">
              <div className="text-xs font-semibold pb-2 border-b text-muted-foreground mb-3 flex items-center justify-between">
                <span>Highlight Color</span>
                <input
                  type="color"
                  value={bgColorInput}
                  onChange={(e) => applyBgColor(e.target.value)}
                  className="w-5 h-5 cursor-pointer rounded-full border border-border/40 overflow-hidden shrink-0"
                />
              </div>
              <div className="flex gap-2 items-center mb-3">
                <span className="text-[10px] font-bold text-muted-foreground">HEX:</span>
                <Input
                  type="text"
                  value={bgColorInput}
                  onChange={(e) => applyBgColor(e.target.value)}
                  className="h-7 text-xs font-mono py-1 px-1.5 flex-1"
                />
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => applyBgColor(c.value)}
                    className={`w-6 h-6 rounded border border-border/40 cursor-pointer hover:scale-115 active:scale-95 transition-all ${
                      bgColorInput === c.value ? "ring-2 ring-primary scale-110" : ""
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                    aria-label={`Select background ${c.name}`}
                  />
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 7. Aa Text style - hidden < xl */}
        <div className="hidden xl:flex items-center shrink-0">
          <div className="w-px h-4 bg-border/60 mx-0.5" />
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label="More text formats"
                  >
                    <CaseSensitive className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>More Text Styles</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="center" className="w-44">
              <DropdownMenuItem onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")} className="cursor-pointer text-xs">
                Strikethrough
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript")} className="cursor-pointer text-xs">
                Subscript
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript")} className="cursor-pointer text-xs">
                Superscript
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => formatCase("lower")} className="cursor-pointer text-xs">
                Lowercase
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => formatCase("upper")} className="cursor-pointer text-xs">
                Uppercase
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => formatCase("title")} className="cursor-pointer text-xs">
                Capitalize
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={clearFormatting} className="cursor-pointer text-xs text-destructive">
                Clear Formatting
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 8. Page Layout settings - hidden < xl */}
        <div className="hidden xl:flex items-center shrink-0">
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label="Page layout options"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Page Layout</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="center" className="w-56 p-2 text-xs">
              <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Page Size</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setPageSize("pageless")} className="cursor-pointer font-medium py-1.5">
                Pageless (Continuous)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPageSize("a4")} className="cursor-pointer py-1.5">
                A4 (8.27&quot; x 11.69&quot;)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPageSize("letter")} className="cursor-pointer py-1.5">
                Letter (8.5&quot; x 11&quot;)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPageSize("legal")} className="cursor-pointer py-1.5">
                Legal (8.5&quot; x 14&quot;)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPageSize("tabloid")} className="cursor-pointer py-1.5">
                Tabloid (11&quot; x 17&quot;)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPageSize("a3")} className="cursor-pointer py-1.5">
                A3 (11.69&quot; x 16.54&quot;)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPageSize("a5")} className="cursor-pointer py-1.5">
                A5 (5.83&quot; x 8.27&quot;)
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Orientation</DropdownMenuLabel>
              <div className="flex gap-1 p-1">
                <Button
                  variant={pageOrientation === "portrait" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setPageOrientation("portrait")}
                  className="flex-1 text-[11px] h-7 cursor-pointer"
                >
                  Portrait
                </Button>
                <Button
                  variant={pageOrientation === "landscape" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setPageOrientation("landscape")}
                  className="flex-1 text-[11px] h-7 cursor-pointer"
                >
                  Landscape
                </Button>
              </div>

              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Margins</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setPageMargins("normal")} className="cursor-pointer py-1.5">
                Normal (1 inch)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPageMargins("narrow")} className="cursor-pointer py-1.5">
                Narrow (0.5 inch)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPageMargins("wide")} className="cursor-pointer py-1.5">
                Wide (2 inch)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 9. Alignment & Indent - hidden < lg */}
        <div className="hidden lg:flex items-center shrink-0">
          <div className="w-px h-4 bg-border/60 mx-0.5" />
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label="Alignment options"
                  >
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Alignment & Indent</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="center" className="w-48">
              <DropdownMenuItem onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")} className="cursor-pointer flex items-center justify-between text-xs py-2">
                <span className="flex items-center gap-2"><AlignLeft className="h-3.5 w-3.5" /> Left Align</span>
                <span className="text-[10px] opacity-50">Ctrl+Shift+L</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")} className="cursor-pointer flex items-center justify-between text-xs py-2">
                <span className="flex items-center gap-2"><AlignCenter className="h-3.5 w-3.5" /> Center Align</span>
                <span className="text-[10px] opacity-50">Ctrl+Shift+E</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")} className="cursor-pointer flex items-center justify-between text-xs py-2">
                <span className="flex items-center gap-2"><AlignRight className="h-3.5 w-3.5" /> Right Align</span>
                <span className="text-[10px] opacity-50">Ctrl+Shift+R</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify")} className="cursor-pointer flex items-center justify-between text-xs py-2">
                <span className="flex items-center gap-2"><AlignJustify className="h-3.5 w-3.5" /> Justify Align</span>
                <span className="text-[10px] opacity-50">Ctrl+Shift+J</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)} className="cursor-pointer flex items-center justify-between text-xs py-2">
                <span className="flex items-center gap-2"><Outdent className="h-3.5 w-3.5" /> Outdent</span>
                <span className="text-[10px] opacity-50">Ctrl+[</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)} className="cursor-pointer flex items-center justify-between text-xs py-2">
                <span className="flex items-center gap-2"><Indent className="h-3.5 w-3.5" /> Indent</span>
                <span className="text-[10px] opacity-50">Ctrl+]</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 10. Insert (+) Dropdown - always visible */}
        <div className="flex items-center shrink-0">
          <div className="w-px h-4 bg-border/60 mx-0.5" />
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer bg-primary/5 text-primary hover:bg-primary/10 border border-primary/20 rounded-md"
                    aria-label="Add elements"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Insert Elements</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="w-52 max-h-[350px] overflow-y-auto">
              <DropdownMenuItem onClick={() => insertCustomBlock("pagebreak")} className="cursor-pointer flex items-center gap-2.5 text-xs py-2">
                <Scissors className="h-4 w-4 text-rose-500" /> Horizontal Rule / Divider
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertCustomBlock("pagebreak")} className="cursor-pointer flex items-center gap-2.5 text-xs py-2">
                <Scissors className="h-4 w-4 text-rose-500" /> Page Break
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertCustomBlock("image")} className="cursor-pointer flex items-center gap-2.5 text-xs py-2">
                <ImageIcon className="h-4 w-4 text-indigo-500" /> Image
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertCustomBlock("gif")} className="cursor-pointer flex items-center gap-2.5 text-xs py-2">
                <FileImage className="h-4 w-4 text-violet-500" /> GIF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertCustomBlock("excalidraw")} className="cursor-pointer flex items-center gap-2.5 text-xs py-2">
                <Palette className="h-4 w-4 text-pink-500" /> Excalidraw Sketchpad
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertCustomBlock("table")} className="cursor-pointer flex items-center gap-2.5 text-xs py-2">
                <TableIcon className="h-4 w-4 text-orange-500" /> Table
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertCustomBlock("poll")} className="cursor-pointer flex items-center gap-2.5 text-xs py-2">
                <BarChart3 className="h-4 w-4 text-emerald-500" /> Interactive Poll
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertCustomBlock("columns")} className="cursor-pointer flex items-center gap-2.5 text-xs py-2">
                <ColumnsIcon className="h-4 w-4 text-blue-600" /> Columns Layout
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertCustomBlock("equation")} className="cursor-pointer flex items-center gap-2.5 text-xs py-2">
                <Calculator className="h-4 w-4 text-purple-500" /> LaTeX Equation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertCustomBlock("sticky")} className="cursor-pointer flex items-center gap-2.5 text-xs py-2">
                <StickyNote className="h-4 w-4 text-amber-500" /> Sticky Note
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertCustomBlock("collapsible")} className="cursor-pointer flex items-center gap-2.5 text-xs py-2">
                <ChevronDown className="h-4 w-4 text-cyan-500" /> Collapsible container
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertCustomBlock("date")} className="cursor-pointer flex items-center gap-2.5 text-xs py-2">
                <Calendar className="h-4 w-4 text-teal-500" /> Date Chip
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertCustomBlock("tweet")} className="cursor-pointer flex items-center gap-2.5 text-xs py-2">
                <Twitter className="h-4 w-4 text-sky-500" /> X (Tweet) Embed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertCustomBlock("youtube")} className="cursor-pointer flex items-center gap-2.5 text-xs py-2">
                <Youtube className="h-4 w-4 text-red-500" /> Youtube Video
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertCustomBlock("figma")} className="cursor-pointer flex items-center gap-2.5 text-xs py-2">
                <ImageIcon className="h-4 w-4 text-blue-500" /> Figma Document
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* RIGHT SIDE: RESPONSIVE OVERFLOW dropdown (...) */}
      <div className="flex items-center shrink-0 xl:hidden">
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer rounded-md border border-dashed border-border/60"
                  aria-label="More actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>More Options</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="w-56 p-1 max-h-[400px] overflow-y-auto">
            {/* Inline Bold, Italic, Underline for mobile (< sm) */}
            <div className="sm:hidden flex items-center justify-between px-2 py-1.5 border-b mb-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase">Format</span>
              <div className="flex items-center gap-0.5">
                <Button
                  variant={isBold ? "secondary" : "ghost"}
                  size="icon"
                  className="h-7 w-7 rounded-sm cursor-pointer"
                  onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
                  aria-label="Bold"
                >
                  <Bold className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant={isItalic ? "secondary" : "ghost"}
                  size="icon"
                  className="h-7 w-7 rounded-sm cursor-pointer"
                  onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
                  aria-label="Italic"
                >
                  <Italic className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant={isUnderline ? "secondary" : "ghost"}
                  size="icon"
                  className="h-7 w-7 rounded-sm cursor-pointer"
                  onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
                  aria-label="Underline"
                >
                  <Underline className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Font size row for mobile/tablet (< md) */}
            <div className="md:hidden flex items-center justify-between px-2 py-1.5 border-b mb-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase">Size</span>
              <div className="flex items-center border rounded-md bg-muted/10 h-7 overflow-hidden px-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleFontSizeChange(false)}
                  className="h-5 w-5 cursor-pointer rounded-sm"
                  aria-label="Decrease"
                >
                  <span className="font-bold text-xs">-</span>
                </Button>
                <span className="text-xs font-semibold w-7 text-center">{fontSize}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleFontSizeChange(true)}
                  className="h-5 w-5 cursor-pointer rounded-sm"
                  aria-label="Increase"
                >
                  <span className="font-bold text-xs">+</span>
                </Button>
              </div>
            </div>

            {/* Font Family Submenu (< sm) */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="sm:hidden cursor-pointer text-xs">
                <CaseSensitive className="h-4 w-4 mr-2" /> Font Family
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-48 max-h-[250px] overflow-y-auto">
                {FONTS.map((font) => (
                  <DropdownMenuItem
                    key={font.name}
                    onClick={() => applyFontFamily(font.value, font.name)}
                    className="cursor-pointer text-xs"
                    style={{ fontFamily: font.value }}
                  >
                    {font.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            {/* Code / Link inline menu entries (< lg) */}
            <div className="lg:hidden sm:flex hidden items-center justify-between px-2 py-1 border-b mb-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase">Markup</span>
              <div className="flex gap-1">
                <Button
                  variant={isCode ? "secondary" : "ghost"}
                  size="icon"
                  className="h-7 w-7 rounded-sm cursor-pointer"
                  onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}
                  aria-label="Code"
                >
                  <Code className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-sm cursor-pointer"
                  onClick={insertLink}
                  aria-label="Link"
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            
            {/* If screen is mobile, code/link should be items instead */}
            <DropdownMenuItem onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")} className="sm:hidden cursor-pointer text-xs">
              <Code className="h-4 w-4 mr-2" /> Inline Code
            </DropdownMenuItem>
            <DropdownMenuItem onClick={insertLink} className="sm:hidden cursor-pointer text-xs">
              <LinkIcon className="h-4 w-4 mr-2" /> Web Link
            </DropdownMenuItem>

            {/* Colors submenus (< md) */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="md:hidden cursor-pointer text-xs">
                <Baseline className="h-4 w-4 mr-2 text-primary" /> Text Color
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-52 p-3">
                <div className="text-xs font-semibold pb-1.5 border-b mb-2 flex items-center justify-between">
                  <span>Text Color</span>
                  <input
                    type="color"
                    value={textColorInput}
                    onChange={(e) => applyTextColor(e.target.value)}
                    className="w-4 h-4 cursor-pointer rounded-full overflow-hidden"
                  />
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => applyTextColor(c.value)}
                      className="w-5 h-5 rounded-full border border-border/40 cursor-pointer"
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                      aria-label={`Color ${c.name}`}
                    />
                  ))}
                </div>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="md:hidden cursor-pointer text-xs">
                <Highlighter className="h-4 w-4 mr-2 text-emerald-500" /> Highlight Color
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-52 p-3">
                <div className="text-xs font-semibold pb-1.5 border-b mb-2 flex items-center justify-between">
                  <span>Highlight Color</span>
                  <input
                    type="color"
                    value={bgColorInput}
                    onChange={(e) => applyBgColor(e.target.value)}
                    className="w-4 h-4 cursor-pointer rounded-full overflow-hidden"
                  />
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => applyBgColor(c.value)}
                      className="w-5 h-5 rounded border border-border/40 cursor-pointer"
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                      aria-label={`Highlight ${c.name}`}
                    />
                  ))}
                </div>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator className="md:hidden" />

            {/* Aa More Styling Submenu (< xl) */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="xl:hidden cursor-pointer text-xs">
                <CaseSensitive className="h-4 w-4 mr-2 text-purple-500" /> Advanced Styles
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-44">
                <DropdownMenuItem onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")} className="cursor-pointer text-xs">
                  Strikethrough
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript")} className="cursor-pointer text-xs">
                  Subscript
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript")} className="cursor-pointer text-xs">
                  Superscript
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => formatCase("lower")} className="cursor-pointer text-xs">
                  Lowercase
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => formatCase("upper")} className="cursor-pointer text-xs">
                  Uppercase
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => formatCase("title")} className="cursor-pointer text-xs">
                  Capitalize
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={clearFormatting} className="cursor-pointer text-xs text-destructive">
                  Clear Formatting
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            {/* Page layout Submenu (< xl) */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="xl:hidden cursor-pointer text-xs">
                <FileText className="h-4 w-4 mr-2 text-indigo-500" /> Page Layout
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-56 p-2 text-xs">
                <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase font-bold">Page Size</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setPageSize("pageless")} className="cursor-pointer font-medium py-1">
                  Pageless
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPageSize("a4")} className="cursor-pointer py-1">
                  A4 Size
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPageSize("letter")} className="cursor-pointer py-1">
                  Letter Size
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPageSize("legal")} className="cursor-pointer py-1">
                  Legal Size
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase font-bold">Orientation</DropdownMenuLabel>
                <div className="flex gap-1 p-1">
                  <Button
                    variant={pageOrientation === "portrait" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setPageOrientation("portrait")}
                    className="flex-1 text-[10px] h-6 cursor-pointer"
                  >
                    Portrait
                  </Button>
                  <Button
                    variant={pageOrientation === "landscape" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setPageOrientation("landscape")}
                    className="flex-1 text-[10px] h-6 cursor-pointer"
                  >
                    Landscape
                  </Button>
                </div>

                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase font-bold">Margins</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setPageMargins("normal")} className="cursor-pointer py-1">
                  Normal (1&quot;)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPageMargins("narrow")} className="cursor-pointer py-1">
                  Narrow (0.5&quot;)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPageMargins("wide")} className="cursor-pointer py-1">
                  Wide (2&quot;)
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            {/* Alignment & Indent Submenu (< lg) */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="lg:hidden cursor-pointer text-xs">
                <AlignLeft className="h-4 w-4 mr-2 text-cyan-600" /> Alignment & Indent
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-48">
                <DropdownMenuItem onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")} className="cursor-pointer text-xs py-1.5 flex items-center gap-2">
                  <AlignLeft className="h-3.5 w-3.5" /> Left Align
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")} className="cursor-pointer text-xs py-1.5 flex items-center gap-2">
                  <AlignCenter className="h-3.5 w-3.5" /> Center Align
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")} className="cursor-pointer text-xs py-1.5 flex items-center gap-2">
                  <AlignRight className="h-3.5 w-3.5" /> Right Align
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify")} className="cursor-pointer text-xs py-1.5 flex items-center gap-2">
                  <AlignJustify className="h-3.5 w-3.5" /> Justify Align
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)} className="cursor-pointer text-xs py-1.5 flex items-center gap-2">
                  <Outdent className="h-3.5 w-3.5" /> Outdent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)} className="cursor-pointer text-xs py-1.5 flex items-center gap-2">
                  <Indent className="h-3.5 w-3.5" /> Indent
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
