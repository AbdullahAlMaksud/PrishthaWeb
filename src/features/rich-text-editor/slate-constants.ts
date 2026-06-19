import { Descendant } from "slate";

export const INITIAL_VALUE: Descendant[] = [
  {
    type: "paragraph",
    children: [{ text: "Start writing your content here..." }],
  },
] as unknown as Descendant[];

// Font families
export const FONT_FAMILIES = [
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
export const FONT_SIZES = [
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
export const TEXT_COLORS = [
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
export const HIGHLIGHT_COLORS = [
  { value: "transparent", label: "None" },
  { value: "#FFFF00", label: "Yellow" },
  { value: "#00FF00", label: "Green" },
  { value: "#00FFFF", label: "Cyan" },
  { value: "#FF00FF", label: "Magenta" },
  { value: "#FFA500", label: "Orange" },
  { value: "#FFB6C1", label: "Pink" },
];
