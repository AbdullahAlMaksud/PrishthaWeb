"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { SimpleTextEditor } from "@/components/SimpleTextEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  Moon,
  Pen,
  PencilRuler,
  Sun,
} from "lucide-react";

const SlateRichTextEditor = dynamic(
  () =>
    import("@/components/SlateRichTextEditor").then((mod) => ({
      default: mod.SlateRichTextEditor,
    })),
  { ssr: false }
);

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as "light" | "dark";
      if (savedTheme) {
        document.documentElement.classList.toggle(
          "dark",
          savedTheme === "dark"
        );
        return savedTheme;
      }
    }
    return "light";
  });

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  // UI state: right-side tab icon panel and the menu sheet
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("simple");

  return (
    <div className="h-screen flex flex-col bg-linear-to-br from-background to-muted">
      <main className="flex-1 overflow-hidden">
        <Tabs
          defaultValue="simple"
          className="h-full relative"
          onValueChange={setActiveTab}
        >
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
                className="h-9 w-9 rounded-lg hover:bg-white/10 dark:hover:bg-black/10 transition-colors shrink-0"
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
                      className={`h-9 w-9 rounded-lg hover:bg-white/10 dark:hover:bg-black/10 transition-colors relative flex flex-col items-center justify-center gap-0.5 border-b-4 ${
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
                      className={`h-9 w-9 rounded-lg hover:bg-white/10 dark:hover:bg-black/10 transition-colors relative flex flex-col items-center justify-center gap-0.5 border-b-4 ${
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
                      className="h-9 w-9 rounded-lg hover:bg-white/10 dark:hover:bg-black/10 transition-colors"
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
                  className="h-9 w-9 rounded-lg hover:bg-white/10 dark:hover:bg-black/10 transition-colors"
                  onClick={() => setIsSheetOpen(true)}
                  aria-expanded={isSheetOpen}
                  aria-label="Open menu"
                >
                  <Menu className="h-4 w-4 text-white dark:text-black" />
                </Button>
              </div>
            </section>
          </TabsList>

          <TabsContent value="simple" className="h-full w-full">
            <SimpleTextEditor />
          </TabsContent>

          <TabsContent value="rich" className="h-full">
            <SlateRichTextEditor />
          </TabsContent>
        </Tabs>
      </main>

      {/* Right side sheet / drawer (opens from the right) */}
      {/* Overlay */}
      <div
        aria-hidden={!isSheetOpen}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-200 ${
          isSheetOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsSheetOpen(false)}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal={isSheetOpen}
        className={`fixed top-0 right-0 h-full z-50 bg-background shadow-2xl transform transition-transform duration-300 ${
          isSheetOpen ? "translate-x-0" : "translate-x-full"
        } w-72 md:w-96 border-l`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="font-semibold">Menu</div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSheetOpen(false)}
            aria-label="Close menu"
          >
            <ChevronLeft className="rotate-180 h-4 w-4" />
          </Button>
        </div>
        <div className="p-4 overflow-y-auto h-full">
          {/* Add your sheet content here */}
          <p className="text-sm text-muted-foreground">
            This is a slide-over menu. Add settings, quick actions or links
            here.
          </p>
        </div>
      </aside>

      {/* Footer */}
      <footer className="border-t bg-background/95 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Abdullah Al Maksud. All rights
          reserved.
        </div>
      </footer>
    </div>
  );
}
