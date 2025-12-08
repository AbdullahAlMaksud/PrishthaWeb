import React, { useState, useEffect } from "react";
import {
  listSimpleFiles,
  listRichFiles,
  deleteSimpleFile,
  deleteRichFile,
  SavedFile,
} from "@/utils/localStorage";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, Plus, PenTool } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from "date-fns";

interface FileSidebarProps {
  onSelectFile: (id: string, type: "simple" | "rich") => void;
  onNewFile: (type: "simple" | "rich") => void;
  isOpen: boolean;
  currentFileId: string | null;
}

export const FileSidebar: React.FC<FileSidebarProps> = ({
  onSelectFile,
  onNewFile,
  isOpen,
  currentFileId,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [simpleFiles, setSimpleFiles] = useState<SavedFile<any>[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [richFiles, setRichFiles] = useState<SavedFile<any>[]>([]);
  const [activeTab, setActiveTab] = useState<"simple" | "rich">("simple");

  const refreshFiles = () => {
    if (typeof window !== "undefined") {
      setSimpleFiles(listSimpleFiles());
      setRichFiles(listRichFiles());
    }
  };

  useEffect(() => {
    refreshFiles();
    // Set up an interval or listener to refresh files if needed, 
    // but for now, we rely on parent causing re-renders or manual refresh if we want.
    // Ideally, we'd have a custom event or context. 
    // Let's just refresh every time sidebar opens or activeTab changes.
    const interval = setInterval(refreshFiles, 2000); // Polling for changes
    return () => clearInterval(interval);
  }, []);

  const handleDelete = (id: string, type: "simple" | "rich") => {
    if (type === "simple") {
      deleteSimpleFile(id);
      setSimpleFiles((prev) => prev.filter((f) => f.id !== id));
    } else {
      deleteRichFile(id);
      setRichFiles((prev) => prev.filter((f) => f.id !== id));
    }
    // If deleted file was active, might need to handle that in parent, but this is fine for now
  };

  const renderFileList = (files: SavedFile<unknown>[], type: "simple" | "rich") => (
    <div className="space-y-2 p-4">
      <Button
        className="w-full justify-start gap-2 mb-4"
        onClick={() => onNewFile(type)}
        variant="outline"
      >
        <Plus className="h-4 w-4" />
        New {type === "simple" ? "Plain" : "Rich"} Document
      </Button>

      {files.length === 0 ? (
        <div className="text-center text-muted-foreground py-8 text-sm">
          No saved files.
        </div>
      ) : (
        files.map((file) => (
          <div
            key={file.id}
            className={`group flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors ${
              currentFileId === file.id ? "bg-muted border-primary/50" : ""
            }`}
          >
            <button
              className="flex-1 flex flex-col items-start gap-1 min-w-0"
              onClick={() => onSelectFile(file.id, type)}
            >
              <div className="font-medium truncate w-full text-left">
                {file.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(file.updatedAt, { addSuffix: true })}
              </div>
            </button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete File?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete "{file.name}". This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(file.id, type)}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">Saved Files</h2>
      </div>
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "simple" | "rich")}
        className="flex-1 flex flex-col min-h-0"
      >
        <div className="px-4 pt-4">
          <TabsList className="w-full">
            <TabsTrigger value="simple" className="flex-1">
              <PenTool className="h-4 w-4 mr-2" />
              Simple
            </TabsTrigger>
            <TabsTrigger value="rich" className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              Rich
            </TabsTrigger>
          </TabsList>
        </div>
        
        <ScrollArea className="flex-1">
          <TabsContent value="simple" className="m-0 min-h-0">
            {renderFileList(simpleFiles, "simple")}
          </TabsContent>
          <TabsContent value="rich" className="m-0 min-h-0">
            {renderFileList(richFiles, "rich")}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};
