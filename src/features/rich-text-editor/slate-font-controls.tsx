import React from "react";
import { Editor } from "slate";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Minus, Plus } from "lucide-react";
import { FONT_FAMILIES, FONT_SIZES } from "./slate-constants";
import { getMarkValue, setMarkValue, adjustFontSize } from "./slate-helpers";

interface ISlateFontControlsProps {
  editor: Editor;
  triggerReRender: () => void;
}

export const SlateFontControls: React.FC<ISlateFontControlsProps> = ({
  editor,
  triggerReRender,
}) => {
  const currentFont = getMarkValue(editor, "fontFamily") || "default";
  const currentSize = getMarkValue(editor, "fontSize") || "16";

  const handleFontChange = (value: string) => {
    setMarkValue(editor, "fontFamily", value);
    triggerReRender();
  };

  const handleSizeChange = (value: string) => {
    setMarkValue(editor, "fontSize", value);
    triggerReRender();
  };

  const handleAdjustFontSize = (delta: number) => {
    adjustFontSize(editor, delta);
    triggerReRender();
  };

  return (
    <>
      {/* Font Family */}
      <Select value={currentFont} onValueChange={handleFontChange}>
        <SelectTrigger className="w-[140px] h-8" aria-label="Font Family">
          <SelectValue placeholder="Font" />
        </SelectTrigger>
        <SelectContent>
          {FONT_FAMILIES.map((font) => (
            <SelectItem key={font.value} value={font.value}>
              <span
                style={{
                  fontFamily: font.value !== "default" ? font.value : undefined,
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
          onClick={() => handleAdjustFontSize(-1)}
          aria-label="Decrease Font Size"
        >
          <Minus className="h-3 w-3" />
        </Button>
        <Select value={currentSize} onValueChange={handleSizeChange}>
          <SelectTrigger className="w-[85px] h-8" aria-label="Font Size">
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
          onClick={() => handleAdjustFontSize(1)}
          aria-label="Increase Font Size"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </>
  );
};
