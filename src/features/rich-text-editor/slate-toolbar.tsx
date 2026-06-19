import React from "react";
import { Editor } from "slate";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
} from "lucide-react";
import { SlateFontControls } from "./slate-font-controls";
import { SlateColorPicker } from "./slate-color-picker";
import {
  isMarkActive,
  toggleMark,
  isBlockActive,
  toggleBlock,
  setAlignment,
} from "./slate-helpers";

interface ISlateToolbarProps {
  editor: Editor;
  triggerReRender: () => void;
}

export const SlateToolbar: React.FC<ISlateToolbarProps> = ({
  editor,
  triggerReRender,
}) => {
  const handleToggleMark = (format: string) => {
    toggleMark(editor, format);
    triggerReRender();
  };

  const handleToggleBlock = (format: string) => {
    toggleBlock(editor, format);
    triggerReRender();
  };

  const handleSetAlignment = (align: string) => {
    setAlignment(editor, align);
    triggerReRender();
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 py-3 px-0 bg-transparent border-0">
      {/* Font Family and Font Size */}
      <SlateFontControls editor={editor} triggerReRender={triggerReRender} />

      <Separator orientation="vertical" className="h-6" />

      {/* Text Formatting */}
      <div className="flex items-center gap-1">
        <Toggle
          pressed={isMarkActive(editor, "bold")}
          onPressedChange={() => handleToggleMark("bold")}
          aria-label="Bold"
          size="sm"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          pressed={isMarkActive(editor, "italic")}
          onPressedChange={() => handleToggleMark("italic")}
          aria-label="Italic"
          size="sm"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          pressed={isMarkActive(editor, "underline")}
          onPressedChange={() => handleToggleMark("underline")}
          aria-label="Underline"
          size="sm"
        >
          <Underline className="h-4 w-4" />
        </Toggle>
        <Toggle
          pressed={isMarkActive(editor, "strikethrough")}
          onPressedChange={() => handleToggleMark("strikethrough")}
          aria-label="Strikethrough"
          size="sm"
        >
          <Strikethrough className="h-4 w-4" />
        </Toggle>
        <Toggle
          pressed={isMarkActive(editor, "code")}
          onPressedChange={() => handleToggleMark("code")}
          aria-label="Code"
          size="sm"
        >
          <Code className="h-4 w-4" />
        </Toggle>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Text Color Picker */}
      <SlateColorPicker editor={editor} format="color" triggerReRender={triggerReRender} />

      {/* Highlight Color Picker */}
      <SlateColorPicker editor={editor} format="backgroundColor" triggerReRender={triggerReRender} />

      <Separator orientation="vertical" className="h-6" />

      {/* Headings */}
      <div className="flex items-center gap-1">
        <Toggle
          pressed={isBlockActive(editor, "heading-one")}
          onPressedChange={() => handleToggleBlock("heading-one")}
          aria-label="Heading 1"
          size="sm"
        >
          <Heading1 className="h-4 w-4" />
        </Toggle>
        <Toggle
          pressed={isBlockActive(editor, "heading-two")}
          onPressedChange={() => handleToggleBlock("heading-two")}
          aria-label="Heading 2"
          size="sm"
        >
          <Heading2 className="h-4 w-4" />
        </Toggle>
        <Toggle
          pressed={isBlockActive(editor, "heading-three")}
          onPressedChange={() => handleToggleBlock("heading-three")}
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
          onPressedChange={() => handleSetAlignment("left")}
          aria-label="Align left"
          size="sm"
        >
          <AlignLeft className="h-4 w-4" />
        </Toggle>
        <Toggle
          pressed={false}
          onPressedChange={() => handleSetAlignment("center")}
          aria-label="Align center"
          size="sm"
        >
          <AlignCenter className="h-4 w-4" />
        </Toggle>
        <Toggle
          pressed={false}
          onPressedChange={() => handleSetAlignment("right")}
          aria-label="Align right"
          size="sm"
        >
          <AlignRight className="h-4 w-4" />
        </Toggle>
        <Toggle
          pressed={false}
          onPressedChange={() => handleSetAlignment("justify")}
          aria-label="Justify"
          size="sm"
        >
          <AlignJustify className="h-4 w-4" />
        </Toggle>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Lists & Quotes */}
      <div className="flex items-center gap-1">
        <Toggle
          pressed={isBlockActive(editor, "bulleted-list")}
          onPressedChange={() => handleToggleBlock("bulleted-list")}
          aria-label="Bullet list"
          size="sm"
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          pressed={isBlockActive(editor, "numbered-list")}
          onPressedChange={() => handleToggleBlock("numbered-list")}
          aria-label="Numbered list"
          size="sm"
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        <Toggle
          pressed={isBlockActive(editor, "block-quote")}
          onPressedChange={() => handleToggleBlock("block-quote")}
          aria-label="Quote"
          size="sm"
        >
          <Quote className="h-4 w-4" />
        </Toggle>
      </div>
    </div>
  );
};
