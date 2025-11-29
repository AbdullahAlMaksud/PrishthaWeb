import { pdf, Font } from "@react-pdf/renderer";
import { saveAs } from "file-saver";

/**
 * Bangla fonts configuration
 * Place your Bangla font files in /public/fonts/ directory
 *
 * Example structure:
 * /public/fonts/
 *   - NotoSansBengali-Regular.ttf
 *   - SolaimanLipi.ttf
 *   - Kalpurush.ttf
 *   - etc.
 */

export interface BanglaFont {
  name: string;
  label: string;
  path: string;
}

// Available Bangla fonts - Using fonts from /public/fonts/
export const BANGLA_FONTS: BanglaFont[] = [
  {
    name: "NotoSansBengali",
    label: "Noto Sans Bengali",
    path: "/fonts/NotoSansBengali-Regular.ttf",
  },
  {
    name: "NotoSerifBengali",
    label: "Noto Serif Bengali",
    path: "/fonts/NotoSerifBengali-Regular.ttf",
  },
  {
    name: "SolaimanLipi",
    label: "SolaimanLipi",
    path: "/fonts/SolaimanLipi_20-04-07.ttf",
  },
  {
    name: "AnekBangla",
    label: "Anek Bangla",
    path: "/fonts/AnekBangla-Regular.ttf",
  },
  {
    name: "HindSiliguri",
    label: "Hind Siliguri",
    path: "/fonts/HindSiliguri-Regular.ttf",
  },
  {
    name: "BalooDa2",
    label: "Baloo Da 2",
    path: "/fonts/BalooDa2-Regular.ttf",
  },
  {
    name: "TiroBangla",
    label: "Tiro Bangla",
    path: "/fonts/TiroBangla-Regular.ttf",
  },
  {
    name: "Galada",
    label: "Galada",
    path: "/fonts/Galada-Regular.ttf",
  },
  {
    name: "Alkatra",
    label: "Alkatra",
    path: "/fonts/Alkatra-Regular.ttf",
  },
  {
    name: "Atma",
    label: "Atma",
    path: "/fonts/Atma-Regular.ttf",
  },
  {
    name: "Mina",
    label: "Mina",
    path: "/fonts/Mina-Regular.ttf",
  },
  {
    name: "AdorshoLipi",
    label: "Adorsho Lipi",
    path: "/fonts/AdorshoLipi_20-07-2007.ttf",
  },
  {
    name: "UNBangla",
    label: "UN Bangla",
    path: "/fonts/UNBangla-Regular.ttf",
  },
];

let fontsRegistered = false;

/**
 * Register all Bangla fonts with React PDF
 * This should be called once before generating PDFs
 */
export const registerFonts = () => {
  if (fontsRegistered) return;

  BANGLA_FONTS.forEach((font) => {
    try {
      Font.register({
        family: font.name,
        src: font.path,
      });
    } catch (error) {
      console.warn(`Failed to register font ${font.name}:`, error);
    }
  });

  fontsRegistered = true;
};

/**
 * Generate a PDF blob from a React PDF Document
 * @param document - React PDF Document component
 * @returns Promise<Blob>
 */
export const generatePDFBlob = async (
  document: React.ReactElement
): Promise<Blob> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const asPdf = pdf(document as any);
  const blob = await asPdf.toBlob();
  return blob;
};

/**
 * Download a PDF file
 * @param blob - PDF Blob
 * @param filename - Name of the file to download
 */
export const downloadPDF = (blob: Blob, filename: string = "document.pdf") => {
  saveAs(blob, filename);
};

/**
 * Generate and download a PDF in one step
 * @param document - React PDF Document component
 * @param filename - Name of the file to download
 */
export const generateAndDownloadPDF = async (
  document: React.ReactElement,
  filename: string = "markdown-document.pdf"
): Promise<void> => {
  try {
    // Ensure fonts are registered
    registerFonts();

    // Generate PDF blob
    const blob = await generatePDFBlob(document);

    // Trigger download
    downloadPDF(blob, filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};
