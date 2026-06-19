import { Descendant } from "slate";
import { CustomText, CustomElement } from "./slate-editor";

export const exportToTxt = (value: Descendant[]): void => {
  const extractText = (node: Descendant): string => {
    if ("text" in node) return node.text;
    if ("children" in node) {
      return (node as CustomElement).children.map(extractText).join("");
    }
    return "";
  };

  const content = value.map((block) => extractText(block)).join("\n\n");
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

export const exportToPdf = async (value: Descendant[]): Promise<void> => {
  try {
    if (!value || value.length === 0) {
      alert("No content to export. Please add some text first.");
      return;
    }

    const { default: jsPDF } = await import("jspdf");
    const { default: html2canvas } = await import("html2canvas");

    // Helper to ensure color is in hex format
    const ensureHexColor = (color: string | undefined): string | undefined => {
      if (!color || color === "transparent") return color;
      if (color.startsWith("#") || /^[a-z]+$/i.test(color)) return color;
      try {
        const temp = document.createElement("div");
        temp.style.color = color;
        document.body.appendChild(temp);
        const computed = getComputedStyle(temp).color;
        document.body.removeChild(temp);

        const match = computed.match(
          /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/
        );
        if (match) {
          const r = parseInt(match[1]).toString(16).padStart(2, "0");
          const g = parseInt(match[2]).toString(16).padStart(2, "0");
          const b = parseInt(match[3]).toString(16).padStart(2, "0");
          return `#${r}${g}${b}`;
        }
      } catch {
        console.warn("Failed to convert color:", color);
      }
      return "#000000";
    };

    // Create a temporary container for clean rendering
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

    // Recursively render content to HTML string
    const renderContent = (nodes: Descendant[]): string => {
      if (!nodes || !Array.isArray(nodes)) return "";
      return nodes
        .map((node) => {
          if ("text" in node) {
            const text = node as CustomText;
            let html = text.text || "";

            const styles: string[] = [];
            if (text.fontFamily && text.fontFamily !== "default") {
              styles.push(`font-family: ${text.fontFamily}`);
            }
            if (text.fontSize) {
              styles.push(`font-size: ${text.fontSize}px`);
            }
            const textColor = ensureHexColor(text.color);
            if (textColor) {
              styles.push(`color: ${textColor}`);
            }
            const bgColor = ensureHexColor(text.backgroundColor);
            if (bgColor && bgColor !== "transparent") {
              styles.push(`background-color: ${bgColor}`);
            }

            if (text.bold) html = `<strong>${html}</strong>`;
            if (text.italic) html = `<em>${html}</em>`;
            if (text.underline) html = `<u>${html}</u>`;
            if (text.strikethrough) html = `<s>${html}</s>`;
            if (text.code) {
              html = `<code style="background: #f4f4f4; padding: 2px 4px; border-radius: 3px;">${html}</code>`;
            }

            if (styles.length > 0) {
              html = `<span style="${styles.join("; ")}">${html}</span>`;
            }

            return html;
          }

          if ("children" in node) {
            const element = node as CustomElement;
            const childrenHtml = renderContent(element.children);
            const align = element.align || "left";
            const alignStyle = `text-align: ${align}; margin: 8px 0;`;

            switch (element.type) {
              case "heading-one":
                return `<h1 style="${alignStyle} font-size: 32px; font-weight: bold;">${childrenHtml}</h1>`;
              case "heading-two":
                return `<h2 style="${alignStyle} font-size: 24px; font-weight: bold;">${childrenHtml}</h2>`;
              case "heading-three":
                return `<h3 style="${alignStyle} font-size: 20px; font-weight: bold;">${childrenHtml}</h3>`;
              case "block-quote":
                return `<blockquote style="${alignStyle} border-left: 4px solid #ccc; padding-left: 16px; margin-left: 0; color: #666;">${childrenHtml}</blockquote>`;
              case "bulleted-list":
                return `<ul style="${alignStyle} padding-left: 24px;">${childrenHtml}</ul>`;
              case "numbered-list":
                return `<ol style="${alignStyle} padding-left: 24px;">${childrenHtml}</ol>`;
              case "list-item":
                return `<li style="margin: 4px 0;">${childrenHtml}</li>`;
              default:
                return `<p style="${alignStyle}">${childrenHtml}</p>`;
            }
          }

          return "";
        })
        .join("");
    };

    const htmlContent = renderContent(value);

    if (!htmlContent || htmlContent.trim() === "") {
      alert("No content to export. Please add some text first.");
      return;
    }

    tempContainer.innerHTML = htmlContent;
    document.body.appendChild(tempContainer);

    // Wait a moment for fonts to load
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
