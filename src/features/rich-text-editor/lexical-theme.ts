export const lexicalTheme = {
  ltr: "text-left",
  rtl: "text-right",
  placeholder: "text-muted-foreground absolute top-0 left-0 pointer-events-none select-none text-lg",
  paragraph: "mb-2 last:mb-0 text-lg leading-relaxed text-foreground",
  quote: "border-l-4 border-primary/40 pl-4 italic text-muted-foreground my-4",
  heading: {
    h1: "text-3xl font-extrabold text-foreground mb-4 mt-2",
    h2: "text-2xl font-bold text-foreground mb-3 mt-2",
    h3: "text-xl font-bold text-foreground mb-2 mt-2",
  },
  list: {
    nested: {
      listitem: "list-none",
    },
    ol: "list-decimal pl-6 mb-4 space-y-1 text-foreground",
    ul: "list-disc pl-6 mb-4 space-y-1 text-foreground",
    listitem: "text-lg leading-relaxed",
  },
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    underlineStrikethrough: "underline line-through",
    code: "bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-mono text-sm border border-border/40",
  },
};
