import { LexicalEditor, $getRoot } from "lexical";
import { $generateHtmlFromNodes } from "@lexical/html";

export const exportLexicalToTxt = (editor: LexicalEditor): void => {
  let content = "";
  editor.getEditorState().read(() => {
    content = $getRoot().getTextContent();
  });

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "document.txt";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportLexicalToPdf = async (editor: LexicalEditor): Promise<void> => {
  try {
    let htmlContent = "";
    editor.getEditorState().read(() => {
      htmlContent = $generateHtmlFromNodes(editor);
    });

    if (!htmlContent || htmlContent.trim() === "") {
      alert("No content to export. Please add some text first.");
      return;
    }

    const { default: jsPDF } = await import("jspdf");
    const { default: html2canvas } = await import("html2canvas");

    const tempContainer = document.createElement("div");
    tempContainer.style.cssText = `
      position: absolute;
      left: -9999px;
      top: 0;
      width: 800px;
      padding: 40px 40px 80px 40px;
      background-color: #ffffff;
      font-family: Arial, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: #000000;
      all: initial;
      display: block;
      box-sizing: border-box;
    `;
    tempContainer.setAttribute("data-html2canvas-ignore-parent", "true");
    tempContainer.innerHTML = htmlContent;
    document.body.appendChild(tempContainer);

    // Wait for fonts/layout to settle
    await new Promise((resolve) => setTimeout(resolve, 100));

    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 800,
      windowHeight: tempContainer.scrollHeight + 100,
      height: tempContainer.scrollHeight + 100,
      ignoreElements: (element) => {
        return (
          element.classList &&
          (element.classList.contains("dark") ||
            element.classList.contains("light"))
        );
      },
      onclone: (clonedDoc) => {
        const stylesheets = clonedDoc.querySelectorAll(
          'link[rel="stylesheet"], style'
        );
        stylesheets.forEach((sheet) => sheet.remove());
      },
    });

    document.body.removeChild(tempContainer);

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error("Failed to capture content");
    }

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
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    alert(`Failed to export PDF: ${errorMessage}\n\nPlease try again.`);
  }
};
