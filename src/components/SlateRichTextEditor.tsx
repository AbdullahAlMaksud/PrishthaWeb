"use client";

import React, { useMemo, useCallback, useState } from "react";
import {
  createEditor,
  Descendant,
  Editor,
  Transforms,
  Element as SlateElement,
} from "slate";
import {
  Slate,
  Editable,
  withReact,
  ReactEditor,
  RenderElementProps,
  RenderLeafProps,
} from "slate-react";
import { withHistory } from "slate-history";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  saveRichEditor,
  loadRichEditor,
  saveKeyboardSoundSetting,
  loadKeyboardSoundSetting,
} from "@/utils/localStorage";
import { useKeyboardSound } from "@/hooks/useKeyboardSound";
import {
  Bold,
  Italic,
  Underline,
  Code,
  Strikethrough,
  Highlighter,
  Type,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Eye,
  EyeOff,
  FileText,
  FileDown,
  Volume2,
  VolumeX,
  Plus,
  Minus,
} from "lucide-react";

const initialValue = [
  {
    type: "paragraph",
    children: [{ text: "Start writing your content here..." }],
  },
] as unknown as Descendant[];

// Font families
const FONT_FAMILIES = [
  { value: "default", label: "Default" },
  { value: "Arial", label: "Arial" },
  { value: "Georgia", label: "Georgia" },
  { value: "Verdana", label: "Verdana" },
  { value: "AdorshoLipi", label: "AdorshoLipi" },
  { value: "Alkatra", label: "Alkatra" },
  { value: "Anek Bangla", label: "Anek Bangla" },
  { value: "Atma", label: "Atma" },
  { value: "Baloo Da 2", label: "Baloo Da 2" },
  { value: "Galada", label: "Galada" },
  { value: "Hind Siliguri", label: "Hind Siliguri" },
  { value: "Mina", label: "Mina" },
  { value: "Noto Sans Bengali", label: "Noto Sans Bengali" },
  { value: "Noto Serif Bengali", label: "Noto Serif Bengali" },
  { value: "SolaimanLipi", label: "SolaimanLipi" },
  { value: "Tiro Bangla", label: "Tiro Bangla" },
  { value: "UNBangla", label: "UNBangla" },
];

// Font sizes
const FONT_SIZES = [
  { value: "12", label: "12px" },
  { value: "14", label: "14px" },
  { value: "16", label: "16px" },
  { value: "18", label: "18px" },
  { value: "20", label: "20px" },
  { value: "24", label: "24px" },
  { value: "28", label: "28px" },
  { value: "32", label: "32px" },
  { value: "36", label: "36px" },
];

// Text colors
const TEXT_COLORS = [
  { value: "#000000", label: "Black" },
  { value: "#FF0000", label: "Red" },
  { value: "#00FF00", label: "Green" },
  { value: "#0000FF", label: "Blue" },
  { value: "#FFA500", label: "Orange" },
  { value: "#800080", label: "Purple" },
  { value: "#FFFF00", label: "Yellow" },
  { value: "#808080", label: "Gray" },
];

// Highlight colors
const HIGHLIGHT_COLORS = [
  { value: "transparent", label: "None" },
  { value: "#FFFF00", label: "Yellow" },
  { value: "#00FF00", label: "Green" },
  { value: "#00FFFF", label: "Cyan" },
  { value: "#FF00FF", label: "Magenta" },
  { value: "#FFA500", label: "Orange" },
  { value: "#FFB6C1", label: "Pink" },
];

// Custom types
type CustomElement = {
  type: string;
  align?: string;
  children: CustomText[];
};

type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  fontFamily?: string;
  fontSize?: string;
  color?: string;
  backgroundColor?: string;
};

export const SlateRichTextEditor: React.FC = () => {
  const [showPreview, setShowPreview] = useState(false);
  const [keyboardSoundEnabled, setKeyboardSoundEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      return loadKeyboardSoundSetting();
    }
    return false;
  });

  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const previewEditor = useMemo(() => withReact(createEditor()), []);

  const [value, setValue] = useState<Descendant[]>(() => {
    const saved = loadRichEditor();
    return saved && Array.isArray(saved) ? saved : initialValue;
  });

  // Enable keyboard sound
  useKeyboardSound(keyboardSoundEnabled, undefined, true);

  // Save keyboard sound setting
  React.useEffect(() => {
    saveKeyboardSoundSetting(keyboardSoundEnabled);
  }, [keyboardSoundEnabled]);

  const handleChange = (newValue: Descendant[]) => {
    setValue(newValue);
    saveRichEditor(newValue as never);
  };

  const renderElement = useCallback((props: RenderElementProps) => {
    const element = props.element as CustomElement;
    const style = {
      textAlign: (element.align || "left") as React.CSSProperties["textAlign"],
    };

    switch (element.type) {
      case "heading-one":
        return (
          <h1 style={style} {...props.attributes}>
            {props.children}
          </h1>
        );
      case "heading-two":
        return (
          <h2 style={style} {...props.attributes}>
            {props.children}
          </h2>
        );
      case "heading-three":
        return (
          <h3 style={style} {...props.attributes}>
            {props.children}
          </h3>
        );
      case "block-quote":
        return (
          <blockquote style={style} {...props.attributes}>
            {props.children}
          </blockquote>
        );
      case "bulleted-list":
        return (
          <ul style={style} {...props.attributes}>
            {props.children}
          </ul>
        );
      case "numbered-list":
        return (
          <ol style={style} {...props.attributes}>
            {props.children}
          </ol>
        );
      case "list-item":
        return (
          <li style={style} {...props.attributes}>
            {props.children}
          </li>
        );
      default:
        return (
          <p style={style} {...props.attributes}>
            {props.children}
          </p>
        );
    }
  }, []);

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    const leaf = props.leaf as CustomText;
    let { children } = props;

    const style: React.CSSProperties = {};

    if (leaf.fontFamily && leaf.fontFamily !== "default") {
      style.fontFamily = leaf.fontFamily;
    }

    if (leaf.fontSize) {
      style.fontSize = `${leaf.fontSize}px`;
    }

    if (leaf.color) {
      style.color = leaf.color;
    }

    if (leaf.backgroundColor && leaf.backgroundColor !== "transparent") {
      style.backgroundColor = leaf.backgroundColor;
    }

    if (leaf.bold) {
      children = <strong>{children}</strong>;
    }

    if (leaf.italic) {
      children = <em>{children}</em>;
    }

    if (leaf.underline) {
      children = <u>{children}</u>;
    }

    if (leaf.strikethrough) {
      children = <s>{children}</s>;
    }

    if (leaf.code) {
      children = (
        <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">
          {children}
        </code>
      );
    }

    return (
      <span {...props.attributes} style={style}>
        {children}
      </span>
    );
  }, []);

  const toggleMark = (format: string) => {
    const isActive = isMarkActive(editor, format);

    if (isActive) {
      Editor.removeMark(editor, format);
    } else {
      Editor.addMark(editor, format, true);
    }
  };

  const toggleBlock = (format: string) => {
    const isActive = isBlockActive(editor, format);
    const isList = ["numbered-list", "bulleted-list"].includes(format);

    Transforms.unwrapNodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        ["numbered-list", "bulleted-list"].includes((n as CustomElement).type),
      split: true,
    });

    const newProperties: Partial<CustomElement> = {
      type: isActive ? "paragraph" : isList ? "list-item" : format,
    };

    Transforms.setNodes<SlateElement>(editor, newProperties);

    if (!isActive && isList) {
      const block = { type: format, children: [] };
      Transforms.wrapNodes(editor, block);
    }
  };

  const setMarkValue = (format: string, value: string) => {
    if (editor.selection) {
      Editor.addMark(editor, format, value);
    }
  };

  const getMarkValue = (format: string): string | undefined => {
    const marks = Editor.marks(editor);
    return marks
      ? ((marks as Record<string, unknown>)[format] as string)
      : undefined;
  };

  const setAlignment = (align: string) => {
    Transforms.setNodes(editor, { align } as Partial<CustomElement>, {
      match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n),
    });
  };

  const adjustFontSize = (delta: number) => {
    const currentSize = parseInt(getMarkValue("fontSize") || "16");
    const newSize = Math.max(8, Math.min(72, currentSize + delta));
    setMarkValue("fontSize", newSize.toString());
    // Force re-render to update the select dropdown
    setValue([...value]);
  };

  const isMarkActive = (editor: Editor, format: string) => {
    const marks = Editor.marks(editor);
    return marks ? (marks as Record<string, unknown>)[format] === true : false;
  };

  const isBlockActive = (editor: Editor, format: string) => {
    const { selection } = editor;
    if (!selection) return false;

    const [match] = Array.from(
      Editor.nodes(editor, {
        at: Editor.unhangRange(editor, selection),
        match: (n) =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          (n as CustomElement).type === format,
      })
    );

    return !!match;
  };

  const handleExportTxt = () => {
    const extractText = (node: Descendant): string => {
      if ("text" in node) return node.text;
      if ("children" in node) {
        return node.children.map(extractText).join("");
      }
      return "";
    };

    const content = value.map((block) => extractText(block)).join("\n\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "document.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = async () => {
    try {
      // Validate that we have content to export
      if (!value || value.length === 0) {
        alert("No content to export. Please add some text first.");
        return;
      }

      const { default: jsPDF } = await import("jspdf");
      const { default: html2canvas } = await import("html2canvas");

      // Helper to ensure color is in hex format (html2canvas doesn't support lab/oklch)
      const ensureHexColor = (
        color: string | undefined
      ): string | undefined => {
        if (!color || color === "transparent") return color;
        // If it's already hex or a named color, return it
        if (color.startsWith("#") || /^[a-z]+$/i.test(color)) return color;
        // For rgb/rgba, convert to hex
        try {
          const temp = document.createElement("div");
          temp.style.color = color;
          document.body.appendChild(temp);
          const computed = getComputedStyle(temp).color;
          document.body.removeChild(temp);

          // Parse rgb/rgba
          const match = computed.match(
            /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/
          );
          if (match) {
            const r = parseInt(match[1]).toString(16).padStart(2, "0");
            const g = parseInt(match[2]).toString(16).padStart(2, "0");
            const b = parseInt(match[3]).toString(16).padStart(2, "0");
            return `#${r}${g}${b}`;
          }
        } catch {
          console.warn("Failed to convert color:", color);
        }
        return "#000000"; // fallback
      };

      // Create a temporary container for clean rendering
      const tempContainer = document.createElement("div");
      tempContainer.style.cssText = `
        position: absolute;
        left: -9999px;
        top: 0;
        width: 800px;
        padding: 40px 40px 80px 40px;
        background-color: #ffffff;
        font-family: Arial, sans-serif;
        font-size: 16px;
        line-height: 1.6;
        color: #000000;
        all: initial;
        display: block;
        box-sizing: border-box;
      `;
      tempContainer.setAttribute("data-html2canvas-ignore-parent", "true");

      // Recursively render content
      const renderContent = (nodes: Descendant[]): string => {
        if (!nodes || !Array.isArray(nodes)) return "";
        return nodes
          .map((node) => {
            if ("text" in node) {
              const text = node as CustomText;
              let html = text.text || "";

              // Wrap in style span if needed
              const styles: string[] = [];
              if (text.fontFamily && text.fontFamily !== "default") {
                styles.push(`font-family: ${text.fontFamily}`);
              }
              if (text.fontSize) {
                styles.push(`font-size: ${text.fontSize}px`);
              }
              const textColor = ensureHexColor(text.color);
              if (textColor) {
                styles.push(`color: ${textColor}`);
              }
              const bgColor = ensureHexColor(text.backgroundColor);
              if (bgColor && bgColor !== "transparent") {
                styles.push(`background-color: ${bgColor}`);
              }

              if (text.bold) html = `<strong>${html}</strong>`;
              if (text.italic) html = `<em>${html}</em>`;
              if (text.underline) html = `<u>${html}</u>`;
              if (text.strikethrough) html = `<s>${html}</s>`;
              if (text.code)
                html = `<code style="background: #f4f4f4; padding: 2px 4px; border-radius: 3px;">${html}</code>`;

              if (styles.length > 0) {
                html = `<span style="${styles.join("; ")}">${html}</span>`;
              }

              return html;
            }

            if ("children" in node) {
              const element = node as CustomElement;
              const childrenHtml = renderContent(element.children);
              const align = element.align || "left";
              const alignStyle = `text-align: ${align}; margin: 8px 0;`;

              switch (element.type) {
                case "heading-one":
                  return `<h1 style="${alignStyle} font-size: 32px; font-weight: bold;">${childrenHtml}</h1>`;
                case "heading-two":
                  return `<h2 style="${alignStyle} font-size: 24px; font-weight: bold;">${childrenHtml}</h2>`;
                case "heading-three":
                  return `<h3 style="${alignStyle} font-size: 20px; font-weight: bold;">${childrenHtml}</h3>`;
                case "block-quote":
                  return `<blockquote style="${alignStyle} border-left: 4px solid #ccc; padding-left: 16px; margin-left: 0; color: #666;">${childrenHtml}</blockquote>`;
                case "bulleted-list":
                  return `<ul style="${alignStyle} padding-left: 24px;">${childrenHtml}</ul>`;
                case "numbered-list":
                  return `<ol style="${alignStyle} padding-left: 24px;">${childrenHtml}</ol>`;
                case "list-item":
                  return `<li style="margin: 4px 0;">${childrenHtml}</li>`;
                default:
                  return `<p style="${alignStyle}">${childrenHtml}</p>`;
              }
            }

            return "";
          })
          .join("");
      };

      const htmlContent = renderContent(value);

      // Check if we got valid HTML content
      if (!htmlContent || htmlContent.trim() === "") {
        alert("No content to export. Please add some text first.");
        return;
      }

      tempContainer.innerHTML = htmlContent;
      document.body.appendChild(tempContainer);

      // Wait a moment for fonts to load
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Capture with html2canvas with options to avoid parent style inheritance
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 800,
        windowHeight: tempContainer.scrollHeight + 100,
        height: tempContainer.scrollHeight + 100,
        ignoreElements: (element) => {
          // Ignore elements with Tailwind classes that might have lab() colors
          return (
            element.classList &&
            (element.classList.contains("dark") ||
              element.classList.contains("light"))
          );
        },
        onclone: (clonedDoc) => {
          // Remove all stylesheets from the cloned document to prevent lab() colors
          const stylesheets = clonedDoc.querySelectorAll(
            'link[rel="stylesheet"], style'
          );
          stylesheets.forEach((sheet) => sheet.remove());
        },
      });

      // Remove temp container
      document.body.removeChild(tempContainer);

      // Validate canvas
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error("Failed to capture content");
      }

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save("document.pdf");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to export PDF: ${errorMessage}\n\nPlease try again.`);
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-4">
      {/* Toolbar */}
      <div className="flex flex-wrap border-b-0 border items-center gap-2 p-3 rounded-t-xl  bg-muted/50">
        {/* Font Family */}
        <Select
          value={getMarkValue("fontFamily") || "default"}
          onValueChange={(value) => setMarkValue("fontFamily", value)}
        >
          <SelectTrigger className="w-[140px] h-8">
            <SelectValue placeholder="Font" />
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                <span
                  style={{
                    fontFamily:
                      font.value !== "default" ? font.value : undefined,
                  }}
                >
                  {font.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Font Size */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => adjustFontSize(-1)}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <Select
            value={getMarkValue("fontSize") || "16"}
            onValueChange={(value) => setMarkValue("fontSize", value)}
          >
            <SelectTrigger className="w-[85px] h-8">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              {FONT_SIZES.map((size) => (
                <SelectItem key={size.value} value={size.value}>
                  {size.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => adjustFontSize(1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Text Formatting */}
        <div className="flex items-center gap-1">
          <Toggle
            pressed={isMarkActive(editor, "bold")}
            onPressedChange={() => toggleMark("bold")}
            aria-label="Bold"
            size="sm"
          >
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle
            pressed={isMarkActive(editor, "italic")}
            onPressedChange={() => toggleMark("italic")}
            aria-label="Italic"
            size="sm"
          >
            <Italic className="h-4 w-4" />
          </Toggle>
          <Toggle
            pressed={isMarkActive(editor, "underline")}
            onPressedChange={() => toggleMark("underline")}
            aria-label="Underline"
            size="sm"
          >
            <Underline className="h-4 w-4" />
          </Toggle>
          <Toggle
            pressed={isMarkActive(editor, "strikethrough")}
            onPressedChange={() => toggleMark("strikethrough")}
            aria-label="Strikethrough"
            size="sm"
          >
            <Strikethrough className="h-4 w-4" />
          </Toggle>
          <Toggle
            pressed={isMarkActive(editor, "code")}
            onPressedChange={() => toggleMark("code")}
            aria-label="Code"
            size="sm"
          >
            <Code className="h-4 w-4" />
          </Toggle>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Text Color */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-8 gap-2">
              <div
                className="w-4 h-4 rounded border"
                style={{ backgroundColor: getMarkValue("color") || "#000000" }}
              />
              <Type className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={getMarkValue("color") || "#000000"}
                  onChange={(e) => {
                    e.preventDefault();
                    if (editor.selection) {
                      setMarkValue("color", e.target.value);
                    }
                    setTimeout(() => {
                      try {
                        ReactEditor.focus(editor);
                      } catch (err) {
                        console.log("Focus error:", err);
                      }
                    }, 0);
                  }}
                  className="h-10 w-20 cursor-pointer"
                />
                <Input
                  type="text"
                  value={getMarkValue("color") || "#000000"}
                  onChange={(e) => {
                    setMarkValue("color", e.target.value);
                  }}
                  onBlur={() =>
                    setTimeout(() => {
                      try {
                        ReactEditor.focus(editor);
                      } catch (err) {
                        console.log("Focus error:", err);
                      }
                    }, 0)
                  }
                  placeholder="#000000"
                  className="h-10 flex-1 font-mono text-sm"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {TEXT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className="h-8 w-full rounded border-2 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color.value }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      if (editor.selection) {
                        setMarkValue("color", color.value);
                      }
                      setTimeout(() => {
                        try {
                          ReactEditor.focus(editor);
                        } catch (err) {
                          console.log("Focus error:", err);
                        }
                      }, 0);
                    }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Highlight Color */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-8 gap-2">
              <div
                className="w-4 h-4 rounded border"
                style={{
                  backgroundColor:
                    getMarkValue("backgroundColor") || "transparent",
                }}
              />
              <Highlighter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={getMarkValue("backgroundColor") || "#FFFF00"}
                  onChange={(e) => {
                    e.preventDefault();
                    if (editor.selection) {
                      setMarkValue("backgroundColor", e.target.value);
                    }
                    setTimeout(() => {
                      try {
                        ReactEditor.focus(editor);
                      } catch (err) {
                        console.log("Focus error:", err);
                      }
                    }, 0);
                  }}
                  className="h-10 w-20 cursor-pointer"
                />
                <Input
                  type="text"
                  value={getMarkValue("backgroundColor") || "transparent"}
                  onChange={(e) => {
                    setMarkValue("backgroundColor", e.target.value);
                  }}
                  onBlur={() =>
                    setTimeout(() => {
                      try {
                        ReactEditor.focus(editor);
                      } catch (err) {
                        console.log("Focus error:", err);
                      }
                    }, 0)
                  }
                  placeholder="transparent"
                  className="h-10 flex-1 font-mono text-sm"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {HIGHLIGHT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className="h-8 w-full rounded border-2 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color.value }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      if (editor.selection) {
                        setMarkValue("backgroundColor", color.value);
                      }
                      setTimeout(() => {
                        try {
                          ReactEditor.focus(editor);
                        } catch (err) {
                          console.log("Focus error:", err);
                        }
                      }, 0);
                    }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="h-6" />

        {/* Headings */}
        <div className="flex items-center gap-1">
          <Toggle
            pressed={isBlockActive(editor, "heading-one")}
            onPressedChange={() => toggleBlock("heading-one")}
            aria-label="Heading 1"
            size="sm"
          >
            <Heading1 className="h-4 w-4" />
          </Toggle>
          <Toggle
            pressed={isBlockActive(editor, "heading-two")}
            onPressedChange={() => toggleBlock("heading-two")}
            aria-label="Heading 2"
            size="sm"
          >
            <Heading2 className="h-4 w-4" />
          </Toggle>
          <Toggle
            pressed={isBlockActive(editor, "heading-three")}
            onPressedChange={() => toggleBlock("heading-three")}
            aria-label="Heading 3"
            size="sm"
          >
            <Heading3 className="h-4 w-4" />
          </Toggle>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Alignment */}
        <div className="flex items-center gap-1">
          <Toggle
            pressed={false}
            onPressedChange={() => setAlignment("left")}
            aria-label="Align left"
            size="sm"
          >
            <AlignLeft className="h-4 w-4" />
          </Toggle>
          <Toggle
            pressed={false}
            onPressedChange={() => setAlignment("center")}
            aria-label="Align center"
            size="sm"
          >
            <AlignCenter className="h-4 w-4" />
          </Toggle>
          <Toggle
            pressed={false}
            onPressedChange={() => setAlignment("right")}
            aria-label="Align right"
            size="sm"
          >
            <AlignRight className="h-4 w-4" />
          </Toggle>
          <Toggle
            pressed={false}
            onPressedChange={() => setAlignment("justify")}
            aria-label="Justify"
            size="sm"
          >
            <AlignJustify className="h-4 w-4" />
          </Toggle>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-1">
          <Toggle
            pressed={isBlockActive(editor, "bulleted-list")}
            onPressedChange={() => toggleBlock("bulleted-list")}
            aria-label="Bullet list"
            size="sm"
          >
            <List className="h-4 w-4" />
          </Toggle>
          <Toggle
            pressed={isBlockActive(editor, "numbered-list")}
            onPressedChange={() => toggleBlock("numbered-list")}
            aria-label="Numbered list"
            size="sm"
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>
          <Toggle
            pressed={isBlockActive(editor, "block-quote")}
            onPressedChange={() => toggleBlock("block-quote")}
            aria-label="Quote"
            size="sm"
          >
            <Quote className="h-4 w-4" />
          </Toggle>
        </div>
      </div>

      {/* Editor and Preview */}
      <div
        className={`flex-1 grid ${
          showPreview ? "grid-cols-2 gap-4" : "grid-cols-1"
        } overflow-hidden`}
      >
        {/* Editor */}
        <div className="border rounded-b-xl bg-background flex flex-col overflow-hidden">
          <div id="slate-export" className="flex-1 overflow-y-auto mb-4 p-8">
            <Slate editor={editor} initialValue={value} onChange={handleChange}>
              <Editable
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                placeholder="Start writing your content..."
                className="prose prose-sm max-w-none focus:outline-none h-full"
                spellCheck
                autoFocus
              />
            </Slate>
          </div>

          <div className="flex items-center gap-2 px-5 py-3 bg-muted border-t">
            {/* Keyboard Sound Toggle */}
            <Toggle
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

            <Separator orientation="vertical" className="h-6" />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? (
                <EyeOff className="h-4 w-4 mr-2" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )}
              {showPreview ? "Hide Preview" : "Show Preview"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportTxt}>
              <FileText className="h-4 w-4 mr-2" />
              Export TXT
            </Button>
            <Button size="sm" onClick={handleExportPdf}>
              <FileDown className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Preview */}
        {showPreview && (
          <div
            id="slate-preview"
            className="border rounded-lg p-6 bg-muted/30 overflow-y-auto flex flex-col"
          >
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            <div className="prose prose-sm max-w-none">
              <Slate editor={previewEditor} initialValue={value}>
                <Editable
                  renderElement={renderElement}
                  renderLeaf={renderLeaf}
                  readOnly
                />
              </Slate>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
