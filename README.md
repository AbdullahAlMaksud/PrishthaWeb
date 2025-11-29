# Simple Text Editor

A modern, feature-rich text editor built with Next.js, TypeScript, and Editor.js that supports both simple plain text editing and advanced rich text editing.

## Features

### Simple Text Editor

- ✅ Title and description fields
- ✅ Auto-save to browser localStorage
- ✅ Fullscreen mode
- ✅ Keyboard typing sound effect (toggle on/off)
- ✅ Download as `.txt` file
- ✅ Character and word count
- ✅ Persistent storage across sessions

### Rich Text Editor (Editor.js)

- ✅ Advanced block-based editor
- ✅ Multiple content blocks: Headers, Paragraphs, Lists, Links, Images, Tables, Quotes
- ✅ Text formatting: Bold, Italic, Marker/Highlight, Underline
- ✅ Side-by-side preview mode
- ✅ Export to PDF and TXT
- ✅ Auto-save to localStorage
- ✅ Modular and reusable architecture

### General Features

- 🎨 Modern UI with Tailwind CSS
- 🔄 Tab-based navigation between editors
- 💾 Separate localStorage for each editor
- 📱 Responsive design
- ⚡ Fast and performant

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Rich Text Editor:** Slate.js
- **UI Components:** shadcn/ui (Radix UI)
- **Icons:** Lucide React
- **PDF Generation:** jsPDF + html2canvas
- **Package Manager:** Yarn

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main landing page with editor & preview
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles including SimpleMDE styles
├── components/
│   └── PDFDocument.tsx   # React PDF Document component
└── utils/
    └── pdf.ts            # PDF generation utilities & font registration

public/
└── fonts/                # Place your Bangla .ttf font files here
    ├── README.md         # Font installation instructions
    └── .gitkeep
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Add Bangla Fonts

Place your Bangla font files (.ttf format) in the `/public/fonts/` directory. The application is configured for these fonts:

- `NotoSansBengali-Regular.ttf`
- `SolaimanLipi.ttf`
- `Kalpurush.ttf`
- `AdorshoLipi.ttf`
- `Nikosh.ttf`

See `/public/fonts/README.md` for download sources.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

1. **Write Markdown** - Use the left editor panel to write your markdown content
2. **Preview** - See the rendered markdown in the right preview panel
3. **Select Font** - Choose your preferred Bangla font from the dropdown
4. **Download PDF** - Click "Download as PDF" to generate and download your document

## Customization

### Adding More Fonts

Edit `src/utils/pdf.ts` and add your font to the `BANGLA_FONTS` array:

```typescript
export const BANGLA_FONTS: BanglaFont[] = [
  {
    name: "YourFontName",
    label: "Display Name for Dropdown",
    path: "/fonts/YourFontFile.ttf",
  },
  // ... other fonts
];
```

### Modifying Markdown Parser

The PDF markdown parser is in `src/components/PDFDocument.tsx`. You can extend it to support more markdown features:

- Tables
- Images
- Custom styling
- Advanced formatting

### Styling

- Edit `src/app/globals.css` for global styles
- Modify Tailwind classes in `src/app/page.tsx` for UI changes
- Adjust PDF styles in `src/components/PDFDocument.tsx`

## Dependencies

```json
{
  "react-simplemde-editor": "Markdown editor",
  "easymde": "SimpleMDE dependency",
  "react-markdown": "Markdown renderer",
  "@react-pdf/renderer": "PDF generation",
  "file-saver": "File download utility"
}
```

## Notes

- All PDF generation happens **client-side** - no server API needed
- Fonts must be in `.ttf` format (not `.otf` or `.woff`)
- Font files are not included - you must download and add them
- The markdown parser in PDFDocument.tsx is simplified - extend it for production use

## License

This project is open source and available under the MIT License.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React PDF Documentation](https://react-pdf.org/)
- [SimpleMDE Documentation](https://github.com/sparksuite/simplemde-markdown-editor)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
