export type CustomText = {
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

export type CustomElement = {
  type: string;
  align?: string;
  children: CustomText[];
};

export interface ISlateRichTextEditorProps {
  fileId?: string | null;
  onFileSaved?: (id: string) => void;
}
