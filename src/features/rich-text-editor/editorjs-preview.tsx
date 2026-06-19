import React from "react";
import type { OutputData } from "@editorjs/editorjs";

interface IEditorjsPreviewProps {
  previewData: OutputData | null;
}

export const EditorjsPreview: React.FC<IEditorjsPreviewProps> = ({ previewData }) => {
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
                dangerouslySetInnerHTML={{ __html: block.data.text as string }}
              />
            );
          case "list":
            const ListTag = block.data.style === "ordered" ? "ol" : "ul";
            return (
              <ListTag key={index}>
                {(block.data.items as string[]).map((item: string, i: number) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                ))}
              </ListTag>
            );
          case "quote":
            return (
              <blockquote key={index}>
                <p dangerouslySetInnerHTML={{ __html: block.data.text as string }} />
                {block.data.caption && (
                  <cite
                    dangerouslySetInnerHTML={{ __html: block.data.caption as string }}
                  />
                )}
              </blockquote>
            );
          case "table":
            return (
              <table key={index} className="table-auto border-collapse border">
                <tbody>
                  {(block.data.content as string[][]).map(
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
            const file = block.data.file as { url: string } | undefined;
            return (
              <div key={index} className="my-4">
                {file && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={file.url}
                    alt={(block.data.caption as string) || ""}
                    className="max-w-full"
                  />
                )}
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
