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
  Palette,
  PenTool,
  Sparkles,
  Pin,
  Settings,
} from "lucide-react";
import { ParentNavigator } from "./parent-navigator";

export interface INavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSheetOpen: boolean;
  setIsSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
  theme: string;
  toggleTheme: () => void;
  onNewFile: (type: "simple" | "rich") => void;
  onSave?: () => void;
  onDownloadTxt?: () => void;
  onDownloadPdf?: () => void;
  onPrint?: () => void;
  onTogglePreview?: () => void;
  showPreview?: boolean;
  isNavbarPinned: boolean;
  onToggleNavbarPin: () => void;
  onOpenSettings?: () => void;
}

export const Navbar: React.FC<INavbarProps> = ({
  activeTab,
  setActiveTab,
  isSheetOpen,
  setIsSheetOpen,
  theme,
  toggleTheme,
  onNewFile,
  onSave,
  onDownloadTxt,
  onDownloadPdf,
  onPrint,
  onTogglePreview,
  showPreview = false,
  isNavbarPinned,
  onToggleNavbarPin,
  onOpenSettings,
}) => {
  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center justify-end w-20 md:w-24 h-[530px] bg-transparent pr-4 group pointer-events-auto">
      <nav
        className={`flex flex-col items-center gap-2 md:gap-3 bg-background/80 backdrop-blur-md border border-border/40 px-2 py-4 rounded-3xl w-fit transition-all duration-300 ease-in-out shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.22)] dark:group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.65)] ${isNavbarPinned
          ? "translate-x-0 opacity-100"
          : "translate-x-[calc(100%+2px)] opacity-40 group-hover:translate-x-0 group-hover:opacity-100"
          }`}
      >
        {/* Collapse Handle Visual Cue */}
        {!isNavbarPinned && (
          <div className="absolute left-1 top-1/2 -translate-y-1/2 w-0.5 h-10 rounded-full bg-muted-foreground/30 opacity-70 group-hover:opacity-0 transition-opacity duration-200" />
        )}


        <ParentNavigator variant="plain" size={28} className="rounded-md p-0.5" />
        {/* File Drawer Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSheetOpen((prev) => !prev)}
              className={`h-9 w-9 rounded-full cursor-pointer hover:bg-muted ${isSheetOpen ? "bg-muted text-primary" : "text-muted-foreground"
                }`}
              aria-label="Open files list"
            >
              <FolderOpen className="h-4.5 w-4.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">My Files</TooltipContent>
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
          <TooltipContent side="left">New Document</TooltipContent>
        </Tooltip>

        <div className="w-5 h-px bg-border/60 my-1" />

        {/* Segmented Editor Mode Toggles */}
        <div className="flex flex-col items-center bg-muted p-1 rounded-2xl gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("simple")}
                className={`h-8 w-8 p-0 rounded-xl cursor-pointer text-xs font-semibold flex items-center justify-center transition-all duration-200 ${activeTab === "simple"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
                aria-label="Plain editor"
              >
                <PenTool className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Plain Editor</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("rich")}
                className={`h-8 w-8 p-0 rounded-xl cursor-pointer text-xs font-semibold flex items-center justify-center transition-all duration-200 ${activeTab === "rich"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
                aria-label="Rich editor"
              >
                <Sparkles className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Rich Editor</TooltipContent>
          </Tooltip>
        </div>

        <div className="w-5 h-px bg-border/60 my-1" />

        {/* Actions Section */}
        <div className="flex flex-col items-center gap-1">

          {/* Live Preview Toggle (Rich Text Editor Only) */}
          {activeTab === "rich" && onTogglePreview && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onTogglePreview}
                  className={`h-9 w-9 rounded-full cursor-pointer hover:bg-muted ${showPreview ? "text-primary bg-muted" : "text-muted-foreground hover:text-foreground"
                    }`}
                  aria-label="Toggle live preview"
                >
                  {showPreview ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                {showPreview ? "Hide Preview" : "Show Preview"}
              </TooltipContent>
            </Tooltip>
          )}

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
            <TooltipContent side="left">Save Document</TooltipContent>
          </Tooltip>



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
              <TooltipContent side="left">Export Document</TooltipContent>
            </Tooltip>

            <DropdownMenuContent align="end" side="left" className="w-48 mr-2">
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

              {onDownloadPdf && (
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





          <div className="w-5 h-px bg-border/60 my-1" />
          {/* Settings Button */}
          {onOpenSettings && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onOpenSettings}
                  className="h-9 w-9 rounded-full cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted"
                  aria-label="Settings"
                >
                  <Settings className="h-4.5 w-4.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Settings (s)</TooltipContent>
            </Tooltip>
          )}


          {/* Pin/Unpin Button at the very bottom */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleNavbarPin}
                className={`h-9 w-9 rounded-full cursor-pointer hover:bg-muted ${isNavbarPinned ? "text-primary bg-muted" : "text-muted-foreground"
                  }`}
                aria-label={isNavbarPinned ? "Unpin navbar" : "Pin navbar"}
              >
                <Pin className={`h-4.5 w-4.5 transform transition-transform duration-200 ${isNavbarPinned ? "fill-primary rotate-45" : ""}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              {isNavbarPinned ? "Unpin (Auto-hide)" : "Pin Navbar"}
            </TooltipContent>
          </Tooltip>
        </div>
      </nav>
    </div>
  );

};
