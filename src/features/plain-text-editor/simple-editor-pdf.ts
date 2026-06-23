import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";

export const exportSimpleToPdf = async (
  title: string,
  description: string,
  showAlert?: (title: string, desc: string) => void
): Promise<void> => {
  try {
    if (!description || description.trim() === "") {
      if (showAlert) {
        showAlert("Warning", "No content to export. Please add some text first.");
      }
      return;
    }

    const { default: jsPDF } = await import("jspdf");
    const { default: html2canvas } = await import("html2canvas-pro");

    const tempContainer = document.createElement("div");
    tempContainer.style.cssText = `
      position: fixed;
      left: -9999px;
      top: 0;
      z-index: -100;
      opacity: 1;
      pointer-events: none;
      width: 680px;
      background-color: #ffffff;
      font-family: Arial, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: #000000;
      box-sizing: border-box;
      display: block;
    `;
    tempContainer.setAttribute("data-html2canvas-ignore-parent", "true");

    const styleElement = document.createElement("style");
    styleElement.innerHTML = `
      h1 { font-size: 28px; font-weight: bold; margin-top: 0; margin-bottom: 20px; color: #111827; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
      p { font-size: 14px; line-height: 1.6; margin-top: 0; margin-bottom: 12px; color: #1f2937; white-space: pre-wrap; }
    `;
    tempContainer.appendChild(styleElement);

    const contentDiv = document.createElement("div");
    
    // Add title if present
    if (title && title.trim()) {
      const h1 = document.createElement("h1");
      h1.innerText = title;
      contentDiv.appendChild(h1);
    }

    // Split description by double newlines or single newlines to preserve blocks
    const blocks = description.split(/\n\n+/);
    blocks.forEach((blockText) => {
      if (blockText.trim()) {
        const p = document.createElement("p");
        p.innerText = blockText;
        contentDiv.appendChild(p);
      }
    });

    tempContainer.appendChild(contentDiv);
    document.body.appendChild(tempContainer);

    // Wait for layout rendering to complete
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Calculate smart page breaks based on printable page height limit
    const getRelativeTop = (element: HTMLElement, container: HTMLElement): number => {
      const elemRect = element.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      return elemRect.top - containerRect.top;
    };

    const getRelativeBottom = (element: HTMLElement, container: HTMLElement): number => {
      const elemRect = element.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      return elemRect.bottom - containerRect.top;
    };

    const elements = Array.from(contentDiv.children) as HTMLElement[];
    const pageHeightPx = 971; // 257mm printable height on A4 format at 680px width
    const breaks: number[] = [0];
    let currentPageStart = 0;

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const relativeTop = getRelativeTop(element, tempContainer);
      const relativeBottom = getRelativeBottom(element, tempContainer);

      if (relativeBottom - currentPageStart > pageHeightPx) {
        if (relativeTop > currentPageStart) {
          // Break before this element to prevent splitting it
          breaks.push(relativeTop);
          currentPageStart = relativeTop;
        } else {
          // Element is too tall for a single page, force break at page limit
          const nextBreak = currentPageStart + pageHeightPx;
          breaks.push(nextBreak);
          currentPageStart = nextBreak;
        }
      }
    }
    
    // Add end height
    breaks.push(tempContainer.scrollHeight);

    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 680,
      windowHeight: tempContainer.scrollHeight,
      height: tempContainer.scrollHeight,
    });

    document.body.removeChild(tempContainer);

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error("Failed to capture snapshot");
    }

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const containerWidth = 680;
    const imgWidth = 180; // 210 - 2 * 15
    const scale = 2;

    for (let i = 0; i < breaks.length - 1; i++) {
      const startY = breaks[i];
      const endY = breaks[i + 1];
      const sliceHeight = endY - startY;

      if (sliceHeight <= 0) continue;

      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight * scale;

      const ctx = pageCanvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(
          canvas,
          0,
          startY * scale,
          canvas.width,
          sliceHeight * scale,
          0,
          0,
          canvas.width,
          sliceHeight * scale
        );
      }

      if (i > 0) {
        pdf.addPage();
      }

      const pageImgData = pageCanvas.toDataURL("image/png");
      const pageImgHeight = (sliceHeight * imgWidth) / containerWidth;

      pdf.addImage(pageImgData, "PNG", 15, 20, imgWidth, pageImgHeight);
    }

    pdf.save(`${title || "document"}.pdf`);
    if (showAlert) {
      showAlert("Success", "PDF exported successfully with margins!");
    }
  } catch (error) {
    console.error("Error exporting PDF:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    if (showAlert) {
      showAlert("Error", `Failed to export PDF: ${errorMessage}. Please try again.`);
    }
  }
};
