import React from "react";

export interface IEditorActions {
  save?: () => void;
  downloadTxt?: () => void;
  downloadPdf?: () => void;
  print?: () => void;
  togglePreview?: () => void;
  showPreview?: boolean;
}

export interface ISimpleTextEditorProps {
  fileId?: string | null;
  onFileSaved?: (id: string) => void;
  actionsRef?: React.MutableRefObject<IEditorActions>;
  keyboardSoundEnabled: boolean;
  keyboardSoundType: string;
  onToggleSound?: (enabled: boolean) => void;
  showAlert?: (title: string, desc: string) => void;
}
