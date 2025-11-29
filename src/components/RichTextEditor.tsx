"use client";

import React, { useEffect, useRef, useState } from "react";
import type { OutputData } from "@editorjs/editorjs";
import { saveRichEditor, loadRichEditor } from "@/utils/localStorage";

export const RichTextEditor: React.FC = () => {
  const editorRef = useRef<{
    destroy: () => void;
    save: () => Promise<OutputData>;
    isReady: Promise<void>;
  } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<OutputData | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || isInitialized) return;

    const initEditor = async () => {
      const savedData = loadRichEditor();

      // Dynamic imports for EditorJS and all tools
      const EditorJS = (await import("@editorjs/editorjs")).default;
      const Header = (await import("@editorjs/header")).default;
      const Paragraph = (await import("@editorjs/paragraph")).default;
      const List = (await import("@editorjs/list")).default;
      const LinkTool = (await import("@editorjs/link")).default;
      const ImageTool = (await import("@editorjs/image")).default;
      const Table = (await import("@editorjs/table")).default;
      const Quote = (await import("@editorjs/quote")).default;
      const Marker = (await import("@editorjs/marker")).default;
      const Underline = (await import("@editorjs/underline")).default;

      editorRef.current = new EditorJS({
        holder: "editorjs",
        tools: {
          header: {
            class: Header,
            config: {
              placeholder: "Enter a header",
              levels: [1, 2, 3, 4, 5, 6],
              defaultLevel: 2,
            },
          },
          paragraph: {
            class: Paragraph,
            inlineToolbar: true,
          },
          list: {
            class: List,
            inlineToolbar: true,
          },
          linkTool: {
            class: LinkTool,
            config: {
              endpoint: "/api/fetchUrl",
            },
          },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                uploadByFile(file: File) {
                  return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      resolve({
                        success: 1,
                        file: {
                          url: e.target?.result as string,
                        },
                      });
                    };
                    reader.readAsDataURL(file);
                  });
                },
              },
            },
          },
          table: {
            class: Table,
            inlineToolbar: true,
          },
          quote: {
            class: Quote,
            inlineToolbar: true,
          },
          marker: {
            class: Marker,
          },
          underline: {
            class: Underline,
          },
        },
        data: savedData || undefined,
        onChange: async () => {
          if (editorRef.current) {
            const content = await editorRef.current.save();
            saveRichEditor(content);
            if (showPreview) {
              setPreviewData(content);
            }
          }
        },
        placeholder: "Start writing your content...",
      });

      await editorRef.current.isReady;
      setIsInitialized(true);
    };

    initEditor();

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
      setIsInitialized(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const updatePreview = async () => {
      if (showPreview && editorRef.current) {
        const content = await editorRef.current.save();
        setPreviewData(content);
      }
    };
    updatePreview();
  }, [showPreview]);

  const handleExportTxt = async () => {
    if (!editorRef.current) return;

    const data = await editorRef.current.save();
    let textContent = "";

    data.blocks.forEach(
      (block: { type: string; data: Record<string, unknown> }) => {
        switch (block.type) {
          case "header":
            textContent += `${"#".repeat(block.data.level as number)} ${
              block.data.text as string
            }\n\n`;
            break;
          case "paragraph":
            textContent += `${block.data.text as string}\n\n`;
            break;
          case "list":
            (block.data.items as string[]).forEach((item: string) => {
              textContent += `- ${item}\n`;
            });
            textContent += "\n";
            break;
          default:
            textContent += `${JSON.stringify(block.data)}\n\n`;
        }
      }
    );

    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "document.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = async () => {
    if (!editorRef.current) return;

    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: html2canvas } = await import("html2canvas");

      const data = await editorRef.current.save();

      // Create a temporary div to render content
      const tempDiv = document.createElement("div");
      tempDiv.style.padding = "20px";
      tempDiv.style.backgroundColor = "white";
      tempDiv.style.width = "800px";
      tempDiv.style.position = "absolute";
      tempDiv.style.left = "-9999px";
      document.body.appendChild(tempDiv);

      // Render blocks to HTML
      data.blocks.forEach(
        (block: { type: string; data: Record<string, unknown> }) => {
          const blockDiv = document.createElement("div");
          blockDiv.style.marginBottom = "10px";

          switch (block.type) {
            case "header": {
              const heading = document.createElement(
                `h${block.data.level as number}`
              );
              heading.innerHTML = block.data.text as string;
              blockDiv.appendChild(heading);
              break;
            }
            case "paragraph": {
              const p = document.createElement("p");
              p.innerHTML = block.data.text as string;
              blockDiv.appendChild(p);
              break;
            }
            case "list": {
              const list = document.createElement(
                block.data.style === "ordered" ? "ol" : "ul"
              );
              (block.data.items as string[]).forEach((item: string) => {
                const li = document.createElement("li");
                li.innerHTML = item;
                list.appendChild(li);
              });
              blockDiv.appendChild(list);
              break;
            }
            default:
              const p = document.createElement("p");
              p.textContent = JSON.stringify(block.data);
              blockDiv.appendChild(p);
          }

          tempDiv.appendChild(blockDiv);
        }
      );

      // Convert to canvas and then PDF
      const canvas = await html2canvas(tempDiv);
      document.body.removeChild(tempDiv);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save("document.pdf");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Failed to export PDF. Please try again.");
    }
  };

  const renderPreview = () => {
    if (!previewData) return null;

    return (
      <div className="prose max-w-none">
        {previewData.blocks.map((block, index) => {
          switch (block.type) {
            case "header": {
              const level = block.data.level as 1 | 2 | 3 | 4 | 5 | 6;
              const headingProps = {
                key: index,
                dangerouslySetInnerHTML: { __html: block.data.text as string },
              };

              if (level === 1) return <h1 {...headingProps} />;
              if (level === 2) return <h2 {...headingProps} />;
              if (level === 3) return <h3 {...headingProps} />;
              if (level === 4) return <h4 {...headingProps} />;
              if (level === 5) return <h5 {...headingProps} />;
              return <h6 {...headingProps} />;
            }
            case "paragraph":
              return (
                <p
                  key={index}
                  dangerouslySetInnerHTML={{ __html: block.data.text }}
                />
              );
            case "list":
              const ListTag = block.data.style === "ordered" ? "ol" : "ul";
              return (
                <ListTag key={index}>
                  {block.data.items.map((item: string, i: number) => (
                    <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                  ))}
                </ListTag>
              );
            case "quote":
              return (
                <blockquote key={index}>
                  <p dangerouslySetInnerHTML={{ __html: block.data.text }} />
                  {block.data.caption && (
                    <cite
                      dangerouslySetInnerHTML={{ __html: block.data.caption }}
                    />
                  )}
                </blockquote>
              );
            case "table":
              return (
                <table
                  key={index}
                  className="table-auto border-collapse border"
                >
                  <tbody>
                    {block.data.content.map(
                      (row: string[], rowIndex: number) => (
                        <tr key={rowIndex}>
                          {row.map((cell: string, cellIndex: number) => (
                            <td
                              key={cellIndex}
                              className="border px-4 py-2"
                              dangerouslySetInnerHTML={{ __html: cell }}
                            />
                          ))}
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              );
            case "image":
              return (
                <div key={index} className="my-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={block.data.file.url as string}
                    alt={(block.data.caption as string) || ""}
                    className="max-w-full"
                  />
                  {block.data.caption && (
                    <p className="text-sm text-gray-600 mt-2">
                      {block.data.caption as string}
                    </p>
                  )}
                </div>
              );
            default:
              return null;
          }
        })}
      </div>
    );
  };

  return (
    <div className="w-full h-full">
      <div className="flex items-center justify-between border-b pb-4 mb-4">
        <h2 className="text-xl font-semibold">Rich Text Editor</h2>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm">Show Preview</span>
            <input
              type="checkbox"
              checked={showPreview}
              onChange={(e) => setShowPreview(e.target.checked)}
              className="w-4 h-4"
            />
          </label>
          <button
            onClick={handleExportTxt}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
          >
            Export TXT
          </button>
          <button
            onClick={handleExportPdf}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
          >
            Export PDF
          </button>
        </div>
      </div>

      <div
        className={`grid ${showPreview ? "grid-cols-2 gap-4" : "grid-cols-1"}`}
      >
        {/* Editor */}
        <div className="border rounded-lg p-4">
          <div id="editorjs" className="min-h-96" />
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="border rounded-lg p-4 bg-gray-50 overflow-auto">
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            {renderPreview()}
          </div>
        )}
      </div>
    </div>
  );
};
