export interface ISimpleTextEditorProps {
  fileId?: string | null;
  onFileSaved?: (id: string) => void;
}
