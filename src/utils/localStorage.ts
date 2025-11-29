// localStorage utility functions for both editors

export interface SimpleEditorData {
  title: string;
  description: string;
}

export interface RichEditorData {
  time?: number;
  blocks: {
    type: string;
    data: Record<string, unknown>;
  }[];
  version?: string;
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

// Rich Text Editor Storage
export const saveRichEditor = (data: RichEditorData): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("richEditor", JSON.stringify(data));
  }
};

export const loadRichEditor = (): RichEditorData | null => {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem("richEditor");
    if (data) {
      return JSON.parse(data);
    }
  }
  return null;
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
