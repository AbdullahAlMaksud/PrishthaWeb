import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t bg-background/95 py-4">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Abdullah Al Maksud. All rights reserved.
      </div>
    </footer>
  );
};
