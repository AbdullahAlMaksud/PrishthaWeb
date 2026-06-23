"use client";

import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { SettingsModal } from "@/components/common/settings-modal";
import { SimpleTextEditor } from "@/features/plain-text-editor/simple-text-editor";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { FileSidebar } from "@/components/common/file-sidebar";
import { 
  listSimpleFiles, 
  listRichFiles, 
  loadKeyboardSoundSetting, 
  saveKeyboardSoundSetting,
  loadKeyboardSoundTypeSetting,
  saveKeyboardSoundTypeSetting
} from "@/shared/lib/local-storage";
import { Navbar } from "@/components/common/navbar";
import { ParticlesComponent } from "@/components/common/particles-component";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

const LexicalRichTextEditor = dynamic(
  () =>
    import("@/features/rich-text-editor/lexical-rich-text-editor").then((mod) => ({
      default: mod.LexicalRichTextEditor,
    })),
  { ssr: false }
);

interface IEditorActions {
  save?: () => void;
  downloadTxt?: () => void;
  downloadPdf?: () => void;
  print?: () => void;
  togglePreview?: () => void;
  showPreview?: boolean;
}

interface ThemePreset {
  id: string;
  name: string;
  className: string;
}

const THEMES: ThemePreset[] = [
  { id: "default-light", name: "Default Light", className: "" },
  { id: "sakura-light", name: "Sakura Light", className: "theme-sakura" },
  { id: "sepia-light", name: "Sepia Light", className: "theme-sepia" },
  { id: "default-dark", name: "Default Dark", className: "dark" },
  { id: "nord-dark", name: "Nord Dark", className: "dark theme-nord" },
  { id: "ocean-dark", name: "Ocean Dark", className: "dark theme-ocean" },
  { id: "forest-dark", name: "Forest Dark", className: "dark theme-forest" },
];

export default function Home() {
  const [currentSimpleFileId, setCurrentSimpleFileId] = useState<string | null>(null);
  const [currentRichFileId, setCurrentRichFileId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("simple");
  const [triggerVal, setTriggerVal] = useState(0); // Forces re-render of floating navbar action status
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [alertDialog, setAlertDialog] = useState<{
    title: string;
    description: string;
  } | null>(null);

  const handleShowAlert = (title: string, description: string) => {
    setAlertDialog({ title, description });
  };
  
  const [promptDialog, setPromptDialog] = useState<{
    title: string;
    defaultValue: string;
    onSubmit: (value: string) => void;
  } | null>(null);

  const [promptValue, setPromptValue] = useState("");

  const handleShowPrompt = (
    title: string,
    defaultValue: string,
    onSubmit: (value: string) => void
  ) => {
    setPromptValue(defaultValue);
    setPromptDialog({ title, defaultValue, onSubmit });
  };
  
  const [isNavbarPinned, setIsNavbarPinned] = useState(false);

  const handleToggleNavbarPin = () => {
    const nextPinned = !isNavbarPinned;
    setIsNavbarPinned(nextPinned);
    if (typeof window !== "undefined") {
      localStorage.setItem("navbarPinned", String(nextPinned));
    }
  };

  const [themeId, setThemeId] = useState("default-light");

  const applyTheme = (id: string) => {
    if (typeof window === "undefined") return;
    const currentThemeObj = THEMES.find((t) => t.id === id) || THEMES[0];
    const doc = document.documentElement;

    doc.classList.remove(
      "dark",
      "theme-sakura",
      "theme-sepia",
      "theme-nord",
      "theme-ocean",
      "theme-forest"
    );

    if (currentThemeObj.className) {
      currentThemeObj.className.split(" ").forEach((cls) => {
        if (cls) doc.classList.add(cls);
      });
    }

    localStorage.setItem("selectedThemeId", id);
    setThemeId(id);
  };

  useEffect(() => {
    // Theme loading
    const savedTheme = localStorage.getItem("selectedThemeId");
    if (savedTheme && THEMES.some((t) => t.id === savedTheme)) {
      applyTheme(savedTheme);
    } else {
      applyTheme("default-light");
    }

    // Sidebar Pinned State loading
    setIsNavbarPinned(localStorage.getItem("navbarPinned") === "true");

    // Sound Settings loading
    setKeyboardSoundEnabled(loadKeyboardSoundSetting());
    setKeyboardSoundType(loadKeyboardSoundTypeSetting());
  }, []);

  const cycleTheme = () => {
    const currentIndex = THEMES.findIndex((t) => t.id === themeId);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    applyTheme(THEMES[nextIndex].id);
  };

  // Keyboard shortcuts: Pressing shortcuts outside edit fields triggers features
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl) {
        const tagName = activeEl.tagName.toLowerCase();
        const isInput =
          tagName === "input" ||
          tagName === "textarea" ||
          activeEl.hasAttribute("contenteditable") ||
          activeEl.closest("[contenteditable]");
        if (isInput) return; // Ignore if focused inside editor or input
      }

      const key = e.key.toLowerCase();
      if (key === "d") {
        cycleTheme();
      } else if (key === "s") {
        e.preventDefault();
        setIsSettingsOpen((prev) => !prev);
      } else if (key === "p") {
        e.preventDefault();
        handleToggleNavbarPin();
      } else if (key === "f") {
        e.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      } else if (e.key === "Escape") {
        setIsSettingsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [themeId, isNavbarPinned]);

  const [keyboardSoundEnabled, setKeyboardSoundEnabled] = useState(false);

  const [keyboardSoundType, setKeyboardSoundType] = useState("default");

  const handleToggleSound = (enabled: boolean) => {
    setKeyboardSoundEnabled(enabled);
    saveKeyboardSoundSetting(enabled);
  };

  const handleSelectSoundType = (type: string) => {
    setKeyboardSoundType(type);
    saveKeyboardSoundTypeSetting(type);
  };

  // Ref to hold the active editor actions
  const editorActionsRef = useRef<IEditorActions>({});

  // Reset actions when active tab changes
  useEffect(() => {
    editorActionsRef.current = {};
    setTriggerVal((v) => v + 1);
  }, [activeTab]);

  const handleSelectFile = (id: string, type: "simple" | "rich") => {
    if (type === "simple") {
      const files = listSimpleFiles();
      const file = files.find((f) => f.id === id);
      if (file) {
        localStorage.setItem("simpleEditor", JSON.stringify(file.content));
        setCurrentSimpleFileId(id);
        setActiveTab("simple");
        setIsSheetOpen(false);
      }
    } else {
      const files = listRichFiles();
      const file = files.find((f) => f.id === id);
      if (file) {
        localStorage.setItem("richEditor", JSON.stringify(file.content));
        setCurrentRichFileId(id);
        setActiveTab("rich");
        setIsSheetOpen(false);
      }
    }
  };

  const handleNewFile = (type: "simple" | "rich") => {
    if (type === "simple") {
      localStorage.setItem("simpleEditor", JSON.stringify({ title: "", description: "" }));
      setCurrentSimpleFileId(null);
      setActiveTab("simple");
    } else {
      const initial = [{ type: "paragraph", children: [{ text: "" }] }];
      localStorage.setItem("richEditor", JSON.stringify(initial));
      setCurrentRichFileId(null);
      setActiveTab("rich");
    }
    setIsSheetOpen(false);
  };

  return (
    <div className="h-screen w-screen flex flex-col text-foreground overflow-hidden relative">
      <ParticlesComponent themeId={themeId} />
      <main className={`flex-1 overflow-hidden relative z-10 transition-all duration-300 ${isNavbarPinned ? "pr-16 md:pr-24" : "pr-0"}`}>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="h-full w-full relative"
        >
          {/* Unified Floating Navbar */}
          <Navbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isSheetOpen={isSheetOpen}
            setIsSheetOpen={setIsSheetOpen}
            theme={themeId}
            toggleTheme={cycleTheme}
            onNewFile={handleNewFile}
            onSave={() => editorActionsRef.current.save?.()}
            onDownloadTxt={() => editorActionsRef.current.downloadTxt?.()}
            onDownloadPdf={() => editorActionsRef.current.downloadPdf?.()}
            onPrint={() => editorActionsRef.current.print?.()}
            onTogglePreview={() => {
              editorActionsRef.current.togglePreview?.();
              setTriggerVal((v) => v + 1);
            }}
            showPreview={editorActionsRef.current.showPreview}
            isNavbarPinned={isNavbarPinned}
            onToggleNavbarPin={handleToggleNavbarPin}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />

          <TabsContent value="simple" className="h-full w-full outline-none data-[state=inactive]:hidden">
            <SimpleTextEditor 
              key={currentSimpleFileId || "new"} 
              fileId={currentSimpleFileId}
              onFileSaved={setCurrentSimpleFileId}
              actionsRef={editorActionsRef}
              keyboardSoundEnabled={keyboardSoundEnabled}
              keyboardSoundType={keyboardSoundType}
              onToggleSound={handleToggleSound}
              showAlert={handleShowAlert}
            />
          </TabsContent>

          <TabsContent value="rich" className="h-full w-full outline-none data-[state=inactive]:hidden">
            <LexicalRichTextEditor 
              key={currentRichFileId || "new"}
              fileId={currentRichFileId}
              onFileSaved={setCurrentRichFileId}
              actionsRef={editorActionsRef}
              keyboardSoundEnabled={keyboardSoundEnabled}
              keyboardSoundType={keyboardSoundType}
              onToggleSound={handleToggleSound}
              showAlert={handleShowAlert}
              showPrompt={handleShowPrompt}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Right side sheet / drawer for file list */}
      <div
        aria-hidden={!isSheetOpen}
        className={`fixed inset-0 bg-black/40 dark:bg-black/60 z-40 transition-opacity duration-200 ${
          isSheetOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsSheetOpen(false)}
      />

      <aside
        role="dialog"
        aria-modal={isSheetOpen}
        className={`fixed top-0 right-0 h-full z-50 bg-background shadow-2xl transform transition-transform duration-300 ${
          isSheetOpen ? "translate-x-0" : "translate-x-full"
        } w-72 md:w-96 border-l`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="font-semibold text-foreground">My Files</div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSheetOpen(false)}
            aria-label="Close menu"
            className="cursor-pointer hover:bg-muted"
          >
            <ChevronLeft className="rotate-180 h-4 w-4 text-foreground" />
          </Button>
        </div>
        <div className="h-[calc(100%-60px)]">
           <FileSidebar 
            isOpen={isSheetOpen}
            onSelectFile={handleSelectFile}
            onNewFile={handleNewFile}
            currentFileId={activeTab === "simple" ? currentSimpleFileId : currentRichFileId}
            showPrompt={handleShowPrompt}
           />
        </div>
      </aside>

      {/* App Alert Modals */}
      {alertDialog && (
        <AlertDialog open={!!alertDialog} onOpenChange={(open) => !open && setAlertDialog(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{alertDialog.title}</AlertDialogTitle>
              <AlertDialogDescription>{alertDialog.description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction className="cursor-pointer" onClick={() => setAlertDialog(null)}>
                Okay
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* App Prompt Modal */}
      {promptDialog && (
        <AlertDialog open={!!promptDialog} onOpenChange={(open) => !open && setPromptDialog(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{promptDialog.title}</AlertDialogTitle>
              <AlertDialogDescription>
                Please enter a name for your document below.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <input
                type="text"
                value={promptValue}
                onChange={(e) => setPromptValue(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-transparent text-foreground outline-none border-border focus:ring-1 focus:ring-primary font-medium"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    promptDialog.onSubmit(promptValue);
                    setPromptDialog(null);
                  }
                }}
              />
            </div>
            <AlertDialogFooter>
              <button
                type="button"
                className="px-4 py-2 border rounded-md text-sm cursor-pointer hover:bg-muted text-foreground"
                onClick={() => setPromptDialog(null)}
              >
                Cancel
              </button>
              <AlertDialogAction
                className="cursor-pointer"
                onClick={() => {
                  promptDialog.onSubmit(promptValue);
                  setPromptDialog(null);
                }}
              >
                Save
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        themeId={themeId}
        onSelectTheme={applyTheme}
        keyboardSoundEnabled={keyboardSoundEnabled}
        onToggleSound={handleToggleSound}
        keyboardSoundType={keyboardSoundType}
        onSelectSoundType={handleSelectSoundType}
        isNavbarPinned={isNavbarPinned}
        onToggleNavbarPin={handleToggleNavbarPin}
        themes={THEMES}
      />
    </div>
  );
}

