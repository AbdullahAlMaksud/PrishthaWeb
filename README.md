# PrishthaWeb

A modern, high-performance web editor built with Next.js, React 19, Tailwind CSS 4, and TypeScript. It supports both plain text editing and block-based rich text editing (powered by Slate.js and Editor.js), client-side PDF export with Bangla font support, keyboard sound typing effects, and localized file persistence.

## Features

### Plain Text Editor
- 📝 Title and description input fields.
- 💾 Auto-save integration with local storage.
- 🔊 Typing sound effect (toggleable) with audio pre-loading.
- 💾 Instant export as `.txt`.
- 📊 Character and word counters.

### Rich Text Editor
- 💎 Rich block-based text formatting.
- 🖋️ Supports headings, lists, quotes, tables, and alignment controls.
- 🎨 Fine-grained text color and background color controls with opacity.
- 👁️ Live preview panel.
- 📄 Real-time client-side PDF generation using `@react-pdf/renderer` with support for multiple Bangla fonts.
- 💾 Local storage auto-saving.

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Library:** React 19
- **Styling:** Tailwind CSS 4
- **Editors:** Slate.js & Editor.js
- **PDF Export:** `@react-pdf/renderer`, `jsPDF`, `html2canvas`
- **Package Manager:** Bun (Mandatory)

## Project Structure

The project follows a strictly modular layout under the `src` directory to keep files clean and maintainable (max 200 lines per component):

```
src/
├── app/                  # Next.js App Router (pages, layout, globals.css)
├── components/           # UI and shared components (navbar, footer, sidebar, pdf-document)
├── features/             # Modular feature components and helpers
│   ├── plain-text-editor/  # Plain text editor interface and export options
│   └── rich-text-editor/   # Slate and EditorJS interfaces, toolbars, color/font pickers
└── shared/               # Reusable hooks, libraries, storage mechanisms, and type declarations
    ├── hooks/            # Keyboard sounds and custom UI hooks
    ├── lib/              # PDF helper, utility wrappers, and local storage adapters
    └── types/            # Global type definitions
```

## Getting Started

### Prerequisites
Make sure you have [Bun](https://bun.sh/) installed:
```bash
bun --version
```

### 1. Install Dependencies
```bash
bun install
```

### 2. Configure Bangla Fonts
Place your Bangla font files (in `.ttf` format) under `public/fonts/`. The application expects fonts like:
- `NotoSansBengali-Regular.ttf`
- `SolaimanLipi.ttf`
- `Kalpurush.ttf`
- `AdorshoLipi.ttf`
- `Nikosh.ttf`

Check `public/fonts/README.md` for specific download links and details.

### 3. Run the Development Server
```bash
bun dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to test the application.

## Build and Production

To verify compilation and check for errors:
```bash
bun x tsc --noEmit
```

To create a production build:
```bash
bun run build
```

## License
MIT License
