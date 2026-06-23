"use client";

import React, { useState, useEffect } from "react";
import { X, Volume2, VolumeX, Palette, Pin, Maximize2, Minimize2, Keyboard, Settings } from "lucide-react";

export interface ThemePreset {
  id: string;
  name: string;
  className: string;
}

export interface ISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeId: string;
  onSelectTheme: (id: string) => void;
  keyboardSoundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
  keyboardSoundType: string;
  onSelectSoundType: (type: string) => void;
  isNavbarPinned: boolean;
  onToggleNavbarPin: () => void;
  themes: ThemePreset[];
}

const THEME_DISPLAY_NAMES: Record<string, string> = {
  "default-light": "Snow",
  "sakura-light": "Sakura",
  "sepia-light": "Honey",
  "default-dark": "Obsidian",
  "nord-dark": "Nord",
  "ocean-dark": "Ocean",
  "forest-dark": "Forest",
};

// Core color representations for the circles in settings menu
const THEME_COLORS: Record<string, string> = {
  "default-light": "#f4f4f5", // Light zinc
  "sakura-light": "#ec4899",  // Pink
  "sepia-light": "#d97706",   // Amber/Honey
  "default-dark": "#09090b",   // Dark Obsidian
  "nord-dark": "#88c0d0",     // Nord ice blue
  "ocean-dark": "#38bdf8",    // Ocean sky blue
  "forest-dark": "#10b981",   // Forest green
};

export const SettingsModal: React.FC<ISettingsModalProps> = ({
  isOpen,
  onClose,
  themeId,
  onSelectTheme,
  keyboardSoundEnabled,
  onToggleSound,
  keyboardSoundType,
  onSelectSoundType,
  isNavbarPinned,
  onToggleNavbarPin,
  themes,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (typeof window === "undefined") return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error("Failed to enter fullscreen:", err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error("Failed to exit fullscreen:", err);
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-md transition-opacity duration-300">
      {/* Backdrop Close Click */}
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      {/* Inject Style to Hide Scrollbars */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
        }
        .no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}</style>

      {/* Outer Modal Container (Handles Glassmorphic Background and Size - Static, does not scroll) */}
      <div 
        className="w-full max-w-lg border border-border/85 rounded-3xl shadow-2xl relative overflow-hidden text-foreground flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 backdrop-blur-xl"
      >
        {/* Background Gradient Layer with Opacity to enable true glassmorphism */}
        <div 
          className="absolute inset-0 z-0 opacity-80 pointer-events-none"
          style={{
            background: "radial-gradient(circle at top right, var(--muted) 0%, var(--card) 100%)",
          }}
        />

        {/* Theme-Adaptive Dashed Grid Background Overlay inside Modal */}
        <div
          className="absolute inset-0 z-0 opacity-25 dark:opacity-15 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, var(--border) 1px, transparent 1px),
              linear-gradient(to bottom, var(--border) 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 0 0",
            maskImage: `
              repeating-linear-gradient(
                to right,
                black 0px,
                black 3px,
                transparent 3px,
                transparent 8px
              ),
              repeating-linear-gradient(
                to bottom,
                black 0px,
                black 3px,
                transparent 3px,
                transparent 8px
              )
            `,
            WebkitMaskImage: `
              repeating-linear-gradient(
                to right,
                black 0px,
                black 3px,
                transparent 3px,
                transparent 8px
              ),
              repeating-linear-gradient(
                to bottom,
                black 0px,
                black 3px,
                transparent 3px,
                transparent 8px
              )
            `,
            maskComposite: "intersect",
            WebkitMaskComposite: "source-in",
          }}
        />

        {/* Spotlight Glows */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground hover:bg-muted/50 p-2 rounded-full cursor-pointer transition-colors focus:outline-none z-30"
          aria-label="Close settings"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Inner Scrollable Container (no scrollbar visible) */}
        <div className="relative z-10 w-full overflow-y-auto no-scrollbar p-6 md:p-8 flex flex-col gap-6">
          {/* Header */}
          <div className="text-center shrink-0">
            <p className="text-[10px] tracking-[0.25em] font-bold text-muted-foreground uppercase">
              Preferences
            </p>
            <h2 className="text-3xl font-light tracking-wide text-foreground mt-1">
              Settings
            </h2>
          </div>

          {/* Section 1: Themes */}
          <div className="border border-border/40 bg-card/40 rounded-2xl p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs tracking-wider font-semibold text-muted-foreground uppercase">
                <Palette className="h-4 w-4 text-primary" />
                Theme
              </div>
              <span className="text-[10px] text-muted-foreground">Press D to cycle</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 justify-items-center">
              {themes.map((theme) => {
                const isActive = theme.id === themeId;
                const color = THEME_COLORS[theme.id] || "#ffffff";
                const displayName = THEME_DISPLAY_NAMES[theme.id] || theme.name;
                return (
                  <button
                    key={theme.id}
                    onClick={() => onSelectTheme(theme.id)}
                    className="flex flex-col items-center gap-1.5 group cursor-pointer focus:outline-none"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isActive
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105"
                          : "border border-border/80 group-hover:border-muted-foreground"
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded-full shadow-inner"
                        style={{ backgroundColor: color }}
                      />
                    </div>
                    <span
                      className={`text-[10px] text-center truncate max-w-[60px] ${
                        isActive ? "text-primary font-semibold" : "text-muted-foreground"
                      }`}
                    >
                      {displayName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Preferences Toggles */}
          <div className="border border-border/40 bg-card/40 rounded-2xl p-4 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-xs tracking-wider font-semibold text-muted-foreground uppercase">
              <Settings className="h-4 w-4 text-primary" />
              Preferences
            </div>

            <div className="flex flex-col gap-4 text-sm">
              {/* Sound Settings Group */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted/40 border border-border/30 rounded-xl">
                      {keyboardSoundEnabled ? (
                        <Volume2 className="h-4 w-4 text-primary" />
                      ) : (
                        <VolumeX className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Sound Effects</p>
                      <p className="text-xs text-muted-foreground">Play typing sounds as you write</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onToggleSound(!keyboardSoundEnabled)}
                    className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                      keyboardSoundEnabled ? "bg-primary" : "bg-muted-foreground/30"
                    } relative`}
                    aria-label="Toggle sound effects"
                  >
                    <div
                      className={`w-4.5 h-4.5 rounded-full bg-background shadow-md transform transition-transform duration-200 ${
                        keyboardSoundEnabled ? "translate-x-5.5" : "translate-x-0"
                      } flex items-center justify-center`}
                    >
                      {keyboardSoundEnabled && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </div>
                  </button>
                </div>

                {keyboardSoundEnabled && (
                  <div className="flex flex-col gap-2 pl-11 pb-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-[10px] tracking-wider font-semibold text-muted-foreground uppercase">
                      Sound Style
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "default", name: "Typewriter" },
                        { id: "mechanical", name: "Mechanical" },
                        { id: "digital", name: "Digital Click" },
                        { id: "bubble", name: "Bubble Pop" },
                      ].map((type) => {
                        const isActive = keyboardSoundType === type.id;
                        return (
                          <button
                            key={type.id}
                            onClick={() => onSelectSoundType(type.id)}
                            className={`px-3 py-2 text-xs rounded-xl font-medium cursor-pointer transition-all duration-200 flex items-center justify-between border ${
                              isActive
                                ? "bg-primary/10 border-primary text-primary shadow-xs"
                                : "bg-muted/30 border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted/65 hover:border-border"
                            }`}
                          >
                            <span>{type.name}</span>
                            {isActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Navbar Pin Toggle */}
              <div className="flex items-center justify-between border-t border-border/40 pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted/40 border border-border/30 rounded-xl">
                    <Pin className={`h-4 w-4 ${isNavbarPinned ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Pin Actions Sidebar</p>
                    <p className="text-xs text-muted-foreground">Keep side menu visible at all times</p>
                  </div>
                </div>
                <button
                  onClick={onToggleNavbarPin}
                  className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                    isNavbarPinned ? "bg-primary" : "bg-muted-foreground/30"
                  } relative`}
                  aria-label="Toggle pinned sidebar"
                >
                  <div
                    className={`w-4.5 h-4.5 rounded-full bg-background shadow-md transform transition-transform duration-200 ${
                      isNavbarPinned ? "translate-x-5.5" : "translate-x-0"
                    } flex items-center justify-center`}
                  >
                    {isNavbarPinned && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  </div>
                </button>
              </div>

              {/* Fullscreen Toggle */}
              <div className="flex items-center justify-between border-t border-border/40 pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted/40 border border-border/30 rounded-xl">
                    {isFullscreen ? (
                      <Minimize2 className="h-4 w-4 text-primary" />
                    ) : (
                      <Maximize2 className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Fullscreen Mode</p>
                    <p className="text-xs text-muted-foreground">Maximize editor window size</p>
                  </div>
                </div>
                <button
                  onClick={toggleFullscreen}
                  className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                    isFullscreen ? "bg-primary" : "bg-muted-foreground/30"
                  } relative`}
                  aria-label="Toggle fullscreen mode"
                >
                  <div
                    className={`w-4.5 h-4.5 rounded-full bg-background shadow-md transform transition-transform duration-200 ${
                      isFullscreen ? "translate-x-5.5" : "translate-x-0"
                    } flex items-center justify-center`}
                  >
                    {isFullscreen && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Keyboard Shortcuts */}
          <div className="border border-border/40 bg-card/40 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs tracking-wider font-semibold text-muted-foreground uppercase">
              <Keyboard className="h-4 w-4 text-primary" />
              Keyboard Shortcuts
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-xs text-foreground pt-1">
              <div className="flex items-center justify-between border-b border-border/30 pb-2">
                <span className="text-muted-foreground">Cycle theme</span>
                <kbd className="px-2 py-0.5 rounded bg-muted border border-border font-mono text-[10px] text-primary font-semibold shadow-xs">
                  D
                </kbd>
              </div>
              <div className="flex items-center justify-between border-b border-border/30 pb-2">
                <span className="text-muted-foreground">Toggle settings</span>
                <kbd className="px-2 py-0.5 rounded bg-muted border border-border font-mono text-[10px] text-primary font-semibold shadow-xs">
                  S
                </kbd>
              </div>
              <div className="flex items-center justify-between border-b border-border/30 pb-2">
                <span className="text-muted-foreground">Pin sidebar</span>
                <kbd className="px-2 py-0.5 rounded bg-muted border border-border font-mono text-[10px] text-primary font-semibold shadow-xs">
                  P
                </kbd>
              </div>
              <div className="flex items-center justify-between border-b border-border/30 pb-2">
                <span className="text-muted-foreground">Fullscreen mode</span>
                <kbd className="px-2 py-0.5 rounded bg-muted border border-border font-mono text-[10px] text-primary font-semibold shadow-xs">
                  F
                </kbd>
              </div>
              <div className="flex items-center justify-between border-b border-border/30 pb-2">
                <span className="text-muted-foreground">Close settings</span>
                <kbd className="px-2 py-0.5 rounded bg-muted border border-border font-mono text-[10px] text-primary font-semibold shadow-xs">
                  Esc
                </kbd>
              </div>
              <div className="flex items-center justify-between border-b border-border/30 pb-2">
                <span className="text-muted-foreground">Draft auto-save</span>
                <span className="text-[10px] font-medium text-primary uppercase tracking-wide">
                  Auto
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
