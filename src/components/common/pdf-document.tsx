import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

export interface IPdfDocumentProps {
  content: string;
  fontFamily: string;
}

// Create styles for the PDF document
const createStyles = (fontFamily: string) =>
  StyleSheet.create({
    page: {
      flexDirection: "column",
      backgroundColor: "#FFFFFF",
      padding: 40,
      fontFamily: fontFamily,
    },
    title: {
      fontSize: 24,
      marginBottom: 20,
      fontFamily: fontFamily,
    },
    paragraph: {
      fontSize: 12,
      marginBottom: 10,
      lineHeight: 1.6,
      textAlign: "justify",
      fontFamily: fontFamily,
    },
    heading: {
      fontSize: 18,
      marginTop: 15,
      marginBottom: 10,
      fontFamily: fontFamily,
      fontWeight: "bold",
    },
    listItem: {
      fontSize: 12,
      marginBottom: 5,
      marginLeft: 20,
      fontFamily: fontFamily,
    },
    code: {
      fontSize: 10,
      fontFamily: "Courier",
      backgroundColor: "#f5f5f5",
      padding: 10,
      marginBottom: 10,
    },
  });

/**
 * Simple markdown parser for PDF
 * Converts markdown text into React PDF components
 */
const parseMarkdownToPDF = (
  content: string,
  styles: ReturnType<typeof createStyles>
) => {
  const lines = content.split("\n");
  const elements: React.ReactElement[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip empty lines
    if (line.trim() === "") {
      continue;
    }

    // H1 - Main Title (# Title)
    if (line.startsWith("# ")) {
      elements.push(
        <Text key={key++} style={styles.title}>
          {line.substring(2)}
        </Text>
      );
    }
    // H2 - Heading (## Heading)
    else if (line.startsWith("## ")) {
      elements.push(
        <Text key={key++} style={styles.heading}>
          {line.substring(3)}
        </Text>
      );
    }
    // H3 - Smaller Heading (### Heading)
    else if (line.startsWith("### ")) {
      elements.push(
        <Text key={key++} style={{ ...styles.heading, fontSize: 14 }}>
          {line.substring(4)}
        </Text>
      );
    }
    // List items (- item or * item)
    else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <Text key={key++} style={styles.listItem}>
          • {line.substring(2)}
        </Text>
      );
    }
    // Code blocks (```code```)
    else if (line.startsWith("```")) {
      const codeLines: string[] = [];
      i++; // Skip the opening ```
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <Text key={key++} style={styles.code}>
          {codeLines.join("\n")}
        </Text>
      );
    }
    // Regular paragraph
    else {
      elements.push(
        <Text key={key++} style={styles.paragraph}>
          {line}
        </Text>
      );
    }
  }

  return elements;
};

/**
 * Main PDF Document Component
 */
export const PdfDocument: React.FC<IPdfDocumentProps> = ({ content, fontFamily }) => {
  const styles = createStyles(fontFamily);
  const parsedContent = parseMarkdownToPDF(content, styles);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          {parsedContent.length > 0 ? (
            parsedContent
          ) : (
            <Text style={styles.paragraph}>No content to display</Text>
          )}
        </View>
      </Page>
    </Document>
  );
};
