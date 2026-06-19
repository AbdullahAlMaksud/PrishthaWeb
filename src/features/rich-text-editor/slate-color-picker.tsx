import React from "react";
import { Editor } from "slate";
import { ReactEditor } from "slate-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Type, Highlighter } from "lucide-react";
import { TEXT_COLORS, HIGHLIGHT_COLORS } from "./slate-constants";
import { getMarkValue, setMarkValue } from "./slate-helpers";

interface ISlateColorPickerProps {
  editor: Editor;
  format: "color" | "backgroundColor";
  triggerReRender: () => void;
}

export const SlateColorPicker: React.FC<ISlateColorPickerProps> = ({
  editor,
  format,
  triggerReRender,
}) => {
  const isColor = format === "color";
  const defaultVal = isColor ? "#000000" : "transparent";
  const currentVal = getMarkValue(editor, format) || defaultVal;
  const colors = isColor ? TEXT_COLORS : HIGHLIGHT_COLORS;

  const handleColorChange = (value: string) => {
    setMarkValue(editor, format, value);
    triggerReRender();
    setTimeout(() => {
      try {
        ReactEditor.focus(editor as ReactEditor);
      } catch (err) {
        console.log("Focus error:", err);
      }
    }, 0);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-8 gap-2" aria-label={isColor ? "Text Color" : "Highlight Color"}>
          <div
            className="w-4 h-4 rounded border"
            style={{ backgroundColor: currentVal === "transparent" ? "transparent" : currentVal }}
          />
          {isColor ? <Type className="h-4 w-4" /> : <Highlighter className="h-4 w-4" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={currentVal === "transparent" ? "#FFFF00" : currentVal}
              onChange={(e) => {
                e.preventDefault();
                handleColorChange(e.target.value);
              }}
              className="h-10 w-20 cursor-pointer"
            />
            <Input
              type="text"
              value={currentVal}
              onChange={(e) => handleColorChange(e.target.value)}
              onBlur={() => {
                setTimeout(() => {
                  try {
                    ReactEditor.focus(editor as ReactEditor);
                  } catch (err) {
                    console.log("Focus error:", err);
                  }
                }, 0);
              }}
              placeholder={isColor ? "#000000" : "transparent"}
              className="h-10 flex-1 font-mono text-sm"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {colors.map((color) => (
              <button
                key={color.value}
                type="button"
                className="h-8 w-full rounded border-2 hover:scale-110 transition-transform"
                style={{ backgroundColor: color.value === "transparent" ? "white" : color.value }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleColorChange(color.value);
                }}
                title={color.label}
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
