export const printSimpleDocument = (title: string, description: string): void => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const content = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title || "Document"}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            line-height: 1.6;
          }
          h1 {
            margin-bottom: 20px;
            color: #333;
          }
          pre {
            white-space: pre-wrap;
            word-wrap: break-word;
            font-family: inherit;
          }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <h1>${title || "Untitled Document"}</h1>
        <pre>${description}</pre>
      </body>
    </html>
  `;

  printWindow.document.write(content);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};

export const downloadSimpleDocumentTxt = (title: string, description: string): void => {
  const timestamp = new Date().toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const separator = "=".repeat(title.length || 20);
  const content = `${
    title || "Untitled Document"
  }\n${separator}\n\n${description}\n\n---\nGenerated on: ${timestamp}`;

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${title || "document"}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
