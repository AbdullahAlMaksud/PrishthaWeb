import React from "react";

export interface IEditorActions {
  save?: () => void;
  downloadTxt?: () => void;
  downloadPdf?: () => void;
  print?: () => void;
  togglePreview?: () => void;
  showPreview?: boolean;
}

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
  actionsRef?: React.MutableRefObject<IEditorActions>;
  keyboardSoundEnabled: boolean;
  showAlert?: (title: string, desc: string) => void;
  showPrompt?: (title: string, defaultValue: string, onSubmit: (value: string) => void) => void;
}
