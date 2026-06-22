import React, { useState, useEffect } from "react";
import {
  listSimpleFiles,
  listRichFiles,
  deleteSimpleFile,
  deleteRichFile,
  renameSimpleFile,
  renameRichFile,
  SavedFile,
} from "@/shared/lib/local-storage";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, Plus, PenTool, Pencil } from "lucide-react";
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

export interface IFileSidebarProps {
  onSelectFile: (id: string, type: "simple" | "rich") => void;
  onNewFile: (type: "simple" | "rich") => void;
  isOpen: boolean;
  currentFileId: string | null;
}

export const FileSidebar: React.FC<IFileSidebarProps> = ({
  onSelectFile,
  onNewFile,
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
    const interval = setInterval(refreshFiles, 2000);
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
  };

  const handleRename = (id: string, currentName: string, type: "simple" | "rich") => {
    const newName = prompt("Rename document:", currentName);
    if (newName && newName.trim()) {
      if (type === "simple") {
        renameSimpleFile(id, newName.trim());
      } else {
        renameRichFile(id, newName.trim());
      }
      refreshFiles();
    }
  };

  const renderFileList = (files: SavedFile<unknown>[], type: "simple" | "rich") => (
    <div className="space-y-2 p-4">
      <Button
        className="w-full justify-start gap-2 mb-4 cursor-pointer"
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
              className="flex-1 flex flex-col items-start gap-1 min-w-0 cursor-pointer"
              onClick={() => onSelectFile(file.id, type)}
            >
              <div className="font-medium truncate w-full text-left">
                {file.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(file.updatedAt, { addSuffix: true })}
              </div>
            </button>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRename(file.id, file.name, type);
                }}
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                aria-label="Rename file"
              >
                <Pencil className="h-4 w-4" />
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                    aria-label="Delete file"
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
                    <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(file.id, type)}
                      className="bg-destructive hover:bg-destructive/90 cursor-pointer"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
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
            <TabsTrigger value="simple" className="flex-1 cursor-pointer">
              <PenTool className="h-4 w-4 mr-2" />
              Simple
            </TabsTrigger>
            <TabsTrigger value="rich" className="flex-1 cursor-pointer">
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
