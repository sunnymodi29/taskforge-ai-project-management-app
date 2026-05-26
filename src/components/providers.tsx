"use client";

import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { DocumentTitle } from "@/components/document-title";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <DocumentTitle />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
