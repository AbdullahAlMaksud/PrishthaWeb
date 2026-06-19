import type { OutputData } from "@editorjs/editorjs";

export const exportEditorjsToTxt = async (data: OutputData): Promise<void> => {
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

export const exportEditorjsToPdf = async (data: OutputData): Promise<void> => {
  try {
    const { default: jsPDF } = await import("jspdf");
    const { default: html2canvas } = await import("html2canvas");

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
