"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  DecoratorNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  DOMExportOutput,
  LexicalEditor,
  DOMConversionMap,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Trash2,
  Youtube,
  Twitter,
  StickyNote,
  BarChart3,
  Calculator,
  Palette,
  Image as ImageIcon,
  FileImage,
  Calendar,
  ChevronDown,
  ChevronRight,
  Eye,
  Edit2,
  Table as TableIcon,
  Columns as ColumnsIcon,
  Hash,
  Scissors,
} from "lucide-react";

export type SerializedCustomBlockNode = Spread<
  {
    blockType: string;
    blockData: any;
  },
  SerializedLexicalNode
>;

export class CustomBlockNode extends DecoratorNode<React.JSX.Element> {
  __blockType: string;
  __blockData: any;

  static getType(): string {
    return "custom-block";
  }

  static clone(node: CustomBlockNode): CustomBlockNode {
    return new CustomBlockNode(node.__blockType, node.__blockData, node.__key);
  }

  constructor(blockType: string, blockData: any, key?: NodeKey) {
    super(key);
    this.__blockType = blockType;
    this.__blockData = blockData;
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.style.display = "block";
    div.style.margin = "1.5rem 0";
    div.className = "custom-block-wrapper";
    return div;
  }

  updateDOM(): boolean {
    return false;
  }

  setBlockData(blockData: any): void {
    const writable = this.getWritable();
    writable.__blockData = blockData;
  }

  decorate(): React.JSX.Element {
    return (
      <CustomBlockComponent
        blockType={this.__blockType}
        blockData={this.__blockData}
        nodeKey={this.getKey()}
      />
    );
  }

  static importJSON(serializedNode: SerializedCustomBlockNode): CustomBlockNode {
    return $createCustomBlockNode(serializedNode.blockType, serializedNode.blockData);
  }

  exportJSON(): SerializedCustomBlockNode {
    return {
      type: "custom-block",
      version: 1,
      blockType: this.__blockType,
      blockData: this.__blockData,
    };
  }

  static importDOM(): DOMConversionMap | null {
    return null;
  }

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const div = document.createElement("div");
    div.style.margin = "1.5rem 0";
    div.style.padding = "1rem";
    div.style.border = "1px solid #e2e8f0";
    div.style.borderRadius = "0.75rem";
    div.style.backgroundColor = "#f8fafc";
    div.style.fontFamily = "sans-serif";
    
    if (this.__blockType === "youtube") {
      div.innerText = `[YouTube Video: ${this.__blockData.url || "No URL"}]`;
    } else if (this.__blockType === "figma") {
      div.innerText = `[Figma Embed: ${this.__blockData.url || "No URL"}]`;
    } else if (this.__blockType === "tweet") {
      div.innerText = `[X/Tweet: "${this.__blockData.text || ""}" by ${this.__blockData.name || ""} (${this.__blockData.handle || ""})]`;
    } else if (this.__blockType === "sticky") {
      div.innerText = `[Sticky Note: "${this.__blockData.text || ""}"]`;
    } else if (this.__blockType === "poll") {
      const opts = this.__blockData.options?.map((o: any) => `- ${o.text}: ${o.votes} votes`).join("\n") || "";
      div.innerText = `[Poll: "${this.__blockData.question || ""}"]\n${opts}`;
    } else if (this.__blockType === "equation") {
      div.innerText = `[Equation: ${this.__blockData.equation || ""}]`;
    } else if (this.__blockType === "excalidraw") {
      if (this.__blockData.image) {
        const img = document.createElement("img");
        img.src = this.__blockData.image;
        img.style.maxWidth = "100%";
        div.appendChild(img);
      } else {
        div.innerText = `[Empty Whiteboard Sketch]`;
      }
    } else if (this.__blockType === "image") {
      const img = document.createElement("img");
      img.src = this.__blockData.url;
      img.style.maxWidth = "100%";
      div.appendChild(img);
      if (this.__blockData.caption) {
        const figcap = document.createElement("p");
        figcap.innerText = this.__blockData.caption;
        figcap.style.fontSize = "0.8em";
        figcap.style.fontStyle = "italic";
        div.appendChild(figcap);
      }
    } else if (this.__blockType === "gif") {
      const img = document.createElement("img");
      img.src = this.__blockData.url;
      img.style.maxWidth = "100%";
      div.appendChild(img);
    } else if (this.__blockType === "pagebreak") {
      const hr = document.createElement("hr");
      hr.style.border = "none";
      hr.style.borderTop = "2px dashed #94a3b8";
      hr.style.margin = "2rem 0";
      div.appendChild(hr);
    } else if (this.__blockType === "collapsible") {
      div.innerText = `[Accordion: ${this.__blockData.header || ""}]\n${this.__blockData.content || ""}`;
    } else if (this.__blockType === "date") {
      div.innerText = `[Date: ${this.__blockData.date || ""}]`;
    } else if (this.__blockType === "table") {
      const table = document.createElement("table");
      table.style.width = "100%";
      table.style.borderCollapse = "collapse";
      const rows = this.__blockData.rows || 3;
      const cols = this.__blockData.cols || 3;
      const cells = this.__blockData.cells || [];
      for (let r = 0; r < rows; r++) {
        const tr = document.createElement("tr");
        for (let c = 0; c < cols; c++) {
          const td = document.createElement("td");
          td.style.border = "1px solid #cbd5e1";
          td.style.padding = "6px";
          td.innerText = cells[r]?.[c] || "";
          tr.appendChild(td);
        }
        table.appendChild(tr);
      }
      div.appendChild(table);
    } else if (this.__blockType === "columns") {
      div.innerText = `[Columns Layout]\nLeft: ${this.__blockData.left || ""}\nRight: ${this.__blockData.right || ""}`;
    }
    
    return { element: div };
  }
}

export function $createCustomBlockNode(blockType: string, blockData: any): CustomBlockNode {
  return new CustomBlockNode(blockType, blockData);
}

export function $isCustomBlockNode(node: any): node is CustomBlockNode {
  return node instanceof CustomBlockNode;
}

// -------------------------------------------------------------
// REACT RENDERER COMPONENT
// -------------------------------------------------------------
interface CustomBlockComponentProps {
  blockType: string;
  blockData: any;
  nodeKey: NodeKey;
}

const CustomBlockComponent: React.FC<CustomBlockComponentProps> = ({
  blockType,
  blockData,
  nodeKey,
}) => {
  const [editor] = useLexicalComposerContext();
  const [isEditing, setIsEditing] = useState(!blockData || Object.keys(blockData).length === 0 || blockData.empty);
  
  // Sketchpad drawing ref & states
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeColor, setStrokeColor] = useState("#e63946");
  const [brushSize, setBrushSize] = useState(4);
  const isSketchpad = blockType === "excalidraw";

  // Rerender/initialize canvas drawing if sketchpad
  useEffect(() => {
    if (isSketchpad && canvasRef.current && blockData.image) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
        };
        img.src = blockData.image;
      }
    }
  }, [isSketchpad, blockData.image, isEditing]);

  const updateNodeData = useCallback((newData: any) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isCustomBlockNode(node)) {
        node.setBlockData(newData);
      }
    });
  }, [editor, nodeKey]);

  const handleDelete = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node) {
        node.remove();
      }
    });
  };

  // Helper title for block header UI
  const getBlockHeaderInfo = () => {
    switch (blockType) {
      case "youtube": return { label: "YouTube Embed", icon: Youtube, color: "text-red-500" };
      case "figma": return { label: "Figma File Preview", icon: ImageIcon, color: "text-blue-500" };
      case "tweet": return { label: "X (Tweet) Card", icon: Twitter, color: "text-sky-500" };
      case "sticky": return { label: "Sticky Note", icon: StickyNote, color: "text-amber-500" };
      case "poll": return { label: "Interactive Poll", icon: BarChart3, color: "text-emerald-500" };
      case "equation": return { label: "LaTeX Formula Editor", icon: Calculator, color: "text-purple-500" };
      case "excalidraw": return { label: "Whiteboard Sketchpad", icon: Palette, color: "text-pink-500" };
      case "image": return { label: "Responsive Image Card", icon: ImageIcon, color: "text-indigo-500" };
      case "gif": return { label: "Animated GIF Embed", icon: FileImage, color: "text-violet-500" };
      case "pagebreak": return { label: "Document Page Break", icon: Scissors, color: "text-rose-500" };
      case "collapsible": return { label: "Collapsible Accordion", icon: ChevronDown, color: "text-cyan-500" };
      case "date": return { label: "Calendar Date Stamp", icon: Calendar, color: "text-teal-500" };
      case "table": return { label: "Custom Grid Table", icon: TableIcon, color: "text-orange-500" };
      case "columns": return { label: "Multi-Column Layout", icon: ColumnsIcon, color: "text-blue-600" };
      default: return { label: "Custom Embed Block", icon: Hash, color: "text-muted-foreground" };
    }
  };

  const headerInfo = getBlockHeaderInfo();
  const HeaderIcon = headerInfo.icon;

  // Render wrapper helper
  const renderCardWrapper = (children: React.ReactNode) => {
    if (blockType === "pagebreak") {
      return (
        <div className="relative my-10 flex items-center justify-center select-none group border-t-2 border-dashed border-primary/40 py-2">
          <span className="bg-background text-primary px-3 text-xs tracking-widest uppercase font-bold border border-primary/40 rounded-full flex items-center gap-1.5 shadow-sm">
            <Scissors className="h-3 w-3" /> Page Break for PDF Export
          </span>
          <button
            type="button"
            onClick={handleDelete}
            className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground p-1 rounded-md text-xs cursor-pointer border border-destructive/20"
            aria-label="Delete page break"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      );
    }

    return (
      <div className="group relative w-full max-w-2xl mx-auto my-6 border border-border/40 rounded-2xl bg-card text-card-foreground shadow-sm hover:shadow-md hover:border-primary/30 transition-all overflow-hidden p-5 select-none">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between pb-3 border-b mb-4 text-xs font-semibold text-muted-foreground">
          <div className="flex items-center gap-2">
            <HeaderIcon className={`h-4 w-4 ${headerInfo.color}`} />
            <span>{headerInfo.label}</span>
          </div>
          <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
            {blockType !== "pagebreak" && blockType !== "sticky" && blockType !== "excalidraw" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-md cursor-pointer"
                onClick={() => setIsEditing(!isEditing)}
                aria-label="Toggle editing view"
              >
                {isEditing ? <Eye className="h-3.5 w-3.5" /> : <Edit2 className="h-3.5 w-3.5" />}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
              onClick={handleDelete}
              aria-label="Delete block"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Inner Content */}
        <div className="w-full relative min-h-[50px]">{children}</div>
      </div>
    );
  };

  // -------------------------------------------------------------
  // BLOCK SPECIFIC RENDER CODE
  // -------------------------------------------------------------

  // 1. YouTube Embed
  if (blockType === "youtube") {
    if (isEditing) {
      return renderCardWrapper(
        <div className="space-y-3">
          <label className="text-xs font-medium block">YouTube Video URL</label>
          <div className="flex gap-2">
            <Input
              placeholder="https://www.youtube.com/watch?v=..."
              defaultValue={blockData.url || ""}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const url = (e.target as HTMLInputElement).value;
                  // extract video id
                  let id = "";
                  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/);
                  if (match) id = match[1];
                  updateNodeData({ url, videoId: id });
                  setIsEditing(false);
                }
              }}
              className="flex-1"
            />
            <Button
              size="sm"
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                const url = input.value;
                let id = "";
                const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/);
                if (match) id = match[1];
                updateNodeData({ url, videoId: id });
                setIsEditing(false);
              }}
              className="cursor-pointer"
            >
              Save
            </Button>
          </div>
          <span className="text-[10px] text-muted-foreground">Press enter or click Save to embed. Support watch link or short URL.</span>
        </div>
      );
    }

    return renderCardWrapper(
      blockData.videoId ? (
        <div className="aspect-video w-full rounded-xl overflow-hidden shadow-inner border bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${blockData.videoId}`}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="text-center text-sm text-muted-foreground py-8">Invalid or missing YouTube URL. Click edit to fix.</div>
      )
    );
  }

  // 2. Figma Embed
  if (blockType === "figma") {
    if (isEditing) {
      return renderCardWrapper(
        <div className="space-y-3">
          <label className="text-xs font-medium block">Figma Project Embed URL</label>
          <div className="flex gap-2">
            <Input
              placeholder="https://www.figma.com/file/..."
              defaultValue={blockData.url || ""}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const url = (e.target as HTMLInputElement).value;
                  updateNodeData({ url });
                  setIsEditing(false);
                }
              }}
              className="flex-1"
            />
            <Button
              size="sm"
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                updateNodeData({ url: input.value });
                setIsEditing(false);
              }}
              className="cursor-pointer"
            >
              Save
            </Button>
          </div>
          <span className="text-[10px] text-muted-foreground">Insert Figma share link.</span>
        </div>
      );
    }

    return renderCardWrapper(
      blockData.url ? (
        <div className="w-full h-80 rounded-xl overflow-hidden border bg-muted shadow-sm">
          <iframe
            src={`https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(blockData.url)}`}
            className="w-full h-full border-0"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="text-center text-sm text-muted-foreground py-8">Missing Figma URL. Click edit to configure.</div>
      )
    );
  }

  // 3. X (Tweet) Embed
  if (blockType === "tweet") {
    if (isEditing) {
      return renderCardWrapper(
        <div className="space-y-3">
          <label className="text-xs font-medium block">Tweet content (Mockup Embed)</label>
          <Input
            id="tweet-name"
            placeholder="Display Name"
            defaultValue={blockData.name || "Antigravity Agent"}
            className="mb-2"
          />
          <Input
            id="tweet-handle"
            placeholder="Twitter Handle"
            defaultValue={blockData.handle || "@GoogleDeepMind"}
            className="mb-2"
          />
          <Textarea
            id="tweet-text"
            placeholder="Write tweet text..."
            defaultValue={blockData.text || "Pair programming on PrishthaWeb with beautiful floating menus! 🚀✨ #javascript #lexical"}
            className="mb-3"
          />
          <Button
            size="sm"
            onClick={() => {
              const nameEl = document.getElementById("tweet-name") as HTMLInputElement;
              const handleEl = document.getElementById("tweet-handle") as HTMLInputElement;
              const textEl = document.getElementById("tweet-text") as HTMLTextAreaElement;
              updateNodeData({
                name: nameEl?.value || "Antigravity Agent",
                handle: handleEl?.value || "@GoogleDeepMind",
                text: textEl?.value || "",
                likes: blockData.likes || 128,
                retweets: blockData.retweets || 24,
              });
              setIsEditing(false);
            }}
            className="cursor-pointer"
          >
            Generate Tweet Card
          </Button>
        </div>
      );
    }

    return renderCardWrapper(
      <div className="border border-border/60 bg-card rounded-xl p-5 shadow-sm space-y-4 max-w-xl mx-auto text-foreground text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary select-none shrink-0 border border-primary/20">
            {blockData.name ? blockData.name.charAt(0) : "A"}
          </div>
          <div>
            <div className="font-bold text-sm flex items-center gap-1">
              <span>{blockData.name || "Antigravity Agent"}</span>
              <span className="w-3.5 h-3.5 bg-blue-500 rounded-full text-[8px] flex items-center justify-center text-white select-none">✓</span>
            </div>
            <div className="text-xs text-muted-foreground">{blockData.handle || "@GoogleDeepMind"}</div>
          </div>
          <Twitter className="h-5 w-5 text-sky-500 ml-auto shrink-0" />
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{blockData.text || "No text content."}</p>
        <div className="text-[11px] text-muted-foreground border-b pb-2">1:28 AM · Jun 23, 2026</div>
        <div className="flex items-center gap-5 text-xs text-muted-foreground">
          <button
            type="button"
            className="hover:text-red-500 flex items-center gap-1.5 transition-colors cursor-pointer select-none"
            onClick={() => {
              updateNodeData({ ...blockData, likes: (blockData.likes || 128) + 1 });
            }}
          >
            ❤️ <span className="font-semibold text-foreground">{blockData.likes || 128}</span> Likes
          </button>
          <div className="flex items-center gap-1.5">
            🔁 <span className="font-semibold text-foreground">{blockData.retweets || 24}</span> Retweets
          </div>
        </div>
      </div>
    );
  }

  // 4. Sticky Note
  if (blockType === "sticky") {
    return (
      <div className="relative group/sticky w-64 min-h-[170px] mx-auto my-6 p-4 rounded-xl bg-yellow-100 dark:bg-yellow-950/40 text-yellow-900 dark:text-yellow-100 border border-yellow-200 dark:border-yellow-900 shadow-md transform -rotate-1 flex flex-col justify-between">
        {/* Sticky Header Control */}
        <div className="flex items-center justify-between pb-2 border-b border-yellow-200/50 dark:border-yellow-900/50 text-[10px] uppercase tracking-wider font-bold opacity-30 group-hover/sticky:opacity-100 transition-opacity select-none mb-2">
          <div className="flex items-center gap-1">
            <StickyNote className="h-3 w-3" />
            <span>Sticky Note</span>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 p-0.5 cursor-pointer"
            aria-label="Delete note"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
        {/* Text Box */}
        <textarea
          defaultValue={blockData.text || ""}
          placeholder="Jot down notes here..."
          className="flex-1 w-full bg-transparent border-0 outline-none resize-none font-medium text-sm leading-relaxed placeholder-yellow-800/40 dark:placeholder-yellow-200/20 focus:ring-0"
          onBlur={(e) => {
            updateNodeData({ text: e.target.value });
          }}
        />
        <div className="text-[9px] text-right opacity-40 mt-1 select-none font-bold">Auto-saves on blur</div>
      </div>
    );
  }

  // 5. Interactive Poll
  if (blockType === "poll") {
    if (isEditing) {
      return renderCardWrapper(
        <div className="space-y-3">
          <label className="text-xs font-medium block">Create a Poll</label>
          <Input
            id="poll-question"
            placeholder="Poll Question (e.g. Which text editor do you prefer?)"
            defaultValue={blockData.question || ""}
            className="mb-2"
          />
          <Input
            id="poll-opt1"
            placeholder="Option 1"
            defaultValue={blockData.options?.[0]?.text || ""}
            className="mb-2"
          />
          <Input
            id="poll-opt2"
            placeholder="Option 2"
            defaultValue={blockData.options?.[1]?.text || ""}
            className="mb-2"
          />
          <Input
            id="poll-opt3"
            placeholder="Option 3"
            defaultValue={blockData.options?.[2]?.text || ""}
            className="mb-3"
          />
          <Button
            size="sm"
            onClick={() => {
              const qEl = document.getElementById("poll-question") as HTMLInputElement;
              const o1El = document.getElementById("poll-opt1") as HTMLInputElement;
              const o2El = document.getElementById("poll-opt2") as HTMLInputElement;
              const o3El = document.getElementById("poll-opt3") as HTMLInputElement;

              const opts = [];
              if (o1El?.value) opts.push({ text: o1El.value, votes: 0 });
              if (o2El?.value) opts.push({ text: o2El.value, votes: 0 });
              if (o3El?.value) opts.push({ text: o3El.value, votes: 0 });

              updateNodeData({
                question: qEl?.value || "Feedback Poll",
                options: opts.length > 0 ? opts : [{ text: "Yes", votes: 0 }, { text: "No", votes: 0 }],
                totalVotes: 0,
              });
              setIsEditing(false);
            }}
            className="cursor-pointer"
          >
            Create Poll
          </Button>
        </div>
      );
    }

    const totalVotes = blockData.totalVotes || 0;

    return renderCardWrapper(
      <div className="space-y-4 max-w-md mx-auto text-left">
        <h4 className="font-bold text-sm text-foreground leading-snug">{blockData.question || "Poll Question"}</h4>
        <div className="space-y-2.5">
          {blockData.options?.map((opt: { text: string; votes: number }, idx: number) => {
            const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
            return (
              <button
                key={idx}
                type="button"
                className="relative w-full text-left overflow-hidden border border-border/50 rounded-xl p-3 text-sm transition-all hover:bg-accent hover:border-primary/20 active:scale-[0.99] cursor-pointer group flex items-center justify-between"
                onClick={() => {
                  const updatedOpts = blockData.options.map((o: any, i: number) => 
                    i === idx ? { ...o, votes: o.votes + 1 } : o
                  );
                  updateNodeData({
                    ...blockData,
                    options: updatedOpts,
                    totalVotes: totalVotes + 1,
                  });
                }}
              >
                {/* Background progress fill */}
                <div
                  className="absolute left-0 top-0 h-full bg-primary/10 transition-all duration-500 rounded-l-lg pointer-events-none"
                  style={{ width: `${pct}%` }}
                />
                <span className="font-medium text-foreground relative z-10">{opt.text}</span>
                <span className="text-xs text-muted-foreground font-semibold relative z-10">
                  {pct}% ({opt.votes} votes)
                </span>
              </button>
            );
          })}
        </div>
        <div className="text-[10px] text-muted-foreground font-medium text-right">
          Total Votes: {totalVotes} · Click an option to vote
        </div>
      </div>
    );
  }

  // 6. LaTeX / Equation block
  if (blockType === "equation") {
    if (isEditing) {
      return renderCardWrapper(
        <div className="space-y-3">
          <label className="text-xs font-medium block">LaTeX / Math equation</label>
          <Textarea
            placeholder="e.g. f(x) = \int_{-\infty}^{\infty} \hat{f}(\xi) e^{2 \pi i \xi x} d\xi"
            defaultValue={blockData.equation || ""}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) {
                updateNodeData({ equation: e.currentTarget.value });
                setIsEditing(false);
              }
            }}
            className="font-mono text-sm"
          />
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-muted-foreground">Press Ctrl+Enter to save formula.</span>
            <Button
              size="sm"
              onClick={(e) => {
                const textarea = e.currentTarget.parentElement?.previousElementSibling as HTMLTextAreaElement;
                updateNodeData({ equation: textarea.value });
                setIsEditing(false);
              }}
              className="cursor-pointer"
            >
              Save Formula
            </Button>
          </div>
        </div>
      );
    }

    return renderCardWrapper(
      <div className="flex flex-col items-center justify-center p-6 bg-muted/30 border rounded-xl my-2 text-foreground font-serif text-lg text-center overflow-x-auto shadow-inner select-all">
        {blockData.equation ? (
          <div className="py-2 inline-block">
            {/* Quick Mock/Basic Renders of LaTeX styles using math font */}
            <span className="italic font-semibold text-lg select-text font-serif">
              {blockData.equation}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm font-sans italic">Empty equation. Click edit to write LaTeX.</span>
        )}
      </div>
    );
  }

  // 7. Whiteboard Sketchpad
  if (isSketchpad) {
    const handleDrawStart = (e: React.MouseEvent<HTMLCanvasElement>) => {
      setIsDrawing(true);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    };

    const handleDrawMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const handleDrawEnd = () => {
      if (!isDrawing) return;
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas) {
        updateNodeData({ image: canvas.toDataURL() });
      }
    };

    const clearCanvas = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          updateNodeData({ image: null });
        }
      }
    };

    const colors = ["#e63946", "#1d3557", "#2a9d8f", "#f4a261", "#7209b7", "#000000"];

    return renderCardWrapper(
      <div className="flex flex-col items-center gap-3">
        {/* Draw Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 w-full border-b pb-3 text-xs select-none">
          <div className="flex items-center gap-2">
            <span>Color:</span>
            <div className="flex gap-1">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setStrokeColor(c)}
                  className={`w-5 h-5 rounded-full border border-border/80 cursor-pointer ${
                    strokeColor === c ? "ring-2 ring-primary scale-110" : ""
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Draw color ${c}`}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span>Size:</span>
              <input
                type="range"
                min="1"
                max="12"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-16 h-1 bg-accent rounded-lg appearance-none cursor-pointer"
              />
              <span className="font-mono text-[10px] w-4">{brushSize}px</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearCanvas}
              className="h-7 px-2.5 text-[11px] cursor-pointer"
            >
              Clear Board
            </Button>
          </div>
        </div>

        {/* Canvas Element */}
        <div className="border bg-white rounded-lg shadow-inner overflow-hidden cursor-crosshair max-w-full">
          <canvas
            ref={canvasRef}
            width={600}
            height={260}
            onMouseDown={handleDrawStart}
            onMouseMove={handleDrawMove}
            onMouseUp={handleDrawEnd}
            onMouseLeave={handleDrawEnd}
            className="w-full block"
          />
        </div>
        <div className="text-[9px] text-muted-foreground text-center font-medium italic">
          Hold left mouse button and draw. Your sketch is saved reactively inside the file.
        </div>
      </div>
    );
  }

  // 8. Responsive Image Card
  if (blockType === "image") {
    if (isEditing) {
      return renderCardWrapper(
        <div className="space-y-3">
          <label className="text-xs font-medium block">Embed Image</label>
          <Input
            id="img-url"
            placeholder="Image URL (e.g. https://images.unsplash.com/...)"
            defaultValue={blockData.url || ""}
            className="mb-2"
          />
          <Input
            id="img-caption"
            placeholder="Caption / Description"
            defaultValue={blockData.caption || ""}
            className="mb-3"
          />
          <Button
            size="sm"
            onClick={() => {
              const urlEl = document.getElementById("img-url") as HTMLInputElement;
              const capEl = document.getElementById("img-caption") as HTMLInputElement;
              // Fallback to random unsplash nature if URL empty
              const url = urlEl?.value || `https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80`;
              updateNodeData({
                url,
                caption: capEl?.value || "Scenic landscape image",
              });
              setIsEditing(false);
            }}
            className="cursor-pointer"
          >
            Insert Image
          </Button>
        </div>
      );
    }

    return renderCardWrapper(
      <figure className="flex flex-col items-center gap-2 text-center w-full max-w-xl mx-auto my-1">
        <img
          src={blockData.url}
          alt={blockData.caption || "Embedded rich visual"}
          className="rounded-xl max-h-[380px] w-full object-cover border shadow-sm select-all"
        />
        {blockData.caption && (
          <figcaption className="text-xs italic text-muted-foreground mt-1 border-l-2 pl-3 py-0.5 border-primary/20 text-left select-text">
            {blockData.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  // 9. Animated GIF Embed
  if (blockType === "gif") {
    const defaultGifs = [
      "https://media.giphy.com/media/tJqyalvo9ahykfykAj/giphy.gif", // nice writing gif
      "https://media.giphy.com/media/3o7qE1YN7aBOFPRw8E/giphy.gif", // typing fast
      "https://media.giphy.com/media/26tn33F5M3JJRLRRK/giphy.gif", // work lo-fi
      "https://media.giphy.com/media/l41lI4bYippKV6bAI/giphy.gif", // space writer
    ];

    if (isEditing) {
      return renderCardWrapper(
        <div className="space-y-3">
          <label className="text-xs font-medium block">Select Preset GIF or Insert URL</label>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {defaultGifs.map((gif, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  updateNodeData({ url: gif });
                  setIsEditing(false);
                }}
                className="border rounded-lg overflow-hidden cursor-pointer hover:border-primary active:scale-95 transition-all aspect-square bg-muted"
              >
                <img src={gif} className="w-full h-full object-cover" alt={`preset-${idx}`} />
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              id="gif-custom-url"
              placeholder="Or paste custom .gif URL here..."
              defaultValue={blockData.url || ""}
              className="flex-1"
            />
            <Button
              size="sm"
              onClick={() => {
                const input = document.getElementById("gif-custom-url") as HTMLInputElement;
                updateNodeData({ url: input.value });
                setIsEditing(false);
              }}
              className="cursor-pointer"
            >
              Insert
            </Button>
          </div>
        </div>
      );
    }

    return renderCardWrapper(
      blockData.url ? (
        <div className="flex justify-center w-full my-1">
          <img
            src={blockData.url}
            alt="Embedded animated clip"
            className="rounded-xl max-h-[300px] object-contain border shadow-sm select-all"
          />
        </div>
      ) : (
        <div className="text-center text-sm text-muted-foreground py-8">No GIF chosen. Click edit.</div>
      )
    );
  }

  // 10. Collapsible Accordion (details/summary)
  if (blockType === "collapsible") {
    if (isEditing) {
      return renderCardWrapper(
        <div className="space-y-3 text-left">
          <label className="text-xs font-medium block">Configure Accordion</label>
          <Input
            id="col-header"
            placeholder="Accordion Summary Header (e.g. Read details)"
            defaultValue={blockData.header || "Click to expand details"}
            className="mb-2 font-semibold"
          />
          <Textarea
            id="col-content"
            placeholder="Write collapsible details body content..."
            defaultValue={blockData.content || ""}
            className="mb-3"
          />
          <Button
            size="sm"
            onClick={() => {
              const headEl = document.getElementById("col-header") as HTMLInputElement;
              const conEl = document.getElementById("col-content") as HTMLTextAreaElement;
              updateNodeData({
                header: headEl?.value || "Collapsible Header",
                content: conEl?.value || "Collapsible detailed content.",
              });
              setIsEditing(false);
            }}
            className="cursor-pointer"
          >
            Create Accordion
          </Button>
        </div>
      );
    }

    return renderCardWrapper(
      <details className="border border-border/60 bg-muted/10 rounded-xl p-3 shadow-inner group-collapsible text-foreground text-left">
        <summary className="font-semibold text-sm cursor-pointer list-none flex items-center justify-between select-none py-1 focus:outline-none">
          <span>{blockData.header || "Expand details"}</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90 shrink-0" />
        </summary>
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground mt-3 pt-3 border-t pl-2">
          {blockData.content || "Empty content details."}
        </p>
      </details>
    );
  }

  // 11. Calendar Date Stamp
  if (blockType === "date") {
    const today = new Date().toISOString().split("T")[0];
    if (isEditing) {
      return renderCardWrapper(
        <div className="space-y-3">
          <label className="text-xs font-medium block">Select Calendar Stamp Date</label>
          <div className="flex gap-2">
            <Input
              type="date"
              id="date-picker-input"
              defaultValue={blockData.date || today}
              className="flex-1"
            />
            <Button
              size="sm"
              onClick={() => {
                const picker = document.getElementById("date-picker-input") as HTMLInputElement;
                updateNodeData({ date: picker?.value || today });
                setIsEditing(false);
              }}
              className="cursor-pointer"
            >
              Stamp
            </Button>
          </div>
        </div>
      );
    }

    const formattedDate = blockData.date
      ? new Date(blockData.date).toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : new Date().toLocaleDateString();

    return renderCardWrapper(
      <div className="border border-teal-200/40 bg-teal-50/15 rounded-xl p-4 flex items-center gap-4 max-w-sm mx-auto shadow-sm select-none">
        <div className="w-12 h-12 bg-teal-500 rounded-lg text-white flex flex-col items-center justify-center font-bold shadow-sm">
          <span className="text-[10px] uppercase tracking-wider leading-none">
            {blockData.date ? new Date(blockData.date).toLocaleString(undefined, { month: "short" }) : "Jun"}
          </span>
          <span className="text-lg leading-tight mt-0.5">
            {blockData.date ? new Date(blockData.date).getDate() : "23"}
          </span>
        </div>
        <div className="text-left">
          <div className="text-[9px] uppercase tracking-wider text-teal-600 font-bold">Date Stamped</div>
          <div className="text-sm font-semibold text-foreground mt-0.5">{formattedDate}</div>
        </div>
      </div>
    );
  }

  // 12. Grid Table
  if (blockType === "table") {
    if (isEditing) {
      return renderCardWrapper(
        <div className="space-y-3">
          <label className="text-xs font-medium block">Configure Grid Table Dimensions</label>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <span className="text-[10px] text-muted-foreground font-semibold">Rows</span>
              <Input id="table-rows-num" type="number" min="1" max="10" defaultValue={blockData.rows || 3} />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground font-semibold">Columns</span>
              <Input id="table-cols-num" type="number" min="1" max="10" defaultValue={blockData.cols || 3} />
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => {
              const rEl = document.getElementById("table-rows-num") as HTMLInputElement;
              const cEl = document.getElementById("table-cols-num") as HTMLInputElement;
              const rCount = Math.min(10, Math.max(1, Number(rEl?.value || 3)));
              const cCount = Math.min(10, Math.max(1, Number(cEl?.value || 3)));

              // initialize table cell content array
              const initialCells = Array.from({ length: rCount }, () =>
                Array.from({ length: cCount }, () => "")
              );

              updateNodeData({
                rows: rCount,
                cols: cCount,
                cells: initialCells,
              });
              setIsEditing(false);
            }}
            className="cursor-pointer"
          >
            Create Table
          </Button>
        </div>
      );
    }

    const rowCount = blockData.rows || 3;
    const colCount = blockData.cols || 3;
    const cells = blockData.cells || [];

    const updateCellContent = (r: number, c: number, value: string) => {
      const updatedCells = cells.map((rowArr: string[], rowIdx: number) => {
        if (rowIdx === r) {
          return rowArr.map((colVal: string, colIdx: number) => (colIdx === c ? value : colVal));
        }
        return rowArr;
      });
      updateNodeData({ ...blockData, cells: updatedCells });
    };

    return renderCardWrapper(
      <div className="overflow-x-auto w-full border rounded-xl shadow-inner my-1 bg-background select-none">
        <table className="w-full border-collapse text-left min-w-[400px]">
          <thead>
            <tr className="bg-muted border-b border-border/80">
              {Array.from({ length: colCount }).map((_, c) => (
                <th key={c} className="p-2.5 font-bold text-xs text-foreground/80 border-r border-border/40 select-none">
                  Col {c + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rowCount }).map((_, r) => (
              <tr key={r} className="border-b last:border-b-0 border-border/40 hover:bg-muted/10">
                {Array.from({ length: colCount }).map((_, c) => {
                  const val = cells[r]?.[c] || "";
                  return (
                    <td key={c} className="p-1 border-r last:border-r-0 border-border/40">
                      <input
                        type="text"
                        value={val}
                        placeholder="..."
                        onChange={(e) => updateCellContent(r, c, e.target.value)}
                        className="w-full px-2 py-1 text-sm bg-transparent border-0 outline-none select-text focus:ring-1 focus:ring-primary/20 rounded-md"
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // 13. Columns Layout
  if (blockType === "columns") {
    if (isEditing) {
      return renderCardWrapper(
        <div className="space-y-3">
          <label className="text-xs font-medium block">Configure Multi-Column Text Card</label>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <span className="text-[10px] text-muted-foreground font-semibold">Left Column Content</span>
              <Textarea id="col-left-val" defaultValue={blockData.left || ""} placeholder="Left column text..." />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground font-semibold">Right Column Content</span>
              <Textarea id="col-right-val" defaultValue={blockData.right || ""} placeholder="Right column text..." />
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => {
              const lEl = document.getElementById("col-left-val") as HTMLTextAreaElement;
              const rEl = document.getElementById("col-right-val") as HTMLTextAreaElement;
              updateNodeData({
                left: lEl?.value || "",
                right: rEl?.value || "",
              });
              setIsEditing(false);
            }}
            className="cursor-pointer"
          >
            Create Column Layout
          </Button>
        </div>
      );
    }

    return renderCardWrapper(
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2 px-1 text-left text-sm leading-relaxed">
        <div className="border-r border-border/30 pr-4 whitespace-pre-wrap select-text">
          {blockData.left || <span className="text-muted-foreground italic">Left column empty. Click edit to configure.</span>}
        </div>
        <div className="whitespace-pre-wrap select-text">
          {blockData.right || <span className="text-muted-foreground italic">Right column empty. Click edit to configure.</span>}
        </div>
      </div>
    );
  }

  return renderCardWrapper(
    <div className="text-center text-sm text-muted-foreground py-8 select-none">Unsupported custom block type: {blockType}</div>
  );
};
