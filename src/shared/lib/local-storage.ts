// localStorage utility functions for both editors

export interface SimpleEditorData {
  title: string;
  description: string;
}

// Using any for blocks/content to support different editor versions (Slate vs EditorJS)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface RichEditorData {
  time?: number;
  blocks?: any[];
  version?: string;
  // Slate structure support
  children?: any[]; 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface SavedFile<T> {
  id: string;
  name: string;
  content: T;
  createdAt: number;
  updatedAt: number;
}

// Simple Text Editor Storage
export const saveSimpleEditor = (data: SimpleEditorData): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("simpleEditor", JSON.stringify(data));
  }
};

export const loadSimpleEditor = (): SimpleEditorData => {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem("simpleEditor");
    if (data) {
      return JSON.parse(data);
    }
  }
  return { title: "", description: "" };
};

// Simple Editor Multi-file Storage
export const saveSimpleFile = (name: string, content: SimpleEditorData): SavedFile<SimpleEditorData> => {
  if (typeof window === "undefined") throw new Error("Client side only");
  
  const files = listSimpleFiles();
  const newFile: SavedFile<SimpleEditorData> = {
    id: crypto.randomUUID(),
    name: name || content.title || "Untitled",
    content,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  files.unshift(newFile);
  localStorage.setItem("simpleEditor_files", JSON.stringify(files));
  return newFile;
};

export const updateSimpleFile = (id: string, content: SimpleEditorData): void => {
  if (typeof window === "undefined") return;
  const files = listSimpleFiles();
  const index = files.findIndex((f) => f.id === id);
  if (index !== -1) {
    files[index] = {
      ...files[index],
      content,
      updatedAt: Date.now(),
      name: content.title || files[index].name // Update name if title changes? Maybe optional.
    };
    localStorage.setItem("simpleEditor_files", JSON.stringify(files));
  }
};

export const listSimpleFiles = (): SavedFile<SimpleEditorData>[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem("simpleEditor_files");
  return data ? JSON.parse(data) : [];
};

export const deleteSimpleFile = (id: string): void => {
  if (typeof window === "undefined") return;
  const files = listSimpleFiles().filter((f) => f.id !== id);
  localStorage.setItem("simpleEditor_files", JSON.stringify(files));
};

// Rich Text Editor Storage
// Using any here to accept Slate structure
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const saveRichEditor = (data: any): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("richEditor", JSON.stringify(data));
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const loadRichEditor = (): any | null => {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem("richEditor");
    if (data) {
      return JSON.parse(data);
    }
  }
  return null;
};

// Rich Editor Multi-file Storage
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const saveRichFile = (name: string, content: any): SavedFile<any> => {
  if (typeof window === "undefined") throw new Error("Client side only");
  
  const files = listRichFiles();
  const newFile: SavedFile<any> = {
    id: crypto.randomUUID(),
    name: name || "Untitled Document",
    content,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  files.unshift(newFile);
  localStorage.setItem("richEditor_files", JSON.stringify(files));
  return newFile;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateRichFile = (id: string, content: any): void => {
  if (typeof window === "undefined") return;
  const files = listRichFiles();
  const index = files.findIndex((f) => f.id === id);
  if (index !== -1) {
    files[index] = {
      ...files[index],
      content,
      updatedAt: Date.now()
    };
    localStorage.setItem("richEditor_files", JSON.stringify(files));
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const listRichFiles = (): SavedFile<any>[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem("richEditor_files");
  return data ? JSON.parse(data) : [];
};

export const deleteRichFile = (id: string): void => {
  if (typeof window === "undefined") return;
  const files = listRichFiles().filter((f) => f.id !== id);
  localStorage.setItem("richEditor_files", JSON.stringify(files));
};

// Keyboard Sound Setting
export const saveKeyboardSoundSetting = (enabled: boolean): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("keyboardSoundEnabled", JSON.stringify(enabled));
  }
};

export const loadKeyboardSoundSetting = (): boolean => {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem("keyboardSoundEnabled");
    if (data) {
      return JSON.parse(data);
    }
  }
  return false;
};
