"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  FolderOpen,
  FilePlus,
  Save,
  Download,
  Printer,
  FileText,
  FileDown,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  PenTool,
  Sparkles,
} from "lucide-react";

export interface INavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSheetOpen: boolean;
  setIsSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
  theme: "light" | "dark";
  toggleTheme: () => void;
  keyboardSoundEnabled: boolean;
  setKeyboardSoundEnabled: (enabled: boolean) => void;
  onNewFile: (type: "simple" | "rich") => void;
  onSave?: () => void;
  onDownloadTxt?: () => void;
  onDownloadPdf?: () => void;
  onPrint?: () => void;
  onTogglePreview?: () => void;
  showPreview?: boolean;
}

export const Navbar: React.FC<INavbarProps> = ({
  activeTab,
  setActiveTab,
  isSheetOpen,
  setIsSheetOpen,
  theme,
  toggleTheme,
  keyboardSoundEnabled,
  setKeyboardSoundEnabled,
  onNewFile,
  onSave,
  onDownloadTxt,
  onDownloadPdf,
  onPrint,
  onTogglePreview,
  showPreview = false,
}) => {
  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 md:gap-3 bg-background/80 backdrop-blur-md border border-border/40 shadow-xl px-4 py-2 rounded-full w-fit max-w-[95vw] transition-all duration-300">
      
      {/* File Drawer Toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSheetOpen((prev) => !prev)}
            className={`h-9 w-9 rounded-full cursor-pointer hover:bg-muted ${
              isSheetOpen ? "bg-muted text-primary" : "text-muted-foreground"
            }`}
            aria-label="Open files list"
          >
            <FolderOpen className="h-4.5 w-4.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>My Files</TooltipContent>
      </Tooltip>

      {/* New File Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNewFile(activeTab as "simple" | "rich")}
            className="h-9 w-9 rounded-full cursor-pointer hover:bg-muted text-muted-foreground"
            aria-label="Create new document"
          >
            <FilePlus className="h-4.5 w-4.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>New Document</TooltipContent>
      </Tooltip>

      <div className="h-5 w-px bg-border/60 mx-1" />

      {/* Segmented Editor Mode Toggles */}
      <div className="flex items-center bg-muted/60 p-0.5 rounded-full">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveTab("simple")}
          className={`h-8 px-3 rounded-full cursor-pointer text-xs font-semibold gap-1.5 transition-all duration-200 ${
            activeTab === "simple"
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <PenTool className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Plain</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveTab("rich")}
          className={`h-8 px-3 rounded-full cursor-pointer text-xs font-semibold gap-1.5 transition-all duration-200 ${
            activeTab === "rich"
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Rich</span>
        </Button>
      </div>

      <div className="h-5 w-px bg-border/60 mx-1" />

      {/* Actions Section */}
      <div className="flex items-center gap-1">
        {/* Save Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onSave}
              className="h-9 w-9 rounded-full cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted"
              aria-label="Save document"
            >
              <Save className="h-4.5 w-4.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Save Document</TooltipContent>
        </Tooltip>

        {/* Live Preview Toggle (Rich Text Editor Only) */}
        {activeTab === "rich" && onTogglePreview && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onTogglePreview}
                className={`h-9 w-9 rounded-full cursor-pointer hover:bg-muted ${
                  showPreview ? "text-primary bg-muted" : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="Toggle live preview"
              >
                {showPreview ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {showPreview ? "Hide Preview" : "Show Preview"}
            </TooltipContent>
          </Tooltip>
        )}

        {/* Export / Download Options */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted"
                  aria-label="Export options"
                >
                  <Download className="h-4.5 w-4.5" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Export Document</TooltipContent>
          </Tooltip>

          <DropdownMenuContent align="center" className="w-48 mt-2">
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              Export Options
            </div>
            <DropdownMenuSeparator />
            
            {onDownloadTxt && (
              <DropdownMenuItem onClick={onDownloadTxt} className="cursor-pointer">
                <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                Export as TXT (.txt)
              </DropdownMenuItem>
            )}

            {activeTab === "rich" && onDownloadPdf && (
              <DropdownMenuItem onClick={onDownloadPdf} className="cursor-pointer">
                <FileDown className="h-4 w-4 mr-2 text-muted-foreground" />
                Export as PDF (.pdf)
              </DropdownMenuItem>
            )}

            {activeTab === "simple" && onPrint && (
              <DropdownMenuItem onClick={onPrint} className="cursor-pointer">
                <Printer className="h-4 w-4 mr-2 text-muted-foreground" />
                Print Document
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-5 w-px bg-border/60 mx-1" />

        {/* Sound Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setKeyboardSoundEnabled(!keyboardSoundEnabled)}
              className="h-9 w-9 rounded-full cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted"
              aria-label="Toggle keyboard sound"
            >
              {keyboardSoundEnabled ? (
                <Volume2 className="h-4.5 w-4.5" />
              ) : (
                <VolumeX className="h-4.5 w-4.5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Keyboard Sound: {keyboardSoundEnabled ? "On" : "Off"}
          </TooltipContent>
        </Tooltip>

        {/* Theme Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 rounded-full cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted"
              aria-label="Toggle dark mode"
            >
              {theme === "light" ? (
                <Moon className="h-4.5 w-4.5" />
              ) : (
                <Sun className="h-4.5 w-4.5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Switch to {theme === "light" ? "Dark" : "Light"} Mode
          </TooltipContent>
        </Tooltip>
      </div>
    </nav>
  );
};
