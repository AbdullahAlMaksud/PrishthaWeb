import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  ChevronRight,
  Menu,
  Moon,
  Pen,
  PencilRuler,
  Sun,
} from "lucide-react";

export interface INavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isPanelOpen: boolean;
  setIsPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSheetOpen: boolean;
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export const Navbar: React.FC<INavbarProps> = ({
  activeTab,
  setActiveTab,
  isPanelOpen,
  setIsPanelOpen,
  setIsSheetOpen,
  isSheetOpen,
  theme,
  toggleTheme,
}) => {
  return (
    <TabsList className="flex items-center absolute w-fit top-6 right-4 bg-transparent z-10">
      <section
        className={`bg-black dark:bg-white px-1 py-1 rounded-xl flex items-center gap-1 *:cursor-pointer transition-all duration-500 ease-in-out ${
          isPanelOpen ? "w-auto opacity-100" : "w-11 opacity-100"
        }`}
      >
        {/* Toggle panel visibility - chevron always visible */}
        <Button
          aria-label={isPanelOpen ? "Hide panel" : "Show panel"}
          onClick={() => setIsPanelOpen((v) => !v)}
          size="icon"
          variant="ghost"
          className="h-9 w-9 rounded-lg hover:bg-white/10 dark:hover:bg-black/10 transition-colors shrink-0 cursor-pointer"
        >
          <ChevronRight
            className={`h-4 w-4 text-white dark:text-black transition-transform duration-300 ease-in-out ${
              isPanelOpen ? "rotate-0" : "rotate-180"
            }`}
          />
        </Button>

        {/* Animated container for icons */}
        <div
          className={`flex items-center gap-1 transition-all duration-300 ease-in-out ${
            isPanelOpen
              ? "opacity-100 max-w-[500px] overflow-visible"
              : "opacity-0 max-w-0 overflow-hidden pointer-events-none"
          }`}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger
                value="simple"
                onClick={() => setActiveTab("simple")}
                className={`h-9 w-9 rounded-lg hover:bg-white/10 dark:hover:bg-black/10 transition-colors relative flex flex-col items-center justify-center gap-0.5 border-b-4 cursor-pointer ${
                  activeTab === "simple"
                    ? "border-gray-500"
                    : "border-transparent"
                }`}
              >
                <Pen
                  className={`${
                    activeTab === "simple"
                      ? "text-slate-100 dark:text-slate-800"
                      : "text-white dark:text-black"
                  } h-4 w-4`}
                />
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent>Simple Editor</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger
                value="rich"
                onClick={() => setActiveTab("rich")}
                className={`h-9 w-9 rounded-lg hover:bg-white/10 dark:hover:bg-black/10 transition-colors relative flex flex-col items-center justify-center gap-0.5 border-b-4 cursor-pointer ${
                  activeTab === "rich"
                    ? "border-gray-500"
                    : "border-transparent"
                }`}
              >
                <PencilRuler
                  className={`${
                    activeTab === "rich"
                      ? "text-slate-100 dark:text-slate-800"
                      : "text-white dark:text-black"
                  } h-4 w-4`}
                />
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent>Rich Editor</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-9 w-9 rounded-lg hover:bg-white/10 dark:hover:bg-black/10 transition-colors cursor-pointer"
                aria-label="Toggle theme"
              >
                {theme === "light" ? (
                  <Moon className="h-4 w-4 text-white dark:text-black" />
                ) : (
                  <Sun className="h-4 w-4 text-white dark:text-black" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Switch to {theme === "light" ? "dark" : "light"} theme
            </TooltipContent>
          </Tooltip>

          {/* Menu button opens a right-side sheet */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg hover:bg-white/10 dark:hover:bg-black/10 transition-colors cursor-pointer"
            onClick={() => setIsSheetOpen(true)}
            aria-expanded={isSheetOpen}
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4 text-white dark:text-black" />
          </Button>
        </div>
      </section>
    </TabsList>
  );
};
