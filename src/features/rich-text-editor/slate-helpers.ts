import { Editor, Transforms, Element as SlateElement } from "slate";
import { CustomElement } from "./slate-editor";

export const isMarkActive = (editor: Editor, format: string): boolean => {
  const marks = Editor.marks(editor);
  return marks ? (marks as Record<string, unknown>)[format] === true : false;
};

export const isBlockActive = (editor: Editor, format: string): boolean => {
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

export const toggleMark = (editor: Editor, format: string): void => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

export const toggleBlock = (editor: Editor, format: string): void => {
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

export const setMarkValue = (editor: Editor, format: string, value: string): void => {
  if (editor.selection) {
    Editor.addMark(editor, format, value);
  }
};

export const getMarkValue = (editor: Editor, format: string): string | undefined => {
  const marks = Editor.marks(editor);
  return marks
    ? ((marks as Record<string, unknown>)[format] as string)
    : undefined;
};

export const setAlignment = (editor: Editor, align: string): void => {
  Transforms.setNodes(editor, { align } as Partial<CustomElement>, {
    match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n),
  });
};

export const adjustFontSize = (editor: Editor, delta: number): void => {
  const currentSize = parseInt(getMarkValue(editor, "fontSize") || "16");
  const newSize = Math.max(8, Math.min(72, currentSize + delta));
  setMarkValue(editor, "fontSize", newSize.toString());
};
